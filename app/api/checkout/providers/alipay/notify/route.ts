import { NextRequest } from "next/server";
import { createServerAdminClient } from "@/utils/supabase/server";
import { createAlipaySdk, toCents, computeSubscriptionDates } from "@/utils/alipay";

export async function POST(request: NextRequest) {
  try {
    // 1. 解析支付宝 POST 的 form 数据
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.log("Alipay notify received:", params);

    // 2. 验签
    if (!createAlipaySdk().checkNotifySign(params)) {
      console.error("Invalid alipay notify signature", params);
      return new Response("fail", { status: 400 });
    }

    const { out_trade_no, trade_no, trade_status, total_amount, buyer_logon_id } =
      params;

    if (!out_trade_no || !trade_status) {
      return new Response("fail", { status: 400 });
    }

    // 3. 非成功状态直接返回 success，停止重试
    if (trade_status !== "TRADE_SUCCESS") {
      return new Response("success");
    }

    const adminClient = createServerAdminClient();

    // 4. 查询订单
    const { data: transaction, error: fetchError } = await adminClient
      .from("alipay_transactions")
      .select("*")
      .eq("out_trade_no", out_trade_no)
      .single();

    if (fetchError || !transaction) {
      console.error("Transaction not found:", out_trade_no, fetchError);
      return new Response("fail", { status: 404 });
    }

    // 5. 幂等
    if (transaction.status === "success") {
      return new Response("success");
    }

    // 6. 金额校验
    if (toCents(total_amount) !== toCents(transaction.amount)) {
      console.error(
        `Amount mismatch for ${out_trade_no}: db=${transaction.amount}, notify=${total_amount}`
      );
      return new Response("fail", { status: 400 });
    }

    // 7. 更新订单状态（带 pending 条件防止并发重复处理）
    const updateData: Record<string, unknown> = {
      status: "success",
      trade_no: trade_no || null,
      buyer_logon_id: buyer_logon_id || null,
      paid_at: new Date().toISOString(),
      notify_count: transaction.notify_count + 1,
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
        transaction.user_id,
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
      return new Response("fail", { status: 500 });
    }

    return new Response("success");
  } catch (error) {
    console.error("Alipay notify error:", error);
    return new Response("fail", { status: 500 });
  }
}
