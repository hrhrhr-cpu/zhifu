import { NextRequest } from "next/server";
import { createServerAdminClient } from "@/utils/supabase/server";
import { ZPAY_CONFIG, verifySign } from "@/utils/zpay";

interface ZpayNotifyParams {
  pid: string;
  name: string;
  money: string;
  out_trade_no: string;
  trade_no: string;
  param?: string;
  trade_status: string;
  type: string;
  sign: string;
  sign_type: string;
}

// 将金额统一转换为“分”后比较，避免浮点精度问题
function toCents(value: string | number): number {
  return Math.round(parseFloat(String(value)) * 100);
}

export async function GET(request: NextRequest) {
  try {
    // 1. 解析通知参数（ZPAY 以 GET 方式回调）
    const params = Object.fromEntries(
      request.nextUrl.searchParams
    ) as unknown as ZpayNotifyParams;
    const { pid, money, out_trade_no, trade_no, trade_status, sign } = params;

    if (!pid || !money || !out_trade_no || !trade_status || !sign) {
      console.error("Missing required webhook fields:", params);
      return new Response("fail", { status: 400 });
    }

    // 2. 校验商户 ID
    if (pid !== ZPAY_CONFIG.PID) {
      console.error(`Invalid pid. Expected ${ZPAY_CONFIG.PID}, got ${pid}`);
      return new Response("fail", { status: 400 });
    }

    // 3. 签名验证
    if (!verifySign(params as Record<string, any>, ZPAY_CONFIG.KEY)) {
      console.error("Invalid webhook signature:", params);
      return new Response("fail", { status: 400 });
    }

    // 4. 非成功状态不更新业务数据，但返回 success 停止平台重试
    if (trade_status !== "TRADE_SUCCESS") {
      return new Response("success");
    }

    const adminClient = createServerAdminClient();

    // 5. 查询商户订单
    const { data: transaction, error: fetchError } = await adminClient
      .from("zpay_transactions")
      .select("*")
      .eq("out_trade_no", out_trade_no)
      .single();

    if (fetchError || !transaction) {
      console.error(
        "Transaction not found:",
        out_trade_no,
        fetchError?.message
      );
      return new Response("fail", { status: 404 });
    }

    // 6. 幂等：已处理过的订单直接返回 success
    if (transaction.status === "success") {
      return new Response("success");
    }

    // 7. 金额一致性校验（防止假通知）
    if (toCents(transaction.amount) !== toCents(money)) {
      console.error(
        `Amount mismatch for ${out_trade_no}: db=${transaction.amount}, notify=${money}`
      );
      return new Response("fail", { status: 400 });
    }

    // 8. 更新订单状态：使用 status='pending' 条件实现并发控制，避免重复处理
    const { error: updateError } = await adminClient
      .from("zpay_transactions")
      .update({
        status: "success",
        trade_no: trade_no || null,
        paid_at: new Date().toISOString(),
        notify_count: transaction.notify_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id)
      .eq("status", "pending");

    if (updateError) {
      console.error("Failed to update transaction:", updateError);
      return new Response("fail", { status: 500 });
    }

    // 9. 必须返回纯文本 success，否则平台会继续重发通知
    return new Response("success");
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("fail", { status: 500 });
  }
}
