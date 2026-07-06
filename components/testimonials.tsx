"use client";

import { useEffect } from "react";

import Image from "next/image";
import TestimonialsImage01 from "@/public/images/notion_9.png";
import TestimonialsImage02 from "@/public/images/notion_12.png";
import TestimonialsImage03 from "@/public/images/notion_13.png";

// Import Swiper
import Swiper, { Pagination } from "swiper";
import "swiper/swiper.min.css";
import "swiper/css/pagination";
Swiper.use([Pagination]);

export default function Testimonials() {
  useEffect(() => {
    const testimonial = new Swiper(".testimonial-carousel", {
      slidesPerView: 1,
      watchSlidesProgress: true,
      pagination: {
        el: ".testimonial-carousel-pagination",
        clickable: true,
      },
    });
  }, []);

  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pb-8">
          <div className="relative">
            {/* Gray box */}
            <div
              className="absolute inset-0 bg-gray-100 rotate-2 -z-10"
              aria-hidden="true"
            />
            {/* Content */}
            <div className="relative px-6 pb-8 md:px-12 lg:pb-0">
              {/* Carousel built with Swiper.js [https://swiperjs.com/] */}
              {/* * Custom styles in src/css/additional-styles/theme.scss */}
              <div className="testimonial-carousel swiper-container">
                <div className="swiper-wrapper">
                  {/* Testimonial */}
                  <div className="swiper-slide space-y-8 lg:flex items-center lg:space-y-0 lg:space-x-8 text-center lg:text-left">
                    <div className="shrink-0 relative inline-flex">
                      <Image
                        className=" object-cover object-center"
                        src={TestimonialsImage01}
                        width={180}
                        height={180}
                        alt="影迷评价 01"
                      />
                      <div className="absolute right-0 bottom-0 mr-4 mb-6">
                        <a
                          className="flex items-center font-cabinet-grotesk font-bold decoration-blue-500 decoration-2 underline-offset-2 hover:underline px-3 py-1 bg-white  shadow-sm"
                          href="/signup"
                          target="_blank"
                        >
                          <span>@电影迷小明</span>
                        </a>
                      </div>
                    </div>
                    <div className="relative">
                      <h4 className="h3 font-cabinet-grotesk mb-4">
                        作为一个资深影迷，这里的片源更新速度很快，很多冷门佳作都能找到，会员性价比很高！
                      </h4>
                      <div>
                        <a
                          className="btn-sm text-white bg-blue-500 hover:bg-blue-600 group shadow-sm"
                          href="/signup"
                          target="_blank"
                        >
                          查看详情{" "}
                          <span className="tracking-normal text-blue-200 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">
                            -&gt;
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                  {/* Testimonial */}
                  <div className="swiper-slide space-y-8 lg:flex items-center lg:space-y-0 lg:space-x-8 text-center lg:text-left">
                    <div className="shrink-0 relative inline-flex">
                      <Image
                        className=" object-cover object-center"
                        src={TestimonialsImage02}
                        width={180}
                        height={180}
                        alt="影迷评价 02"
                      />
                      <div className="absolute right-0 bottom-0 mr-4 mb-6">
                        <a
                          className="flex items-center font-cabinet-grotesk font-bold decoration-blue-500 decoration-2 underline-offset-2 hover:underline px-3 py-1 bg-white  shadow-sm"
                          href="/signup"
                          target="_blank"
                        >
                          <span>@追剧达人</span>
                        </a>
                      </div>
                    </div>
                    <div className="relative">
                      <h4 className="h3 font-cabinet-grotesk mb-4">
                        画质清晰、播放流畅，最重要的是没有广告，周末宅家看电影太舒服了。
                      </h4>
                      <div>
                        <a
                          className="btn-sm text-white bg-blue-500 hover:bg-blue-600 group shadow-sm"
                          href="/signup"
                          target="_blank"
                        >
                          查看详情{" "}
                          <span className="tracking-normal text-blue-200 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">
                            -&gt;
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                  {/* Testimonial */}
                  <div className="swiper-slide space-y-8 lg:flex items-center lg:space-y-0 lg:space-x-8 text-center lg:text-left">
                    <div className="shrink-0 relative inline-flex">
                      <Image
                        className=" object-cover object-center"
                        src={TestimonialsImage03}
                        width={180}
                        height={180}
                        alt="影迷评价 03"
                      />
                      <div className="absolute right-0 bottom-0 mr-4 mb-6">
                        <a
                          className="flex items-center font-cabinet-grotesk font-bold decoration-blue-500 decoration-2 underline-offset-2 hover:underline px-3 py-1 bg-white  shadow-sm"
                          href="/signup"
                          target="_blank"
                        >
                          <span>@王老师</span>
                        </a>
                      </div>
                    </div>
                    <div className="relative">
                      <h4 className="h3 font-cabinet-grotesk mb-4">
                        平台的纪录片和经典专栏质量非常高，让我重新认识了电影的魅力，非常适合各年龄段观众。
                      </h4>
                      <div>
                        <a
                          className="btn-sm text-white bg-blue-500 hover:bg-blue-600 group shadow-sm"
                          href="/signup"
                          target="_blank"
                        >
                          查看详情{" "}
                          <span className="tracking-normal text-blue-200 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">
                            -&gt;
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Bullets */}
              <div className="mt-4 lg:absolute bottom-0 right-0 lg:mt-0 lg:mr-12 lg:mb-16 z-10">
                <div className="testimonial-carousel-pagination text-center" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
