import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { isMissingAuthSession } from '@/features/auth/server/errors'

const PROFILE_COLUMNS =
  'id, full_name, avatar_url, role, created_at, updated_at' as const

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    if (isMissingAuthSession(userError)) return null
    throw userError
  }
  if (!user) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', user.id)
    .single()

  if (profileError) throw profileError

  return { user, profile }
}

export async function getCurrentProfile() {
  const result = await getCurrentUser()
  return result?.profile ? result : null
}

export async function getVerificationStatus() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    if (isMissingAuthSession(error)) return null
    throw error
  }
  if (!user) return null

  return {
    isEmailVerified: Boolean(user.email_confirmed_at),
    emailConfirmedAt: user.email_confirmed_at,
  }
}
