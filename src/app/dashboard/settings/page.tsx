import AccountSettings from '@/components/dashboard/AccountSettings'
import { requireRole } from '@/features/auth/server/guards'

const roles = ['customer', 'vendor', 'admin', 'super_admin'] as const

export default async function SettingsPage() {
  const { user, profile } = await requireRole([...roles])
  const hasPassword = user.identities?.some((identity) => identity.provider === 'email') ?? false

  return (
    <AccountSettings
      initialName={profile.full_name ?? ''}
      initialAvatarUrl={profile.avatar_url ?? ''}
      email={user.email ?? ''}
      role={profile.role}
      hasPassword={hasPassword}
    />
  )
}
