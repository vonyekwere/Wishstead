'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import TopHeader from '@/components/admin/TopHeader'
import Footer from '@/components/admin/Footer'
import { authRequest, errorMessage } from '@/features/auth/client'
import type { UserRole } from '@/features/auth/types'
import { useToast } from '@/components/ui/ToastProvider'

export default function DashboardShell({ children, name, email, role }: { children: React.ReactNode; name: string | null; email: string; role: UserRole }) {
  const router = useRouter()
  const { toast } = useToast()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  async function logout() {
    setPending(true)
    setError('')
    try {
      await authRequest('/api/auth/logout', { method: 'POST' })
      router.replace('/auth/login')
      router.refresh()
    } catch (logoutError) {
      const message = errorMessage(logoutError); setError(message); toast(message, 'error')
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-dvh bg-[#FBF9F4]">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} role={role} onLogout={logout} logoutPending={pending} />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <TopHeader onMenuToggle={() => setMenuOpen(true)} name={name} email={email} role={role} onLogout={logout} logoutPending={pending} />
        {error && <p role="alert" className="px-5 pt-4 text-sm text-red-700 sm:px-8 lg:px-10">{error}</p>}
        <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">{children}</main>
        <Footer role={role} />
      </div>
    </div>
  )
}
