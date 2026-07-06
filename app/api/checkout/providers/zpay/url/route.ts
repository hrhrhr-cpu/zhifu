import { NextRequest, NextResponse } from "next/server";
import {
  createServerAdminClient,
  createServerSupabaseClient,
} from "@/utils/supabase/server";
import { ZPAY_CONFIG, generateOrderNumber, generatePaymentUrl } from "@/utils/zpay";
import { addMonths, addYears } from "date-fns";

interface CheckoutUrlRequest {
  productId: string;
  productName: string;
  amount: string;
  paymentMethod: "alipay" | "wxpay";
  isSubscription?: boolean;
  subscriptionPeriod?: "monthly" | "yearly";
}

export async function POST(request: NextRequest) {
  try {
    // 1. 校验登录状态
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

    // 2. 解析并校验请求体
    const body = (await request.json()) as CheckoutUrlRequest;
    const {
      productId,
      productName,
      amount,
      paymentMethod = "alipay",
      isSubscription = false,
      subscriptionPeriod,
    } = body;

    if (!productId || !productName || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: productId, productName, amount" },
        { status: 400 }
      );
    }

    if (!["alipay", "wxpay"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method. Allowed: alipay, wxpay" },
        { status: 400 }
      );
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
      return NextResponse.json(
        { error: "Invalid amount format. Max 2 decimal places" },
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

    // 3. 订阅模式：计算 subscription_start / subscription_end
    let subscriptionStart: Date | null = null;
    let subscriptionEnd: Date | null = null;

    if (isSubscription) {
      const { data: activeSubscriptions } = await adminClient
        .from("zpay_transactions")
        .select("subscription_end")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .eq("status", "success")
        .eq("is_subscription", true)
        .gt("subscription_end", now.toISOString())
        .order("subscription_end", { ascending: false })
        .limit(1);

      if (activeSubscriptions && activeSubscriptions.length > 0) {
        // 已有有效订阅，从上一个订阅结束时间开始累加
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

    // 4. 生成商户订单号并写入待支付记录
    const out_trade_no = generateOrderNumber();
    const param = isSubscription ? `subscription_${subscriptionPeriod}` : "onetime";

    const { data: transaction, error: insertError } = await adminClient
      .from("zpay_transactions")
      .insert({
        user_id: userId,
        product_id: productId,
        product_name: productName,
        amount,
        payment_method: paymentMethod,
        out_trade_no,
        status: "pending",
        is_subscription: isSubscription,
        subscription_period: subscriptionPeriod || null,
        subscription_start: subscriptionStart ? subscriptionStart.toISOString() : null,
        subscription_end: subscriptionEnd ? subscriptionEnd.toISOString() : null,
        param,
        metadata: {
          product_name: productName,
          subscription_period: subscriptionPeriod,
        },
      })
      .select()
      .single();

    if (insertError || !transaction) {
      console.error("Failed to create transaction:", insertError);
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 }
      );
    }

    // 5. 拼装 ZPAY 页面跳转支付链接（按照开发文档参数签名）
    const baseUrl = ZPAY_CONFIG.BASE_URL;
    const paymentParams = {
      pid: ZPAY_CONFIG.PID,
      money: amount,
      name: productName,
      out_trade_no,
      notify_url: `${baseUrl}/api/checkout/providers/zpay/webhook`,
      // 严格按照文档：return_url 不支持带参数
      return_url: `${baseUrl}/payment/success`,
      type: paymentMethod,
      param,
    };

    const paymentUrl = generatePaymentUrl(paymentParams, ZPAY_CONFIG.KEY);

    return NextResponse.json({ url: paymentUrl, orderId: out_trade_no });
  } catch (error) {
    console.error("Payment URL generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate payment URL" },
      { status: 500 }
    );
  }
}
