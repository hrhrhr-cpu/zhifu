import { AlipaySdk } from "alipay-sdk";
import { SupabaseClient } from "@supabase/supabase-js";
import { addMonths, addYears } from "date-fns";

export function formatKey(
  key: string,
  header: string,
  footer: string
): string {
  if (!key) return "";
  if (key.includes(header)) return key;

  // 去掉所有空白，再每 64 字符折行
  const cleaned = key.replace(/\s+/g, "");
  const chunks = cleaned.match(/.{1,64}/g) || [];
  return `${header}\n${chunks.join("\n")}\n${footer}`;
}

export function formatPrivateKey(key: string): string {
  if (!key) return "";
  if (key.includes("BEGIN PRIVATE KEY") || key.includes("BEGIN RSA PRIVATE KEY")) {
    return key;
  }

  // 支付宝 JAVA 格式导出的是 PKCS#8，非 JAVA 格式是 PKCS#1
  const cleaned = key.replace(/\s+/g, "");
  const isPkcs8 = cleaned.startsWith("MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBK");

  if (isPkcs8) {
    return formatKey(
      key,
      "-----BEGIN PRIVATE KEY-----",
      "-----END PRIVATE KEY-----"
    );
  }

  return formatKey(
    key,
    "-----BEGIN RSA PRIVATE KEY-----",
    "-----END RSA PRIVATE KEY-----"
  );
}

export function formatPublicKey(key: string): string {
  return formatKey(key, "-----BEGIN PUBLIC KEY-----", "-----END PUBLIC KEY-----");
}

export function createAlipaySdk() {
  return new AlipaySdk({
    appId: process.env.ALIPAY_APP_ID || "",
    privateKey: formatPrivateKey(process.env.ALIPAY_PRIVATE_KEY || ""),
    alipayPublicKey: formatPublicKey(process.env.ALIPAY_PUBLIC_KEY || ""),
    gateway:
      process.env.ALIPAY_GATEWAY || "https://openapi.alipaydev.com/gateway.do",
    signType: "RSA2",
    timeout: 30000,
  });
}

// 兼容旧代码：建议使用 createAlipaySdk() 以避免环境变量缓存
export const alipaySdk = createAlipaySdk();

export const ALIPAY_CONFIG = {
  APP_ID: process.env.ALIPAY_APP_ID || "",
  GATEWAY:
    process.env.ALIPAY_GATEWAY || "https://openapi.alipaydev.com/gateway.do",
  NOTIFY_URL: process.env.ALIPAY_NOTIFY_URL || "",
};

// 生成唯一商户订单号：YYYYMMDDHHmmss + 3 位随机数
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const random = Math.floor(Math.random() * 900) + 100;
  return `${year}${month}${day}${hours}${minutes}${seconds}${random}`;
}

// 金额转分，避免浮点误差
export function toCents(value: string | number): number {
  return Math.round(parseFloat(String(value)) * 100);
}

// 根据当前已有有效订阅，计算新订阅的起止时间（续期或新开）
export async function computeSubscriptionDates(
  adminClient: SupabaseClient<any, "public", any>,
  userId: string,
  period: "monthly" | "yearly"
): Promise<{ start: string; end: string }> {
  const now = new Date();

  const { data: activeSubscriptions } = await adminClient
    .from("alipay_transactions")
    .select("subscription_end")
    .eq("user_id", userId)
    .eq("status", "success")
    .eq("is_subscription", true)
    .gt("subscription_end", now.toISOString())
    .order("subscription_end", { ascending: false })
    .limit(1);

  const start = activeSubscriptions?.[0]?.subscription_end
    ? new Date(activeSubscriptions[0].subscription_end)
    : now;

  const end = period === "monthly" ? addMonths(start, 1) : addYears(start, 1);

  return { start: start.toISOString(), end: end.toISOString() };
}

// 支付宝沙箱网关不太稳定，对超时/504 等网络错误做重试
export async function execWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const msg = error instanceof Error ? error.message : String(error);
      const retryable = /timeout|504|503|502|HttpClient|ECONNRESET|ETIMEDOUT/i.test(msg);
      if (!retryable || i === retries - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw lastError;
}
