'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, AtSign, LockKeyhole, UserRound } from 'lucide-react'
import PasswordRequirements from '@/components/auth/PasswordRequirements'
import { authRequest, errorMessage } from '@/features/auth/client'
import { isStrongPassword } from '@/features/auth/password-policy'
import type { UserRole } from '@/features/auth/types'
import Spinner from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/ToastProvider'

const inputClass = 'mt-2 w-full rounded-xl border border-[#DED5C6] bg-white px-4 py-3 text-sm text-[#2E2A24] outline-none transition focus:border-[#4A1620] focus:ring-2 focus:ring-[#4A1620]/10 disabled:bg-[#F4F0E8] disabled:text-neutral-500'
const buttonClass = 'rounded-xl bg-[#4A1620] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5c1c29] disabled:cursor-not-allowed disabled:opacity-60'

function Notice({ error, message }: { error: string; message: string }) {
  if (error) return <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>
  if (message) return <p role="status" className="mt-4 text-sm text-green-700">{message}</p>
  return null
}

export default function AccountSettings({ initialName, initialAvatarUrl, email, role, hasPassword }: { initialName: string; initialAvatarUrl: string; email: string; role: UserRole; hasPassword: boolean }) {
  const router = useRouter()
  const { toast } = useToast()
  const [fullName, setFullName] = useState(initialName)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [pending, setPending] = useState<string | null>(null)
  const [notices, setNotices] = useState<Record<string, { error: string; message: string }>>({})

  function setNotice(section: string, error = '', message = '') {
    setNotices((current) => ({ ...current, [section]: { error, message } }))
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault()
    setPending('profile'); setNotice('profile')
    try {
      await authRequest('/api/auth/profile', { method: 'PATCH', body: JSON.stringify({ fullName, avatarUrl: avatarUrl || null }) })
      setNotice('profile', '', 'Profile updated successfully.')
      toast('Profile updated successfully.', 'success')
      router.refresh()
    } catch (error) { const message = errorMessage(error); setNotice('profile', message); toast(message, 'error') } finally { setPending(null) }
  }

  async function changeEmail(event: FormEvent) {
    event.preventDefault()
    setPending('email'); setNotice('email')
    try {
      const result = await authRequest<{ message: string }>('/api/auth/email', { method: 'PATCH', body: JSON.stringify({ email: newEmail }) })
      setNotice('email', '', result.message)
      toast(result.message, 'success')
      setNewEmail('')
    } catch (error) { const message = errorMessage(error); setNotice('email', message); toast(message, 'error') } finally { setPending(null) }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault()
    if (newPassword !== confirmation) return setNotice('password', 'Passwords do not match.')
    setPending('password'); setNotice('password')
    try {
      const result = await authRequest<{ message: string }>('/api/auth/password', { method: 'PATCH', body: JSON.stringify({ currentPassword, password: newPassword }) })
      setNotice('password', '', result.message)
      toast(result.message, 'success')
      setCurrentPassword(''); setNewPassword(''); setConfirmation('')
    } catch (error) { const message = errorMessage(error); setNotice('password', message); toast(message, 'error') } finally { setPending(null) }
  }

  async function deleteAccount(event: FormEvent) {
    event.preventDefault()
    setPending('delete'); setNotice('delete')
    try {
      await authRequest('/api/auth/account', { method: 'DELETE', body: JSON.stringify({ password: deletePassword || undefined, confirmation: deleteConfirmation }) })
      router.replace('/auth/login?accountDeleted=1')
      router.refresh()
    } catch (error) { const message = errorMessage(error); setNotice('delete', message); toast(message, 'error'); setPending(null) }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-[#4A1620]">Account settings</h1>
        <p className="mt-2 text-sm text-[#6F675A]">Manage your personal details, sign-in information, and account security.</p>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-[#E9E2D6] bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3"><UserRound className="h-5 w-5 text-[#4A1620]" /><h2 className="font-serif text-xl font-semibold text-[#4A1620]">Profile information</h2></div>
          <form onSubmit={saveProfile} className="mt-6 grid gap-5 sm:grid-cols-2">
            <div><label htmlFor="settings-name" className="text-sm font-medium">Full name</label><input id="settings-name" value={fullName} onChange={(event) => setFullName(event.target.value)} required maxLength={120} autoComplete="name" className={inputClass} /></div>
            <div><label htmlFor="settings-role" className="text-sm font-medium">Account role</label><input id="settings-role" value={role.replace('_', ' ')} disabled className={`${inputClass} capitalize`} /></div>
            <div className="sm:col-span-2"><label htmlFor="settings-avatar" className="text-sm font-medium">Profile image URL <span className="font-normal text-neutral-500">(optional)</span></label><input id="settings-avatar" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} type="url" maxLength={2048} placeholder="https://example.com/profile.jpg" className={inputClass} /></div>
            <div className="sm:col-span-2"><button disabled={pending !== null || (!fullName.trim())} className={`${buttonClass} inline-flex items-center gap-2`}>{pending === 'profile' && <Spinner />}{pending === 'profile' ? 'Saving…' : 'Save profile'}</button><Notice {...(notices.profile ?? { error: '', message: '' })} /></div>
          </form>
        </section>

        <section className="rounded-2xl border border-[#E9E2D6] bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3"><AtSign className="h-5 w-5 text-[#4A1620]" /><h2 className="font-serif text-xl font-semibold text-[#4A1620]">Email address</h2></div>
          <p className="mt-2 text-sm text-[#6F675A]">Both your current and new address may need confirmation before the change is completed.</p>
          <form onSubmit={changeEmail} className="mt-6 grid gap-5 sm:grid-cols-2">
            <div><label htmlFor="current-email" className="text-sm font-medium">Current email</label><input id="current-email" value={email} disabled className={inputClass} /></div>
            <div><label htmlFor="new-email" className="text-sm font-medium">New email</label><input id="new-email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} type="email" required autoComplete="email" placeholder="new@example.com" className={inputClass} /></div>
            <div className="sm:col-span-2"><button disabled={pending !== null || !newEmail || newEmail.toLowerCase() === email.toLowerCase()} className={`${buttonClass} inline-flex items-center gap-2`}>{pending === 'email' && <Spinner />}{pending === 'email' ? 'Sending…' : 'Change email'}</button><Notice {...(notices.email ?? { error: '', message: '' })} /></div>
          </form>
        </section>

        <section className="rounded-2xl border border-[#E9E2D6] bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3"><LockKeyhole className="h-5 w-5 text-[#4A1620]" /><h2 className="font-serif text-xl font-semibold text-[#4A1620]">Password</h2></div>
          {hasPassword ? (
            <form onSubmit={changePassword} className="mt-6 space-y-5">
              <div><label htmlFor="current-password" className="text-sm font-medium">Current password</label><input id="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} type="password" required autoComplete="current-password" className={inputClass} /></div>
              <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="new-password" className="text-sm font-medium">New password</label><input id="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" required minLength={8} maxLength={128} autoComplete="new-password" className={inputClass} /></div><div><label htmlFor="confirm-password" className="text-sm font-medium">Confirm password</label><input id="confirm-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} type="password" required minLength={8} maxLength={128} autoComplete="new-password" className={inputClass} /></div></div>
              <PasswordRequirements password={newPassword} confirmation={confirmation} />
              <button disabled={pending !== null || !currentPassword || !isStrongPassword(newPassword) || newPassword !== confirmation} className={`${buttonClass} inline-flex items-center gap-2`}>{pending === 'password' && <Spinner />}{pending === 'password' ? 'Updating…' : 'Update password'}</button>
              <Notice {...(notices.password ?? { error: '', message: '' })} />
            </form>
          ) : (
            <div className="mt-5 rounded-xl bg-[#F7F1E8] p-4 text-sm text-[#5C5548]">You sign in with Google and do not currently use a password. <Link href="/auth/forgot-password" className="font-semibold text-[#4A1620] underline">Create a password through the secure recovery flow</Link>.</div>
          )}
        </section>

        <section className="rounded-2xl border border-red-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-red-700" /><h2 className="font-serif text-xl font-semibold text-red-800">Delete account</h2></div>
          {role === 'super_admin' ? <p className="mt-4 text-sm text-[#6F675A]">The super-admin account cannot be deleted until administrative ownership has been handed over.</p> : (
            <form onSubmit={deleteAccount} className="mt-5 space-y-5">
              <p className="text-sm text-[#6F675A]">This permanently deletes your profile and authentication account. This action cannot be undone.</p>
              {hasPassword && <div><label htmlFor="delete-password" className="text-sm font-medium">Current password</label><input id="delete-password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} type="password" required autoComplete="current-password" className={inputClass} /></div>}
              <div><label htmlFor="delete-confirmation" className="text-sm font-medium">Type <strong>DELETE</strong> to confirm</label><input id="delete-confirmation" value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} required autoComplete="off" className={inputClass} /></div>
              {!hasPassword && <p className="text-xs text-[#6F675A]">For security, Google accounts must have signed in within the last 10 minutes.</p>}
              <button disabled={pending !== null || deleteConfirmation !== 'DELETE' || (hasPassword && !deletePassword)} className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60">{pending === 'delete' && <Spinner />}{pending === 'delete' ? 'Deleting…' : 'Permanently delete account'}</button>
              <Notice {...(notices.delete ?? { error: '', message: '' })} />
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
