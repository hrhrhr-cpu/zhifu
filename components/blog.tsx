import Image from "next/image";
import OotdMiniProgram from "@/public/images/ootd-miniprogoram.png";
import ZhihuChromeExtension from "@/public/images/zhihu-chrome-extension.png";
import SupabaseTutorial from "@/public/images/supabase-tutorial.png";

export default function Blog() {
  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="pb-12 md:pb-20">
            <h2 className="h2 font-cabinet-grotesk text-center md:text-left">
              最新影视资讯
            </h2>
          </div>
          {/* Posts */}
          <div className="max-w-sm mx-auto md:max-w-none grid gap-12 md:grid-cols-3 md:gap-x-6 md:gap-y-8 items-start">
            {/* 1st Post */}
            <article
              className="h-full flex flex-col space-y-5"
              data-aos="fade-down"
            >
              {/* Image */}
              <a className="block group overflow-hidden" href="#0">
                <Image
                  className="w-full aspect-[7/4] object-cover group-hover:scale-105 transition duration-700 ease-out"
                  src={OotdMiniProgram}
                  width={347}
                  height={198}
                  alt="暑期档电影推荐"
                />
              </a>
              {/* Content */}
              <div className="grow flex flex-col">
                <header>
                  <h3 className="h4 font-cabinet-grotesk font-bold mb-2">
                    <a
                      className="inline-block decoration-blue-600 decoration-2 underline-offset-2 hover:underline"
                      href="#0"
                      target="_blank"
                    >
                      2025 暑期档必看电影推荐
                    </a>
                  </h3>
                </header>
                <p className="text-gray-500 grow">
                  盘点今夏最值得走进影院的热门大片，从动作到动画一网打尽。
                </p>
                <footer className="flex items-center text-sm mt-4">
                  <a href="#0">
                    <Image
                      className="rounded-full shrink-0 mr-3"
                      src="/images/avatar.svg"
                      width={32}
                      height={32}
                      alt="作者头像"
                      unoptimized
                    />
                  </a>
                  <div>
                    <a
                      className="font-medium decoration-blue-600 decoration-2 underline-offset-2 hover:underline"
                      href="#0"
                    >
                      影视编辑
                    </a>
                  </div>
                </footer>
              </div>
            </article>
            {/* 2nd Post */}
            <article
              className="h-full flex flex-col space-y-5"
              data-aos="fade-down"
              data-aos-delay="100"
            >
              {/* Image */}
              <a className="block group overflow-hidden" href="#0">
                <Image
                  className="w-full aspect-[7/4] object-cover group-hover:scale-105 transition duration-700 ease-out"
                  src={ZhihuChromeExtension}
                  width={347}
                  height={198}
                  alt="经典电影回顾"
                />
              </a>
              {/* Content */}
              <div className="grow flex flex-col">
                <header>
                  <h3 className="h4 font-cabinet-grotesk font-bold mb-2">
                    <a
                      className="inline-block decoration-blue-600 decoration-2 underline-offset-2 hover:underline"
                      href="#0"
                      target="_blank"
                    >
                      十部值得反复观看的经典电影
                    </a>
                  </h3>
                </header>
                <p className="text-gray-500 grow">
                  这些影史经典无论看多少遍都有新感悟，适合周末静静品味。
                </p>
                <footer className="flex items-center text-sm mt-4">
                  <a href="#0">
                    <Image
                      className="rounded-full shrink-0 mr-3"
                      src="/images/avatar.svg"
                      width={32}
                      height={32}
                      alt="作者头像"
                      unoptimized
                    />
                  </a>
                  <div>
                    <a
                      className="font-medium decoration-blue-600 decoration-2 underline-offset-2 hover:underline"
                      href="#0"
                    >
                      影视编辑
                    </a>
                  </div>
                </footer>
              </div>
            </article>
            {/* 3rd Post */}
            <article
              className="h-full flex flex-col space-y-5"
              data-aos="fade-down"
              data-aos-delay="200"
            >
              {/* Image */}
              <a className="block group overflow-hidden" href="#0">
                <Image
                  className="w-full aspect-[7/4] object-cover group-hover:scale-105 transition duration-700 ease-out"
                  src={SupabaseTutorial}
                  width={347}
                  height={198}
                  alt="家庭观影指南"
                />
              </a>
              {/* Content */}
              <div className="grow flex flex-col">
                <header>
                  <h3 className="h4 font-cabinet-grotesk font-bold mb-2">
                    <a
                      className="inline-block decoration-blue-600 decoration-2 underline-offset-2 hover:underline"
                      href="#0"
                      target="_blank"
                    >
                      适合全家一起看的温情电影
                    </a>
                  </h3>
                </header>
                <p className="text-gray-500 grow">
                  精选温馨、励志、适合亲子共赏的影片清单，让客厅变成私人影院。
                </p>
                <footer className="flex items-center text-sm mt-4">
                  <a href="#0">
                    <Image
                      className="rounded-full shrink-0 mr-3"
                      src="/images/avatar.svg"
                      width={32}
                      height={32}
                      alt="作者头像"
                      unoptimized
                    />
                  </a>
                  <div>
                    <a
                      className="font-medium decoration-blue-600 decoration-2 underline-offset-2 hover:underline"
                      href="#0"
                    >
                      影视编辑
                    </a>
                  </div>
                </footer>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
