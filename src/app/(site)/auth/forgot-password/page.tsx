'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { authRequest, errorMessage } from '@/features/auth/client'
import AuthSplitLayout from '@/components/auth/AuthSplitLayout'
import Spinner from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/ToastProvider'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    setMessage('')
    try {
      const result = await authRequest<{ message: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setMessage(result.message)
      toast(result.message, 'success')
    } catch (submissionError) {
      const message = errorMessage(submissionError); setError(message); toast(message, 'error')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthSplitLayout title="Reset your password" description="We will email you a secure recovery link.">
      <form onSubmit={submit} className="mt-10 space-y-6">
        <label className="block text-sm font-medium text-[#2E2A24]" htmlFor="recovery-email">Email address</label>
        <div className="flex items-center rounded-xl border border-[#E7C9C9] bg-white px-4 py-3 focus-within:border-[#4A1620]">
          <Mail className="h-4 w-4 text-neutral-400" strokeWidth={1.75} />
          <input id="recovery-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" className="ml-3 w-full bg-transparent text-sm focus:outline-none" />
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="text-sm text-green-800">{message}</p>}
        <button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4A1620] py-3 text-white disabled:opacity-60">{pending && <Spinner />}{pending ? 'Sending…' : 'Send recovery link'}</button>
      </form>
      <Link href="/auth/login" className="mt-6 inline-block text-sm font-semibold text-[#4A1620]">Back to sign in</Link>
    </AuthSplitLayout>
  )
}
