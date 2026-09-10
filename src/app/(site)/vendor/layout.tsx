import { redirect } from 'next/navigation'
import { requireApiUser } from '@/features/auth/server/guards'

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  if (await requireApiUser()) redirect('/dashboard')
  return children
}
