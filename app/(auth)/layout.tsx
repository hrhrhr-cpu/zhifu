import Header from '@/components/ui/header'

export const metadata = {
  title: {
    template: '%s - 影视会员',
    default: '全网影视会员',
  },
  description: '全网影视会员 - 海量高清电影随心看',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {  
  return (
    <>
      <Header nav={false} />

      <main className="grow bg-gray-50">
        <section>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-32 pb-12 md:pt-40 md:pb-20">

              {children}

            </div>
          </div>
        </section>
      </main>
    </>
  )
}
