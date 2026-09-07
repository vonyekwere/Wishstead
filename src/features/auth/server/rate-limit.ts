import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

export async function checkRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number,
) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const clientId = forwardedFor || request.headers.get('x-real-ip') || 'unknown'
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('check_auth_rate_limit', {
    p_scope: scope,
    p_client_id: clientId,
    p_request_limit: limit,
    p_window_seconds: Math.ceil(windowMs / 1000),
  })

  if (error) throw error
  return typeof data === 'number' && data > 0 ? data : null
}
