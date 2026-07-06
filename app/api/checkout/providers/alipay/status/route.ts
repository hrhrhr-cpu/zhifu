import { NextRequest, NextResponse } from "next/server";
import {
  createServerAdminClient,
  createServerSupabaseClient,
} from "@/utils/supabase/server";
import { createAlipaySdk, toCents, execWithRetry, computeSubscriptionDates } from "@/utils/alipay";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const outTradeNo = request.nextUrl.searchParams.get("outTradeNo");
    if (!outTradeNo) {
      return NextResponse.json(
        { error: "Missing outTradeNo" },
        { status: 400 }
      );
    }

    const adminClient = createServerAdminClient();

    const { data: transaction, error: fetchError } = await adminClient
      .from("alipay_transactions")
      .select("*")
      .eq("out_trade_no", outTradeNo)
      .eq("user_id", session.user.id)
      .single();

    if (fetchError || !transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.status === "success") {
      return NextResponse.json({ status: "success", transaction });
    }

    // 向支付宝查询最新状态（本地开发收不到异步通知时用轮询兜底）
    const result = (await execWithRetry(() =>
      createAlipaySdk().exec("alipay.trade.query", {
        bizContent: {
          outTradeNo,
        },
      })
    )) as {
      code: string;
      tradeStatus?: string;
      totalAmount?: string;
      tradeNo?: string;
      buyerLogonId?: string;
    };

    if (result.code === "10000" && result.tradeStatus === "TRADE_SUCCESS") {
      if (toCents(result.totalAmount!) !== toCents(transaction.amount)) {
        console.error(
          `Amount mismatch for ${outTradeNo}: db=${transaction.amount}, alipay=${result.totalAmount}`
        );
        return NextResponse.json(
          { status: "amount_mismatch" },
          { status: 400 }
        );
      }

      const updateData: Record<string, unknown> = {
        status: "success",
        trade_no: result.tradeNo,
        buyer_logon_id: result.buyerLogonId,
        paid_at: new Date().toISOString(),
      };

      // 订阅订单：支付成功时才计算起止时间，并自动续期
      if (
        transaction.is_subscription &&
        transaction.subscription_period &&
        (transaction.subscription_period === "monthly" ||
          transaction.subscription_period === "yearly") &&
        !transaction.subscription_start
      ) {
        const { start, end } = await computeSubscriptionDates(
          adminClient,
          session.user.id,
          transaction.subscription_period
        );
        updateData.subscription_start = start;
        updateData.subscription_end = end;
      }

      const { error: updateError } = await adminClient
        .from("alipay_transactions")
        .update(updateData)
        .eq("id", transaction.id)
        .eq("status", "pending");

      if (updateError) {
        console.error("Failed to update transaction:", updateError);
        return NextResponse.json(
          { status: "error" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        status: "success",
        transaction: {
          ...transaction,
          status: "success",
          trade_no: result.tradeNo,
          buyer_logon_id: result.buyerLogonId,
          subscription_start: updateData.subscription_start ?? transaction.subscription_start,
          subscription_end: updateData.subscription_end ?? transaction.subscription_end,
        },
      });
    }

    return NextResponse.json({ status: transaction.status, transaction });
  } catch (error) {
    console.error("Alipay status query error:", error);
    return NextResponse.json(
      { error: "Failed to query status" },
      { status: 500 }
    );
  }
}
