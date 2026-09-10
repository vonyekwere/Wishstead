import VerifyEmailClient from '@/components/VerifyEmailClient'

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string; vendor?: string }> }) {
  const params = await searchParams
  return <VerifyEmailClient email={params.email ?? ''} vendor={params.vendor === '1'} />
}
