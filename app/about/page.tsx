import Link from 'next/link';

export const metadata = {
  title: '关于我们 - 影视会员',
  description: '了解全网影视会员的使命、愿景和团队',
};

export default function AboutPage() {
  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
      <div className="pt-32 pb-12 md:pt-40 md:pb-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="h1 font-playfair-display text-center mb-8">关于我们</h1>

          <div className="text-lg text-gray-600 mb-8">
            <p className="mb-4">
              欢迎来到<strong className="font-medium text-gray-900">全网影视会员</strong>！我们是一个致力于为影迷提供高品质、正版、高清影视内容的付费观影平台。
            </p>

            <h2 className="h3 font-playfair-display mb-4 mt-6">我们的使命</h2>
            <p className="mb-4">
              我们的使命是通过精选全球优质影片、打造流畅的观影体验，让每一位用户都能随时随地享受电影带来的乐趣。
            </p>

            <h2 className="h3 font-playfair-display mb-4 mt-6">我们的愿景</h2>
            <p className="mb-4">
              我们希望成为中文世界最受欢迎的影视会员平台，连接全球影迷，共同发现好电影、分享好故事。
            </p>

            <h2 className="h3 font-playfair-display mb-4 mt-6">我们的团队</h2>
            <p className="mb-4">
              我们的团队由一群热爱电影、技术和内容运营的伙伴组成。我们来自不同背景，但都有着共同的目标——为用户提供值得付费的观影体验。
            </p>

            <h2 className="h3 font-playfair-display mb-4 mt-6">我们的价值观</h2>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li><strong className="font-medium text-gray-900">正版优质</strong>：坚持精选高清、正版影视资源</li>
              <li><strong className="font-medium text-gray-900">用户至上</strong>：以流畅体验和贴心服务为核心</li>
              <li><strong className="font-medium text-gray-900">持续更新</strong>：不断丰富片库，紧跟影视潮流</li>
              <li><strong className="font-medium text-gray-900">社区共享</strong>：重视影迷反馈，与大家一起成长</li>
            </ul>

            <p className="mb-4 mt-6">
              无论你是热爱大片的影迷，还是喜欢挖掘小众佳作的观众，我们都欢迎你加入全网影视会员，一起享受电影世界！
            </p>

            <div className="flex justify-center mt-8">
              <Link href="/contact" className="btn text-white bg-blue-600 hover:bg-blue-700 mb-4 sm:mb-0">
                联系我们
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
