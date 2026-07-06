"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { QRCodeSVG } from "qrcode.react";

interface ProductFeature {
  id: string;
  text: string;
}

interface Product {
  id: string;
  name: string;
  title: string;
  description: string;
  price: string;
  priceLabel: string;
  isSubscription: boolean;
  subscriptionPeriod?: string;
  features: ProductFeature[];
}

export default function Pricing() {
  const [annual, setAnnual] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);

  // 支付弹窗状态
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"qrcode" | "pagepay" | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [outTradeNo, setOutTradeNo] = useState<string | null>(null);
  const [payStatus, setPayStatus] = useState<"pending" | "success" | "error">("pending");
  const [payMessage, setPayMessage] = useState("请使用支付宝扫码支付");

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    checkUser();
  }, [supabase]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error("获取产品信息失败:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 轮询支付结果（仅扫码支付）
  useEffect(() => {
    if (!outTradeNo || payStatus === "success" || !showPaymentModal || paymentMethod !== "qrcode") return;

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/providers/alipay/status?outTradeNo=${outTradeNo}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "success") {
          setPayStatus("success");
          setPayMessage("支付成功！");
          clearInterval(intervalId);
          // 2 秒后跳转到控制台
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        }
      } catch (error) {
        console.error("轮询支付状态失败:", error);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [outTradeNo, payStatus, showPaymentModal, paymentMethod, router]);

  const handlePayment = async (productId: string) => {
    if (!userId) {
      router.push("/signin?redirect=/");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/signin?redirect=/");
      return;
    }

    setSelectedProductId(productId);
    setPaymentMethod(null);
    setQrCode(null);
    setOutTradeNo(null);
    setPayStatus("pending");
    setPayMessage("请使用支付宝扫码支付");
    setShowPaymentModal(true);
  };

  const startQrPayment = async () => {
    const productId = selectedProductId;
    if (!productId) return;
    const product = products[productId];
    if (!product) return;

    setPaymentMethod("qrcode");
    setLoading(true);

    try {
      const response = await fetch("/api/checkout/providers/alipay/qrcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          amount: product.price,
          isSubscription: product.isSubscription,
          subscriptionPeriod: product.subscriptionPeriod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "获取支付二维码失败");
      }

      const { qrCode, outTradeNo } = await response.json();
      setQrCode(qrCode);
      setOutTradeNo(outTradeNo);
    } catch (error) {
      console.error("扫码支付处理失败:", error);
      alert(`扫码支付处理失败: ${error instanceof Error ? error.message : "未知错误"}`);
      setPaymentMethod(null);
    } finally {
      setLoading(false);
    }
  };

  const startPagePayment = async () => {
    const productId = selectedProductId;
    if (!productId) return;
    const product = products[productId];
    if (!product) return;

    setPaymentMethod("pagepay");
    setLoading(true);

    try {
      const response = await fetch("/api/checkout/providers/alipay/pagepay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          amount: product.price,
          isSubscription: product.isSubscription,
          subscriptionPeriod: product.subscriptionPeriod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "获取网页支付表单失败");
      }

      const { html } = await response.json();

      // 在当前页写入支付宝自动提交表单，跳转至支付宝收银台
      document.open();
      document.write(html);
      document.close();
    } catch (error) {
      console.error("网页支付处理失败:", error);
      alert(`网页支付处理失败: ${error instanceof Error ? error.message : "未知错误"}`);
      setPaymentMethod(null);
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="relative border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-12 md:py-20 text-center">
            <p>加载会员套餐中...</p>
          </div>
        </div>
      </section>
    );
  }

  const basicProduct = products["basic-onetime"];
  const proProduct = annual ? products["pro-yearly"] : products["pro-monthly"];

  return (
    <section className="relative border-t border-gray-100">
      <div
        className="absolute top-0 left-0 right-0 bg-gradient-to-b from-gray-50 to-white h-1/2 pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
            <h2 className="h2 font-cabinet-grotesk">开通会员，畅看全站电影</h2>
          </div>

          <div>
            <div className="flex justify-center max-w-[18rem] m-auto mb-8 lg:mb-16">
              <div className="relative flex w-full mx-6 p-1 bg-gray-200 rounded-full">
                <span className="absolute inset-0 m-1 pointer-events-none" aria-hidden="true">
                  <span
                    className={`absolute inset-0 w-1/2 bg-white rounded-full shadow transform transition duration-150 ease-in-out ${
                      annual ? "translate-x-0" : "translate-x-full"
                    }`}
                  />
                </span>
                <button
                  className={`relative flex-1 text-sm font-medium p-1 transition duration-150 ease-in-out ${
                    annual && "text-gray-500"
                  }`}
                  onClick={() => setAnnual(true)}
                >
                  年付
                </button>
                <button
                  className={`relative flex-1 text-sm font-medium p-1 transition duration-150 ease-in-out ${
                    annual && "text-gray-500"
                  }`}
                  onClick={() => setAnnual(false)}
                >
                  月付
                </button>
              </div>
            </div>

            <div className="max-w-sm mx-auto grid gap-8 lg:grid-cols-2 lg:gap-6 items-start lg:max-w-3xl pt-4">
              {basicProduct && (
                <div className="relative flex flex-col h-full p-6" data-aos="fade-right">
                  <div className="mb-6">
                    <div className="font-cabinet-grotesk text-xl font-semibold mb-1">
                      {basicProduct.title}
                    </div>
                    <div className="font-cabinet-grotesk inline-flex items-baseline mb-2">
                      <span className="text-3xl font-medium">¥</span>
                      <span className="text-5xl font-bold">{basicProduct.price}</span>
                      <span className="font-medium">{basicProduct.priceLabel}</span>
                    </div>
                    <div className="text-gray-500 mb-6">{basicProduct.description}</div>
                    <button
                      className="btn text-white bg-blue-600 hover:bg-blue-700 w-full shadow-sm"
                      onClick={() => handlePayment("basic-onetime")}
                      disabled={loading}
                    >
                      {loading ? "处理中..." : "立即开通"}
                    </button>
                  </div>
                  <div className="font-medium mb-4">会员权益：</div>
                  <ul className="text-gray-500 space-y-3 grow">
                    {basicProduct.features.map((feature) => (
                      <li key={feature.id} className="flex items-center">
                        <svg
                          className="w-3 h-3 fill-current text-emerald-500 mr-3 shrink-0"
                          viewBox="0 0 12 12"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                        </svg>
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {proProduct && (
                <div className="relative flex flex-col h-full p-6 bg-gray-800" data-aos="fade-left">
                  <div className="absolute top-0 right-0 mr-6 -mt-4">
                    <div className="inline-flex items-center text-sm font-semibold py-1 px-4 text-emerald-600 bg-emerald-200 rounded-full">
                      最受欢迎
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="font-cabinet-grotesk text-xl text-gray-100 font-semibold mb-1">
                      {proProduct.title}
                    </div>
                    <div className="font-cabinet-grotesk text-gray-100 inline-flex items-baseline mb-2">
                      <span className="text-3xl font-medium text-gray-400">¥</span>
                      <span className="text-5xl font-bold">{proProduct.price}</span>
                      <span className="font-medium text-gray-400">{proProduct.priceLabel}</span>
                    </div>
                    <div className="text-gray-400 mb-6">{proProduct.description}</div>
                    <button
                      className="btn text-white bg-blue-600 hover:bg-blue-700 w-full shadow-sm"
                      onClick={() => handlePayment(annual ? "pro-yearly" : "pro-monthly")}
                      disabled={loading}
                    >
                      {loading ? "处理中..." : "立即开通"}
                    </button>
                  </div>
                  <div className="font-medium text-gray-100 mb-4">高级会员额外权益：</div>
                  <ul className="text-gray-400 space-y-3 grow">
                    {proProduct.features.map((feature) => (
                      <li key={feature.id} className="flex items-center">
                        <svg
                          className="w-3 h-3 fill-current text-emerald-500 mr-3 shrink-0"
                          viewBox="0 0 12 12"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                        </svg>
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 支付弹窗 */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
            {paymentMethod === null && (
              <>
                <h3 className="h4 font-cabinet-grotesk mb-4">选择支付方式</h3>
                <p className="text-gray-500 mb-6">请选择您方便的支付宝支付方式</p>
                <div className="space-y-3">
                  <button
                    className="w-full btn text-white bg-blue-600 hover:bg-blue-700"
                    onClick={startQrPayment}
                    disabled={loading}
                  >
                    {loading ? "处理中..." : "支付宝扫码支付"}
                  </button>
                  <button
                    className="w-full btn text-blue-600 bg-blue-50 hover:bg-blue-100"
                    onClick={startPagePayment}
                    disabled={loading}
                  >
                    {loading ? "处理中..." : "支付宝网页支付"}
                  </button>
                </div>
                <button
                  className="mt-6 btn text-gray-600 bg-gray-100 hover:bg-gray-200"
                  onClick={() => setShowPaymentModal(false)}
                >
                  取消
                </button>
              </>
            )}

            {paymentMethod === "qrcode" && (
              <>
                <h3 className="h4 font-cabinet-grotesk mb-4">
                  {payStatus === "success" ? "支付成功" : "支付宝扫码支付"}
                </h3>

                {payStatus === "success" ? (
                  <div className="py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                      <svg
                        className="w-8 h-8 text-emerald-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-lg text-gray-600">{payMessage}</p>
                  </div>
                ) : (
                  <>
                    {qrCode ? (
                      <div className="flex justify-center mb-4">
                        <QRCodeSVG value={qrCode} size={200} />
                      </div>
                    ) : (
                      <p>正在生成二维码...</p>
                    )}
                    <p className="text-gray-500 mb-4">{payMessage}</p>
                    <p className="text-xs text-gray-400 mb-4">
                      订单号：{outTradeNo}
                    </p>
                  </>
                )}

                <div className="flex justify-center space-x-4">
                  {payStatus !== "success" && (
                    <Link
                      href="/dashboard"
                      className="btn text-white bg-blue-600 hover:bg-blue-700"
                    >
                      我已支付
                    </Link>
                  )}
                  <button
                    className="btn text-gray-600 bg-gray-100 hover:bg-gray-200"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    {payStatus === "success" ? "关闭" : "取消支付"}
                  </button>
                </div>
              </>
            )}

            {paymentMethod === "pagepay" && (
              <>
                <h3 className="h4 font-cabinet-grotesk mb-4">支付宝网页支付</h3>
                <div className="py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">正在跳转至支付宝收银台...</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
