import { NextRequest, NextResponse } from "next/server";
import {
  createServerAdminClient,
  createServerSupabaseClient,
} from "@/utils/supabase/server";
import { createAlipaySdk, ALIPAY_CONFIG, generateOrderNumber } from "@/utils/alipay";
import { addMonths, addYears } from "date-fns";

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
    const now = new Date();
    const out_trade_no = generateOrderNumber();

    // 3. 订阅模式：计算 subscription_start / subscription_end
    let subscriptionStart: Date | null = null;
    let subscriptionEnd: Date | null = null;

    if (isSubscription) {
      const { data: activeSubscriptions } = await adminClient
        .from("alipay_transactions")
        .select("subscription_end")
        .eq("user_id", userId)
        .eq("status", "success")
        .eq("is_subscription", true)
        .gt("subscription_end", now.toISOString())
        .order("subscription_end", { ascending: false })
        .limit(1);

      if (activeSubscriptions && activeSubscriptions.length > 0) {
        subscriptionStart = new Date(activeSubscriptions[0].subscription_end);
      } else {
        subscriptionStart = now;
      }

      if (subscriptionPeriod === "monthly") {
        subscriptionEnd = addMonths(subscriptionStart, 1);
      } else if (subscriptionPeriod === "yearly") {
        subscriptionEnd = addYears(subscriptionStart, 1);
      }
    }

    // 4. 先写入待支付记录
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
        subscription_start: subscriptionStart ? subscriptionStart.toISOString() : null,
        subscription_end: subscriptionEnd ? subscriptionEnd.toISOString() : null,
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
