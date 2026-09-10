'use client'

import { useState } from 'react'
import Link from 'next/link'
import { authRequest, errorMessage } from '@/features/auth/client'
import Spinner from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/ToastProvider'

export default function VerifyEmailClient({ email, vendor }: { email: string; vendor: boolean }) {
  const { toast } = useToast()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function resend() {
    setPending(true)
    setError('')
    try {
      const result = await authRequest<{ message: string }>('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setMessage(result.message)
      toast(result.message, 'success')
    } catch (resendError) {
      const failure = errorMessage(resendError)
      setError(failure)
      toast(failure, 'error')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-lg px-6 py-20 text-center">
      <h1 className="font-serif text-4xl font-bold text-[#4A1620]">Check your email</h1>
      <p className="mt-4 text-neutral-600">We sent a verification link to <strong>{email || 'your email address'}</strong>.</p>
      {vendor && <p className="mt-3 text-sm text-neutral-600">Verify your email before signing in to your vendor dashboard.</p>}
      {email && <button type="button" onClick={resend} disabled={pending} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#4A1620] px-6 py-3 text-white disabled:opacity-60">{pending && <Spinner />}{pending ? 'Sending…' : 'Resend verification email'}</button>}
      {message && <p role="status" className="mt-4 text-sm text-green-800">{message}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      <div><Link href="/auth/login" className="mt-6 inline-block text-sm font-semibold text-[#4A1620]">Continue to sign in</Link></div>
    </section>
  )
}
