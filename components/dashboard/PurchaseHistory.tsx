"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface Transaction {
  id: string;
  created_at: string;
  product_id: string;
  product_name: string;
  amount: string | number;
  status: string;
  out_trade_no: string;
  trade_no: string | null;
  is_subscription: boolean;
  subscription_period: "monthly" | "yearly" | null;
  subscription_start: string | null;
  subscription_end: string | null;
  metadata: {
    product_name?: string;
    subscription_period?: "monthly" | "yearly";
  };
}

export default function PurchaseHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from("alipay_transactions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setTransactions((data as Transaction[]) || []);
      } catch (err: any) {
        console.error("获取交易记录失败:", err);
        setError(err.message || "获取交易记录失败");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [supabase]);

  const getSubscriptionLabel = (transaction: Transaction) => {
    const period =
      transaction.subscription_period ||
      transaction.metadata?.subscription_period ||
      (transaction.product_id.includes("yearly")
        ? "yearly"
        : transaction.product_id.includes("monthly")
        ? "monthly"
        : null);

    if (period === "yearly") return "订阅 (年付)";
    if (period === "monthly") return "订阅 (月付)";
    return "一次性购买";
  };

  const showTransactionDetails = (transaction: Transaction) => {
    alert(
      `订单详情:\n\n产品: ${
        transaction.metadata?.product_name || transaction.product_name || "未知产品"
      }\n金额: ¥${parseFloat(String(transaction.amount)).toFixed(2)}\n订单号: ${
        transaction.out_trade_no
      }\n支付宝交易号: ${transaction.trade_no || "-"}\n状态: ${
        transaction.status === "success" ? "支付成功" : "处理中"
      }\n日期: ${new Date(transaction.created_at).toLocaleDateString()}`
    );
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            支付成功
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            待支付
          </span>
        );
      case "failed":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            支付失败
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return <div className="text-center py-8">加载购买历史中...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">加载失败: {error}</div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">暂无购买记录</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          购买历史
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">您的所有交易记录</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                产品
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                日期
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                金额
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                状态
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.metadata?.product_name || transaction.product_name || "未知产品"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {getSubscriptionLabel(transaction)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ¥{parseFloat(String(transaction.amount)).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatStatus(transaction.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => showTransactionDetails(transaction)}
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    查看详情
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
