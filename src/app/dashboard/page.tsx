import AdminDashboardPage from '@/app/admin/page'
import { requireRole } from '@/features/auth/server/guards'
import { createClient } from '@/lib/supabase/server'

const roles = ['customer', 'vendor', 'admin', 'super_admin'] as const

export default async function DashboardPage() {
  const { profile } = await requireRole([...roles])

  if (profile.role === 'admin' || profile.role === 'super_admin') {
    return <AdminDashboardPage />
  }

  const supabase = await createClient()
  const { data: application } = await supabase
    .from('vendor_applications')
    .select('status, business_name, rejection_reason')
    .maybeSingle()

  return (
    <section>
      <h1 className="font-serif text-4xl font-bold text-[#4A1620]">Welcome, {profile.full_name || 'friend'}</h1>
      <p className="mt-3 text-neutral-600">
        {profile.role === 'vendor'
          ? 'Your vendor workspace is ready. Vendor tools will appear here.'
          : 'Your personal gifting dashboard is ready.'}
      </p>
      {application && (
        <div className="mt-8 rounded-2xl border border-[#DAC0C1] bg-white p-6">
          <h2 className="font-serif text-2xl font-semibold text-[#4A1620]">{application.business_name}</h2>
          <p className="mt-2 text-sm capitalize text-neutral-600">Application status: <strong>{application.status}</strong></p>
          {application.rejection_reason && <p className="mt-3 text-sm text-red-700">{application.rejection_reason}</p>}
        </div>
      )}
    </section>
  )
}
