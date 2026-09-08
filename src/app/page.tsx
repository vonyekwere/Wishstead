import ArrowRight from "@/components/ArrowRight";
import { UserSearch, Sparkles, MailCheck, Gift } from "lucide-react";
const steps = [
  {
    number: "01",
    label: "Profile",
    description: "Tell us about the recipient, their tastes, and the occasion.",
    icon: UserSearch,
    height: "h-[380px]",
  },
  {
    number: "02",
    label: "Curate",
    description: "We match their profile with hand-picked, meaningful items.",
    icon: Sparkles,
    height: "h-[350px]",
  },
  {
    number: "03",
    label: "Select",
    description: "Review our bespoke suggestions and choose the perfect gift.",
    icon: MailCheck,
    height: "h-[320px]",
  },
  {
    number: "04",
    label: "Delight",
    description: "Deliver a beautifully presented gift that speaks volumes.",
    icon: Gift,
    height: "h-[290px]",
  },
];
export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden h-[90vh]">
        {/* Background photo — replace /public/hero-gifts.jpg with your own image */}
        <div
          className="absolute inset-0 bg-cover bg-[position:65%_center]"
          style={{ backgroundImage: "url('/images/hero.png')" }}
        />
        {/* Warm scrim so text stays legible over the photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/30 to-cream/5" />

        <div className="relative container py-32 lg:py-44">
          <div className="max-w-xl">
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px w-8 bg-maroon" />
              <p className="eyebrow">Thoughtful Gifts. Meaningful Connections.</p>
            </div>

            <h1 className="font-serif text-[2.75rem] leading-[1.08] text-ink sm:text-[3.4rem]">
              Don&apos;t know what to    
              <br />
              gift?
              <br />
              <span className="italic text-maroon">We&apos;ve got you.</span>
            </h1>

            <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-body">
              Personalized gift ideas for every person, every occasion and every
              budget. Discover the art of modern thoughtful gifting.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-8">
              <a
                href="#"
                className="flex items-center gap-2 rounded-full bg-maroon px-7 py-3.5 text-[0.75rem] font-semibold uppercase tracking-widest2 text-cream transition-colors hover:bg-maroon-dark"
              >
                Start Gifting
                <ArrowRight size={14} strokeWidth={2.5} />
              </a>
              <a
                href="#"
                className="border-b border-ink/40 pb-0.5 text-[0.75rem] font-semibold uppercase tracking-widest2 text-ink transition-colors hover:border-maroon hover:text-maroon"
              >
                Explore Curations
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className='how-work-section py-16'>
        <div className='container'>
          <div className='heading-img justify-center flex'>
            <img src='/images/heading-img.png'></img>
          </div>

          <div className='flex flex-col items-center mt-16'>
            <h2 className='heading'>How Wishstead Works</h2>
            <div className='heading-line'></div>
          </div>
          <div className="mt-16 flex flex-col items-end gap-4 md:flex-row">
            {steps.map(({ number, label, description, icon: Icon, }) => (
              <div
                key={number}
                className={`relative flex w-full flex-col items-center rounded-3xl bg-[#F1EBE1] px-6 pt-10 pb-24 h-full `}
              >
                {/* Icon + floating triangle decoration, side by side */}
                <div className="relative flex h-16 w-full items-center justify-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#FAF8F3]">
                    <Icon className="h-6 w-6 text-[#4A1620]" strokeWidth={1.75} />
                  </div>

                </div>

                {/* Title */}
                <h3 className="mt-6 text-[24px] font-semibold text-[#2E2A24]">
                  {number}. {label}
                </h3>

                {/* Description */}
                <p className="mt-3  text-center text-[16px] leading-relaxed text-neutral-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#EEEBE3] px-6 py-24 sm:py-32">
        <div className="mx-auto grid container grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left column — text */}
          <div className="relative">
            {/* Oversized decorative initial */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-3 -top-6 select-none font-serif text-[160px] leading-none text-[#C9A66B]/40 sm:text-[130px]"
            >
              C
            </span>

            <div className="relative pl-24 sm:pl-28">
              <h2 className="heading">
                Curated Discovery
              </h2>

              <p className="mt-6 max-w-md text-[18px] leading-relaxed text-neutral-600">
                Every item in our ledger is selected with a discerning eye for
                quality, provenance, and the timeless joy of receiving. We
                believe a gift should tell a story before it is even unwrapped.
              </p>

              <a
                href="#manifesto"
                className="group mt-8 inline-flex items-center gap-2 border-b border-[#4A1620] pb-1 text-xs font-semibold tracking-[0.18em] text-[#4A1620] transition-colors hover:text-[#6b2230]"
              >
                READ THE MANIFESTO
                {/* <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                strokeWidth={2}
              /> */}
              </a>
            </div>
          </div>

          {/* Right column — stacked images in a card frame */}
          <div className="relative">
            <div className="rounded-[28px] border border-[#E4DED0] bg-[#FAF8F3] p-3 shadow-sm">
              <div className="grid grid-cols-1 gap-3">

                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <img src='/images/curated.png' className='object-cover w-full'></img>

                </div>
              </div>
            </div>

            {/* Floating circular icon button */}
            <button
              type="button"
              aria-label="Open the manifesto"
              className="absolute -bottom-6 -right-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#4A1620] text-[#EFE3C7] shadow-lg transition-transform hover:scale-105"
            >
              {/* <BookOpen className="h-7 w-7" strokeWidth={1.5} /> */}
            </button>
          </div>
        </div>
      </section>

      <section className='gift-everyone-section py-16'>
        <div className='container'>
          {/* <div className='heading-img justify-center flex'>
            <img src='/images/heading-img.png'></img>
          </div> */}

          <div className='flex flex-col items-center mt-16'>
            <h2 className='heading'>A Gift for Everyone</h2>
            <div className='heading-line'></div>
            <p className='mt-4'>Browse our categorized collections, styled like the grand department catalogs of the late 19th century.</p>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-3 mt-16 gap-4'>
  
  {/* Card 1 */}
  <div className='rounded-lg p-3 border border-[#D9B36A4D] bg-[#F2EEE6] relative min-h-[300px]'>
    <div className="relative">
      <img src='images/gift-1.png' className='rounded-md w-full object-cover h-84' />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-md pointer-events-none"></div>
    </div>
    <div className='gift-boxes-content absolute bottom-10 flex flex-col items-center w-full z-10'>
      <h2 className='text-white text-[24px] font-semibold'>For Her</h2>
      <p className='text-[12px] text-[#D9B36A] tracking-[1.2px] mt-3'>EXPLORE COLLECTION</p>
    </div>
  </div>

  {/* Card 2 */}
  <div className='rounded-lg p-3 border border-[#D9B36A4D] bg-[#F2EEE6] relative min-h-[300px]'>
    <div className="relative">
      <img src='images/gift-1.png' className='rounded-md w-full object-cover h-84' />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-md pointer-events-none"></div>
    </div>
    <div className='gift-boxes-content absolute bottom-10 flex flex-col items-center w-full z-10'>
      <h2 className='text-white text-[24px] font-semibold'>For Him</h2>
      <p className='text-[12px] text-[#D9B36A] tracking-[1.2px] mt-3'>EXPLORE COLLECTION</p>
    </div>
  </div>

  {/* Card 3 */}
  <div className='rounded-lg p-3 border border-[#D9B36A4D] bg-[#F2EEE6] relative min-h-[300px]'>
    <div className="relative">
      <img src='images/gift-1.png' className='rounded-md w-full object-cover h-84' />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-md pointer-events-none"></div>
    </div>
    <div className='gift-boxes-content absolute bottom-10 flex flex-col items-center w-full z-10'>
      <h2 className='text-white text-[24px] font-semibold'>For Kids</h2>
      <p className='text-[12px] text-[#D9B36A] tracking-[1.2px] mt-3'>EXPLORE COLLECTION</p>
    </div>
  </div>

  {/* Card 4 */}
  <div className='rounded-lg p-3 border border-[#D9B36A4D] bg-[#F2EEE6] relative min-h-[300px]'>
    <div className="relative">
      <img src='images/gift-1.png' className='rounded-md w-full object-cover h-84' />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-md pointer-events-none"></div>
    </div>
    <div className='gift-boxes-content absolute bottom-10 flex flex-col items-center w-full z-10'>
      <h2 className='text-white text-[24px] font-semibold'>For Colleagues</h2>
      <p className='text-[12px] text-[#D9B36A] tracking-[1.2px] mt-3'>EXPLORE COLLECTION</p>
    </div>
  </div>

  {/* Card 5 */}
  <div className='rounded-lg p-3 border border-[#D9B36A4D] bg-[#F2EEE6] relative min-h-[300px]'>
    <div className="relative">
      <img src='images/gift-1.png' className='rounded-md w-full object-cover h-84' />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-md pointer-events-none"></div>
    </div>
    <div className='gift-boxes-content absolute bottom-10 flex flex-col items-center w-full z-10'>
      <h2 className='text-white text-[24px] font-semibold'>For Milestones</h2>
      <p className='text-[12px] text-[#D9B36A] tracking-[1.2px] mt-3'>EXPLORE COLLECTION</p>
    </div>
  </div>

  {/* Card 6 */}
  <div className='rounded-lg p-3 border border-[#D9B36A4D] bg-[#F2EEE6] relative min-h-[300px]'>
    <div className="relative">
      <img src='images/gift-1.png' className='rounded-md w-full object-cover h-84' />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-md pointer-events-none"></div>
    </div>
    <div className='gift-boxes-content absolute bottom-10 flex flex-col items-center w-full z-10'>
      <h2 className='text-white text-[24px] font-semibold'>Just Because</h2>
      <p className='text-[12px] text-[#D9B36A] tracking-[1.2px] mt-3'>EXPLORE COLLECTION</p>
    </div>
  </div>
</div>
        </div>
      </section>
    </div>
  );
}
