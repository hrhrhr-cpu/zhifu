"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import PurchaseHistory from "@/components/dashboard/PurchaseHistory";

interface DashboardClientProps {
  user?: User | null;
  subscriptionInfo?: {
    isActive: boolean;
    type: string;
    endDate: string;
  } | null;
}

export default function DashboardClient({ user, subscriptionInfo }: DashboardClientProps) {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState(subscriptionInfo);
  const supabase = createClient();

  // 如果props中的user为undefined，尝试从客户端获取用户
  useEffect(() => {
    const getUserFromClient = async () => {
      console.log("user", user);
      if (user) {
        setCurrentUser(user);
        setLoading(false);
        return;
      }

      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        setCurrentUser(authUser);
      } catch (error) {
        console.error("获取用户信息失败:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserFromClient();
  }, [user, supabase]);

  // 客户端再查一次最新订阅，避免服务端缓存导致显示旧数据
  useEffect(() => {
    if (!currentUser) return;

    const fetchLatestSubscription = async () => {
      const now = new Date();
      const { data: rows, error } = await supabase
        .from("alipay_transactions")
        .select("status, is_subscription, subscription_period, subscription_end, product_id")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("客户端获取订阅信息失败:", error);
        return;
      }

      console.log("订阅原始数据:", rows);

      const validSubscriptions = (rows || []).filter(
        (r) =>
          r.status === "success" &&
          r.subscription_end &&
          (r.is_subscription ||
            r.product_id?.includes("monthly") ||
            r.product_id?.includes("yearly"))
      );

      console.log("有效订阅:", validSubscriptions);

      if (validSubscriptions.length > 0) {
        const latest = validSubscriptions.reduce((max, r) =>
          new Date(r.subscription_end!) > new Date(max.subscription_end!)
            ? r
            : max
        );
        setSubscription({
          isActive: new Date(latest.subscription_end!) > now,
          type:
            latest.subscription_period === "yearly"
              ? "年付影视会员"
              : "月付影视会员",
          endDate: latest.subscription_end!,
        });
      } else {
        setSubscription({ isActive: false, type: "", endDate: "" });
      }
    };

    fetchLatestSubscription();
  }, [currentUser, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // 显示加载状态
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center min-h-[40vh]">
          <p className="text-gray-500">加载用户信息中...</p>
        </div>
      </div>
    );
  }

  // 用户未登录
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col justify-center items-center min-h-[40vh]">
          <p className="text-gray-500 mb-4">您尚未登录或会话已过期</p>
          <Link
            href="/signin?redirect=/dashboard"
            className="btn-sm text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 用户信息 */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start">
          <div>
            <h2 className="h3 font-cabinet-grotesk mb-2">个人信息</h2>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">邮箱:</span> {currentUser.email}
            </p>
            {subscription && (
              <div className="mt-2 text-gray-600">
                <p className="mb-1">
                  <span className="font-medium">客户类型:</span>{" "}
                  {subscription.isActive
                    ? subscription.type
                    : "普通用户"}
                </p>
                <p className="mb-1">
                  <span className="font-medium">订阅状态:</span>{" "}
                  {subscription.isActive ? (
                    <span className="text-green-600">订阅中</span>
                  ) : (
                    <span className="text-gray-500">未订阅</span>
                  )}
                </p>
                {subscription.isActive ? (
                  <p className="mb-1">
                    <span className="font-medium">到期时间:</span>{" "}
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="mb-1">
                    <span className="font-medium">到期时间:</span>{" "}-
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleSignOut}
              className="btn-sm text-white bg-red-500 hover:bg-red-600 shadow-sm"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>

      {/* 购买历史 */}
      <div className="mb-8">
        <PurchaseHistory />
      </div>
    </div>
  );
}
