'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

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
  subscription_period: 'monthly' | 'yearly' | null;
  subscription_start: string | null;
  subscription_end: string | null;
  metadata: {
    product_name?: string;
    subscription_period?: 'monthly' | 'yearly';
  };
}

export default function PaymentSuccessClient() {
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const router = useRouter();
  const supabase = createClient();

  // 检查登录状态
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('User not authenticated, redirecting to login');
        if (orderId) {
          router.push(`/signin?redirect=/payment/success?orderId=${orderId}`);
        } else {
          router.push('/signin?redirect=/payment/success');
        }
        return;
      }

      setIsAuthenticated(true);
    };

    checkAuth();
  }, [orderId, router, supabase]);

  // 查询交易记录
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!isAuthenticated) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('您的登录会话已过期，请重新登录');
        setLoading(false);
        return;
      }

      try {
        let data: Transaction | null = null;
        let error: any = null;

        if (orderId) {
          const result = await supabase
            .from('alipay_transactions')
            .select('*')
            .eq('out_trade_no', orderId)
            .eq('user_id', session.user.id)
            .single();
          data = result.data as Transaction | null;
          error = result.error;
        } else {
          const result = await supabase
            .from('alipay_transactions')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          data = result.data as Transaction | null;
          error = result.error;
        }

        if (error) {
          throw error;
        }

        if (!data) {
          setError('未找到交易记录');
        } else {
          setTransaction(data);

          // 如果仍在待支付状态，则主动查询支付宝并刷新本地记录
          if (data.status === 'pending') {
            const targetOrderId = orderId || data.out_trade_no;
            const intervalId = setInterval(async () => {
              try {
                const res = await fetch(
                  `/api/checkout/providers/alipay/status?outTradeNo=${targetOrderId}`
                );
                if (!res.ok) return;
                const result = await res.json();

                if (result.status === 'success' && result.transaction) {
                  setTransaction(result.transaction as Transaction);
                  clearInterval(intervalId);
                }
              } catch (err) {
                console.error('查询支付状态失败:', err);
              }
            }, 5000);

            return () => clearInterval(intervalId);
          }
        }
      } catch (error: any) {
        console.error('获取交易信息失败:', error);
        setError(error.message || '获取交易信息失败');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [isAuthenticated, orderId, supabase]);

  const getSubscriptionLabel = (transaction: Transaction) => {
    const period =
      transaction.subscription_period ||
      transaction.metadata?.subscription_period ||
      (transaction.product_id.includes('yearly')
        ? 'yearly'
        : transaction.product_id.includes('monthly')
        ? 'monthly'
        : null);

    if (period === 'yearly') return '年付订阅';
    if (period === 'monthly') return '月付订阅';
    return '一次性购买';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="pt-32 pb-12 md:pt-40 md:pb-20">
        <div className="max-w-3xl mx-auto text-center">
          {loading ? (
            <div className="text-center">
              <h1 className="h2 mb-4">正在处理您的支付...</h1>
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center">
              <h1 className="h2 mb-4">支付处理出错</h1>
              <p className="text-lg text-gray-600 mb-8">{error}</p>
              <Link
                href="/"
                className="btn text-white bg-blue-600 hover:bg-blue-700"
              >
                返回购买页面
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="h2 mb-4">
                {transaction?.status === 'success' ? '支付成功！' : '支付处理中'}
              </h1>

              {transaction?.status === 'success' ? (
                <>
                  <p className="text-lg text-gray-600 mb-8">
                    感谢您的购买！您的订单已成功处理。
                  </p>
                  <div className="bg-gray-50 p-6 rounded-lg mb-8">
                    <h3 className="font-semibold text-lg mb-2">订单详情</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      <div>
                        <p className="text-sm text-gray-500">产品</p>
                        <p>{transaction.metadata?.product_name || transaction.product_name || '未知产品'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">金额</p>
                        <p>¥{parseFloat(String(transaction.amount)).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">订单号</p>
                        <p>{transaction.out_trade_no}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">支付宝交易号</p>
                        <p>{transaction.trade_no || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">日期</p>
                        <p>{new Date(transaction.created_at).toLocaleDateString()}</p>
                      </div>
                      {getSubscriptionLabel(transaction) && (
                        <div>
                          <p className="text-sm text-gray-500">购买类型</p>
                          <p>{getSubscriptionLabel(transaction)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                    <Link
                      href="/dashboard"
                      className="btn text-white bg-blue-600 hover:bg-blue-700"
                    >
                      进入控制台
                    </Link>
                    <Link
                      href="/"
                      className="btn text-gray-600 bg-gray-100 hover:bg-gray-200"
                    >
                      返回购买页面
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-lg text-gray-600 mb-8">
                    您的支付正在处理中，请稍后查看订单状态。
                  </p>
                  <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                    <Link
                      href="/dashboard"
                      className="btn text-white bg-blue-600 hover:bg-blue-700"
                    >
                      进入控制台
                    </Link>
                    <Link
                      href="/"
                      className="btn text-gray-600 bg-gray-100 hover:bg-gray-200"
                    >
                      返回购买页面
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
