"use client";

import { useEffect } from "react";
import Image from "next/image";
import Category01 from "@/public/images/category-1.png";
import Category02 from "@/public/images/category-2.png";
import Category03 from "@/public/images/category-3.png";
import Category04 from "@/public/images/category-4.png";
import Category05 from "@/public/images/category-5.png";

// Import Swiper
import Swiper, { Navigation } from "swiper";
import "swiper/swiper.min.css";
Swiper.use([Navigation]);

// 影视分类卡片数据
const carouselItems = [
  {
    id: 1,
    image: Category01,
    title: "动作冒险",
    courseCount: "50+",
    alt: "动作冒险电影",
  },
  {
    id: 2,
    image: Category02,
    title: "科幻奇幻",
    courseCount: "30+",
    alt: "科幻奇幻电影",
  },
  {
    id: 3,
    image: Category03,
    title: "爱情喜剧",
    courseCount: "40+",
    alt: "爱情喜剧电影",
  },
  {
    id: 4,
    image: Category04,
    title: "悬疑惊悚",
    courseCount: "25+",
    alt: "悬疑惊悚电影",
  },
  {
    id: 5,
    image: Category05,
    title: "经典重温",
    courseCount: "60+",
    alt: "经典重温电影",
  },
];

export default function Carousel() {
  useEffect(() => {
    const carousel = new Swiper(".carousel", {
      breakpoints: {
        320: {
          slidesPerView: 1,
        },
        640: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 4,
        },
      },
      grabCursor: true,
      loop: false,
      centeredSlides: false,
      initialSlide: 0,
      spaceBetween: 24,
      watchSlidesProgress: true,
      navigation: {
        nextEl: ".carousel-next",
        prevEl: ".carousel-prev",
      },
    });
  }, []);

  return (
    <section className="bg-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="h2 font-cabinet-grotesk text-gray-100">
              热门影视分类
            </h2>
          </div>
          {/* Carousel built with Swiper.js [https://swiperjs.com/] */}
          {/* * Custom styles in src/css/additional-styles/theme.scss */}
          <div className="carousel swiper-container max-w-sm mx-auto sm:max-w-none ">
            <div className="swiper-wrapper">
              {/* 循环渲染影视分类卡片 */}
              {carouselItems.map((item) => (
                <div
                  key={item.id}
                  className="swiper-slide h-auto flex flex-col"
                >
                  {/* Image */}
                  <Image
                    className="w-full aspect-[7/4] object-cover"
                    src={item.image}
                    width={259}
                    height={148}
                    alt={item.alt}
                  />
                  {/* White box */}
                  <div className="grow bg-white px-4 py-6">
                    {/* Title */}
                    <a
                      className="inline-block font-cabinet-grotesk font-bold text-xl decoration-blue-500 decoration-2 underline-offset-2 hover:underline"
                      href="#0"
                    >
                      {item.title}
                    </a>
                    <div className="text-sm text-gray-500 italic">
                      {item.courseCount} 部影片
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Arrows */}
          <div className="flex mt-12 space-x-4 justify-end">
            <button className="carousel-prev relative z-20 w-14 h-14 rounded-full flex items-center justify-center group bg-gray-700 hover:bg-blue-500 transition duration-150 ease-in-out">
              <span className="sr-only">上一个</span>
              <svg
                className="w-4 h-4 fill-gray-400 group-hover:fill-white transition duration-150 ease-in-out"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6.7 14.7l1.4-1.4L3.8 9H16V7H3.8l4.3-4.3-1.4-1.4L0 8z" />
              </svg>
            </button>
            <button className="carousel-next relative z-20 w-14 h-14 rounded-full flex items-center justify-center group bg-gray-700 hover:bg-blue-500 transition duration-150 ease-in-out">
              <span className="sr-only">下一个</span>
              <svg
                className="w-4 h-4 fill-gray-400 group-hover:fill-white transition duration-150 ease-in-out"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.3 14.7l-1.4-1.4L12.2 9H0V7h12.2L7.9 2.7l1.4-1.4L16 8z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
