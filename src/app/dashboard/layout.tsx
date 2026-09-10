import DashboardShell from '@/components/dashboard/DashboardShell'
import { requireRole } from '@/features/auth/server/guards'

const roles = ['customer', 'vendor', 'admin', 'super_admin'] as const

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireRole([...roles])
  return (
    <DashboardShell
      name={profile.full_name}
      email={user.email ?? ''}
      role={profile.role}
    >
      {children}
    </DashboardShell>
  )
}
