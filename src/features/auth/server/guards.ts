import 'server-only'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/features/auth/types'
import { isMissingAuthSession } from '@/features/auth/server/errors'

const AUTHORIZATION_PROFILE_COLUMNS = 'id, full_name, avatar_url, role' as const

async function getAuthorizationContext() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    if (isMissingAuthSession(userError)) return { user: null, profile: null }
    throw userError
  }
  if (!user) return { user: null, profile: null }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(AUTHORIZATION_PROFILE_COLUMNS)
    .eq('id', user.id)
    .single()

  if (profileError) throw profileError
  if (!profile) return { user, profile: null }

  return { user, profile }
}

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    if (isMissingAuthSession(error)) return null
    throw error
  }
  return user
}

export async function requireUser() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  return user
}

export async function requireRole(allowedRoles: UserRole[]) {
  const { user, profile } = await getAuthorizationContext()

  if (!user) redirect('/auth/login')
  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect('/unauthorized')
  }

  return { user, profile }
}

export async function requireApiUser() {
  return getAuthenticatedUser()
}

export async function requireApiRole(allowedRoles: UserRole[]) {
  const { user, profile } = await getAuthorizationContext()

  if (!user) {
    return { user: null, profile: null, error: 'Unauthorized', status: 401 }
  }

  if (!profile) {
    return { user: null, profile: null, error: 'Profile not found', status: 403 }
  }

  if (!allowedRoles.includes(profile.role)) {
    return { user: null, profile: null, error: 'Forbidden', status: 403 }
  }

  return { user, profile, error: null, status: 200 }
}
