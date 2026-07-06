import { User } from "@supabase/supabase-js";
import { unstable_noStore } from "next/cache";
import { DashboardClient } from "./index";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getSubscriptionInfo(userId: string) {
  unstable_noStore();
  const supabase = createServerSupabaseClient();
  const now = new Date();

  const { data: rows, error } = await supabase
    .from("alipay_transactions")
    .select("status, is_subscription, subscription_period, subscription_end, product_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("获取订阅信息失败:", error);
  }

  const validSubscriptions = (rows || []).filter(
    (r) =>
      r.status === "success" &&
      r.subscription_end &&
      (r.is_subscription ||
        r.product_id?.includes("monthly") ||
        r.product_id?.includes("yearly"))
  );

  if (validSubscriptions.length > 0) {
    const latest = validSubscriptions.reduce((max, r) =>
      new Date(r.subscription_end!) > new Date(max.subscription_end!)
        ? r
        : max
    );
    return {
      isActive: new Date(latest.subscription_end!) > now,
      type:
        latest.subscription_period === "yearly"
          ? "年付影视会员"
          : "月付影视会员",
      endDate: latest.subscription_end!,
    };
  }

  return {
    isActive: false,
    type: "",
    endDate: "",
  };
}

export default async function Dashboard() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?redirect=/dashboard");
  }

  const subscriptionInfo = await getSubscriptionInfo(user.id);

  return (
    <DashboardClient
      user={user as User}
      subscriptionInfo={subscriptionInfo}
    />
  );
}
