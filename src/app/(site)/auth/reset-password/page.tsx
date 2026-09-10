'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { authRequest, errorMessage } from '@/features/auth/client'
import AuthSplitLayout from '@/components/auth/AuthSplitLayout'
import PasswordRequirements from '@/components/auth/PasswordRequirements'
import { isStrongPassword } from '@/features/auth/password-policy'
import Spinner from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/ToastProvider'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirmation) {
      setError('Passwords do not match')
      return
    }
    setPending(true)
    setError('')
    try {
      await authRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ password }),
      })
      router.replace('/auth/login?passwordReset=1')
    } catch (submissionError) {
      const message = errorMessage(submissionError); setError(message); toast(message, 'error')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthSplitLayout title="Choose a new password" description="Use at least 8 characters and choose a password you do not use elsewhere.">
      <form onSubmit={submit} className="mt-10 space-y-6">
        <div className="flex items-center rounded-xl border border-[#E7C9C9] bg-white px-4 py-3 focus-within:border-[#4A1620]">
          <Lock className="h-4 w-4 text-neutral-400" strokeWidth={1.75} />
          <input aria-label="New password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={128} autoComplete="new-password" placeholder="New password" className="ml-3 w-full bg-transparent text-sm focus:outline-none" />
          <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide passwords' : 'Show passwords'} className="text-neutral-400">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
        </div>
        <div className="flex items-center rounded-xl border border-[#E7C9C9] bg-white px-4 py-3 focus-within:border-[#4A1620]">
          <Lock className="h-4 w-4 text-neutral-400" strokeWidth={1.75} />
          <input aria-label="Confirm new password" type={showPassword ? 'text' : 'password'} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required minLength={8} maxLength={128} autoComplete="new-password" placeholder="Confirm new password" className="ml-3 w-full bg-transparent text-sm focus:outline-none" />
        </div>
        <PasswordRequirements password={password} confirmation={confirmation} />
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={pending || !isStrongPassword(password) || password !== confirmation} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4A1620] py-3 text-white disabled:cursor-not-allowed disabled:opacity-60">{pending && <Spinner />}{pending ? 'Updating…' : 'Update password'}</button>
      </form>
    </AuthSplitLayout>
  )
}
