export const metadata = {
  title: '全网影视会员 - 高清电影随心看',
  description: '海量高清电影、热门剧集、独家纪录片，开通会员即可无限畅看',
}

import Hero from '@/components/hero'
import Inspiration from '@/components/inspiration'
import Carousel from '@/components/carousel'
import Creatives from '@/components/creatives'
import Pricing from '@/components/pricing'
import Testimonials from '@/components/testimonials'
import Faqs from '@/components/faqs'
import Blog from '@/components/blog'
import Cta from '@/components/cta'

export default function Home() {
  return (
    <>
      <Hero />
      <Inspiration />
      <Carousel />
      <Creatives />
      <Pricing />
      <Testimonials />
      <Faqs />
      <Blog />
      <Cta />
    </>
  )
}
