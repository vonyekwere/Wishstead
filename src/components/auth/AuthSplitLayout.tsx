import Image from 'next/image'

export default function AuthSplitLayout({ children, title, description }: { children: React.ReactNode; title: string; description: string }) {
  return (
    <div className="grid w-full grid-cols-1 bg-cream lg:min-h-[80dvh] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <Image src="/images/login-page.png" alt="Warm, softly lit artisanal candles surrounded by dried flowers" fill priority className="object-cover" sizes="50vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
        <div className="relative flex h-full flex-col justify-between p-8 xl:p-12">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-wide text-white xl:text-4xl">WISHSTEAD</h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/90 xl:text-[15px]">Thoughtful gifts, meaningful connections, and a secure place for your account.</p>
          </div>
          <div className="max-w-md rounded-2xl bg-[#EFEAE1]/90 p-5 backdrop-blur-sm xl:p-6">
            <p className="text-xl font-semibold leading-snug text-[#4A1620] xl:text-[24px]">&ldquo;Wishstead connects our artisanal goods with people seeking genuine connection.&rdquo;</p>
            <p className="mt-3 text-sm font-medium text-neutral-500">— Eleanor &amp; Co. Botanicals</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center bg-[#FBF9F4] px-5 py-12 sm:px-8 sm:py-16">
        <div className="w-full max-w-md">
          <h2 className="font-serif text-4xl font-bold text-[#4A1620]">{title}</h2>
          <p className="mt-3 text-neutral-500">{description}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
