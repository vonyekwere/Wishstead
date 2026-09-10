import Link from 'next/link'

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ error?: string; code?: string }> }) {
  const params = await searchParams
  return (
    <section className="mx-auto w-full max-w-lg px-6 py-20 text-center">
      <h1 className="font-serif text-4xl font-bold text-[#4A1620]">Authentication could not be completed</h1>
      <p className="mt-4 text-neutral-600">{params.error ?? 'The authentication link is invalid or has expired.'}</p>
      {params.code && <p className="mt-2 text-xs text-neutral-500">Code: {params.code}</p>}
      <Link href="/auth/login" className="mt-8 inline-block rounded-xl bg-[#4A1620] px-6 py-3 text-white">Return to sign in</Link>
    </section>
  )
}
