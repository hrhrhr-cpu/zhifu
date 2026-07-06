import { NextRequest, NextResponse } from "next/server";
import {
  createServerAdminClient,
  createServerSupabaseClient,
} from "@/utils/supabase/server";
import { createAlipaySdk, ALIPAY_CONFIG, generateOrderNumber } from "@/utils/alipay";

interface PagepayRequest {
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
    const body = (await request.json()) as PagepayRequest;
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

    // 5. 生成支付宝网页支付表单
    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?orderId=${out_trade_no}`;
    const notifyUrl =
      ALIPAY_CONFIG.NOTIFY_URL ||
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/providers/alipay/notify`;

    const html = createAlipaySdk().pageExecute(
      "alipay.trade.page.pay",
      "POST",
      {
        bizContent: {
          outTradeNo: out_trade_no,
          totalAmount: amount,
          subject: productName,
          productCode: "FAST_INSTANT_TRADE_PAY",
        },
        returnUrl,
        notifyUrl,
      }
    ) as string;

    return NextResponse.json({ html, outTradeNo: out_trade_no });
  } catch (error) {
    console.error("Alipay pagepay generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate pagepay" },
      { status: 500 }
    );
  }
}
