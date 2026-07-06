import { NextRequest, NextResponse } from "next/server";
import {
  createServerAdminClient,
  createServerSupabaseClient,
} from "@/utils/supabase/server";
import { createAlipaySdk, ALIPAY_CONFIG, generateOrderNumber, execWithRetry } from "@/utils/alipay";

interface QrcodeRequest {
  productId: string;
  productName: string;
  amount: string;
  isSubscription?: boolean;
  subscriptionPeriod?: "monthly" | "yearly";
}

export async function POST(request: NextRequest) {
  try {
    // 1. 校验登录
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", loginUrl: "/signin" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    // 2. 解析请求
    const body = (await request.json()) as QrcodeRequest;
    const { productId, productName, amount, isSubscription = false, subscriptionPeriod } = body;

    if (!productId || !productName || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
      return NextResponse.json(
        { error: "Invalid amount format" },
        { status: 400 }
      );
    }

    if (
      isSubscription &&
      (!subscriptionPeriod || !["monthly", "yearly"].includes(subscriptionPeriod))
    ) {
      return NextResponse.json(
        { error: "Invalid subscription period. Allowed: monthly, yearly" },
        { status: 400 }
      );
    }

    const adminClient = createServerAdminClient();
    const out_trade_no = generateOrderNumber();

    // 3. 先写入待支付记录（订阅起止时间等支付成功后再计算写入）
    const { data: transaction, error: insertError } = await adminClient
      .from("alipay_transactions")
      .insert({
        user_id: userId,
        product_id: productId,
        product_name: productName,
        amount,
        out_trade_no,
        status: "pending",
        is_subscription: isSubscription,
        subscription_period: subscriptionPeriod || null,
        subscription_start: null,
        subscription_end: null,
        metadata: {
          product_name: productName,
          subscription_period: subscriptionPeriod,
        },
      })
      .select()
      .single();

    if (insertError || !transaction) {
      console.error("Failed to create alipay transaction:", insertError);
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 }
      );
    }

    // 4. 调用支付宝当面付预创建接口
    const notifyUrl =
      ALIPAY_CONFIG.NOTIFY_URL ||
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/providers/alipay/notify`;

    const result = (await execWithRetry(() =>
      createAlipaySdk().exec("alipay.trade.precreate", {
        notify_url: notifyUrl,
        bizContent: {
          outTradeNo: out_trade_no,
          totalAmount: amount,
          subject: productName,
        },
      })
    )) as {
      code: string;
      msg: string;
      qrCode?: string;
    };

    if (result.code !== "10000" || !result.qrCode) {
      console.error("Alipay precreate failed:", result);
      await adminClient
        .from("alipay_transactions")
        .update({ status: "failed" })
        .eq("id", transaction.id);
      return NextResponse.json(
        { error: result.msg || "Alipay precreate failed", alipayResult: result },
        { status: 500 }
      );
    }

    // 5. 保存二维码链接并返回给前端
    await adminClient
      .from("alipay_transactions")
      .update({ qr_code: result.qrCode })
      .eq("id", transaction.id);

    return NextResponse.json({
      qrCode: result.qrCode,
      outTradeNo: out_trade_no,
    });
  } catch (error) {
    console.error("Alipay qrcode generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate qrcode" },
      { status: 500 }
    );
  }
}
