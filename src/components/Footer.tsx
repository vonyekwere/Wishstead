import Image from "next/image";

const linkColumns = [
  ["How It Works", "For Businesses", "Terms"],
  ["For You", "About", "Privacy"],
];

export default function Footer() {
  return (
    <footer className="bg-cream-alt">
      <div className="container pt-16">
        {/* Logo row */}
        <div className="flex items-center justify-center gap-3 pb-10">
          <Image
            src="/images/footer-logo.png"
            alt="Wishstead"
            width={40}
            height={40}
            className="h-10 w-10 rounded-[4px] object-cover"
          />
          <span className="font-serif text-2xl font-semibold text-body">
            Wishstead
          </span>
        </div>

        <div className="h-px bg-tan-line" />

        {/* Content row */}
        <div className="flex flex-col gap-12 py-12 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
          <div className="max-w-xs">
            <h3 className="font-serif text-xl font-semibold text-maroon">
              The Gifting House
            </h3>
            <p className="mt-3 font-serif italic leading-relaxed text-body">
              Established in the spirit of 19th-century thoughtfulness,
              crafted for the modern digital age.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-16 gap-y-10">
            {linkColumns.map((column, i) => (
              <ul key={i} className="space-y-4">
                {column.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[0.72rem] font-semibold uppercase tracking-widest2 text-ink/80 transition-colors hover:text-maroon"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <div className="h-px bg-tan-line" />
      </div>

      <div className="container">
        <p className="py-6 text-center text-[0.7rem] uppercase tracking-widest2 text-body/70">
          &copy; 1894–{new Date().getFullYear()} Wishstead Gifting House. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
}
