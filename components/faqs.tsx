export default function Faqs() {
  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20 border-b border-gray-100">
          {/* Section header */}
          <div className="pb-12 md:pb-20">
            <h2 className="h2 font-cabinet-grotesk">常见问题</h2>
          </div>
          {/* Columns */}
          <div className="md:flex md:space-x-12 space-y-8 md:space-y-0">
            {/* Column */}
            <div className="w-full md:w-1/2 space-y-8">
              {/* Item */}
              <div className="space-y-2">
                <h4 className="text-xl font-cabinet-grotesk font-bold">会员可以观看哪些内容？</h4>
                <p className="text-gray-500">涵盖热门院线、经典老片、海外佳作、独家纪录片等海量高清影片，开通会员后即可无限畅看。</p>
              </div>
              {/* Item */}
              <div className="space-y-2">
                <h4 className="text-xl font-cabinet-grotesk font-bold">购买后如何观看？</h4>
                <p className="text-gray-500">登录账号即可在网页端观看，支持手机、电脑、电视多端同步，随时随地畅享影视内容。</p>
              </div>
              {/* Item */}
              <div className="space-y-2">
                <h4 className="text-xl font-cabinet-grotesk font-bold">会员有效期是多久？</h4>
                <p className="text-gray-500">月付/年付会员在有效期内无限畅看；一次性观影包按购买时说明的有效期使用。</p>
              </div>
            </div>
            {/* Column */}
            <div className="w-full md:w-1/2 space-y-8">
              {/* Item */}
              <div className="space-y-2">
                <h4 className="text-xl font-cabinet-grotesk font-bold">影片会更新吗？</h4>
                <p className="text-gray-500">每周更新热门新片和专题策划，确保会员始终有新内容可看。</p>
              </div>
              {/* Item */}
              <div className="space-y-2">
                <h4 className="text-xl font-cabinet-grotesk font-bold">购买前须知</h4>
                <p className="text-gray-500">虚拟商品具有即时可用性，购买后不支持退换。如有问题可联系客服，我们将于工作日 24 小时内回复。</p>
              </div>
              {/* Item */}
              <div className="space-y-2">
                <h4 className="text-xl font-cabinet-grotesk font-bold">可以分享给朋友吗？</h4>
                <p className="text-gray-500">会员账号仅限个人使用，具体规则请查看服务条款。我们鼓励将好电影推荐给朋友，一起开通会员观影。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
