import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

type AuditEvent = {
  actorId?: string | null
  action: string
  targetUserId?: string | null
  metadata?: Record<string, unknown>
}

export async function writeAuthAuditEvent(event: AuditEvent) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('auth_audit_log').insert({
    actor_id: event.actorId ?? null,
    action: event.action,
    target_user_id: event.targetUserId ?? null,
    metadata: event.metadata ?? {},
  })

  // The Auth service and Postgres do not share a transaction. An audit-storage
  // outage must not turn an already-completed password/email/account operation
  // into a misleading HTTP failure.
  if (error) console.error('Authentication audit write failed:', error)
}
