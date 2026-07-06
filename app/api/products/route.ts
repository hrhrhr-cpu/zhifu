import { NextResponse } from "next/server";

// 产品数据定义
interface ProductFeature {
  id: string;
  text: string;
}

interface Product {
  id: string;
  name: string;
  title: string; // 产品标题
  description: string;
  price: string;
  priceLabel: string; // 价格标签
  isSubscription: boolean;
  subscriptionPeriod?: string;
  features: ProductFeature[]; // 产品特性列表
}

// 产品数据库（实际应用中可存储在数据库中，简单产品可以写死在服务端该接口中）
const products: Record<string, Product> = {
  "basic-onetime": {
    id: "basic-onetime",
    name: "基础观影包",
    title: "基础版",
    description: "解锁部分热门影片，体验高清观影服务。",
    price: "1",
    priceLabel: "/一次性",
    isSubscription: false,
    features: [
      { id: "basic-1", text: "部分热门电影观看" },
      { id: "basic-2", text: "720P 高清画质" },
      { id: "basic-3", text: "7天有效期内观看" },
      { id: "basic-4", text: "多端同步播放" },
    ],
  },
  "pro-monthly": {
    id: "pro-monthly",
    name: "影视会员（月付）",
    title: "专业版",
    description: "解锁全站影片，畅享 1080P 高清无广告观影体验。",
    price: "10",
    priceLabel: "/月",
    isSubscription: true,
    subscriptionPeriod: "monthly",
    features: [
      { id: "pro-1", text: "全站影片无限看" },
      { id: "pro-2", text: "1080P 高清画质" },
      { id: "pro-3", text: "无广告观影" },
      { id: "pro-4", text: "手机/电脑/电视多端同步" },
      { id: "pro-5", text: "新片抢先看" },
    ],
  },
  "pro-yearly": {
    id: "pro-yearly",
    name: "影视会员（年付）",
    title: "专业版",
    description: "解锁全站影片，畅享 1080P 高清无广告观影体验。",
    price: "100",
    priceLabel: "/年",
    isSubscription: true,
    subscriptionPeriod: "yearly",
    features: [
      { id: "pro-1", text: "全站影片无限看" },
      { id: "pro-2", text: "1080P 高清画质" },
      { id: "pro-3", text: "无广告观影" },
      { id: "pro-4", text: "手机/电脑/电视多端同步" },
      { id: "pro-5", text: "新片抢先看" },
    ],
  },
};

// GET请求处理函数 - 获取所有产品
export async function GET() {
  return NextResponse.json({ products });
}
