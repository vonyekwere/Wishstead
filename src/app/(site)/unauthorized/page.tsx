import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <section className="mx-auto w-full max-w-lg px-6 py-20 text-center">
      <h1 className="font-serif text-4xl font-bold text-[#4A1620]">Access unavailable</h1>
      <p className="mt-4 text-neutral-600">Your account does not have permission to view this area.</p>
      <Link href="/dashboard" className="mt-8 inline-block rounded-xl bg-[#4A1620] px-6 py-3 text-white">Return to dashboard</Link>
    </section>
  )
}
