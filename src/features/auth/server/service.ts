import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type {
  ChangeEmailInput,
  ChangePasswordInput,
  DeleteAccountInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  SignUpInput,
  SetUserRoleInput,
  UpdateProfileInput,
} from '@/features/auth/types'
import { isMissingAuthSession } from '@/features/auth/server/errors'

export async function signUpUser(input: SignUpInput) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { full_name: input.fullName },
      captchaToken: input.captchaToken,
    },
  })

  if (error) throw error

  return { user: data.user, session: data.session }
}

export async function loginUser(input: LoginInput) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
    options: { captchaToken: input.captchaToken },
  })

  if (error) throw error

  return { user: data.user, session: data.session }
}

export async function logoutUser() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) throw error
}

export async function forgotPassword(input: ForgotPasswordInput) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/auth/reset-password`,
    captchaToken: input.captchaToken,
  })

  if (error) throw error

  return { success: true }
}

export async function resendVerification(input: ForgotPasswordInput) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: input.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      captchaToken: input.captchaToken,
    },
  })

  if (error) throw error
}

export async function updateProfile(input: UpdateProfileInput) {
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

  const updates: { full_name?: string | null; avatar_url?: string | null } = {}
  if (input.fullName !== undefined) updates.full_name = input.fullName
  if (input.avatarUrl !== undefined) updates.avatar_url = input.avatarUrl

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select('id, full_name, avatar_url, role, created_at, updated_at')
    .single()

  if (error) throw error
  return { user, profile: data }
}

export async function resetPassword(input: ResetPasswordInput) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: input.password,
  })

  if (error) throw error

  return { success: true }
}

export async function changeEmail(input: ChangeEmailInput) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.updateUser(
    { email: input.email },
    { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  )
  if (error) throw error
  return { user: data.user }
}

export async function changePassword(input: ChangePasswordInput) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user?.email) return null

  const { error: reauthenticationError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: input.currentPassword,
  })
  if (reauthenticationError) throw reauthenticationError

  const { error } = await supabase.auth.updateUser({ password: input.password })
  if (error) throw error
  return { userId: user.id }
}

export async function deleteAccount(input: DeleteAccountInput) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user?.email) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profileError) throw profileError
  if (profile.role === 'super_admin') {
    throw {
      message:
        'Super-admin accounts require an administrative handover before deletion',
      code: 'super_admin_deletion_forbidden',
      status: 403,
    }
  }

  const { error: reauthenticationError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: input.password,
  })
  if (reauthenticationError) throw reauthenticationError

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) throw error
  return { userId: user.id }
}

export async function setUserRole(userId: string, input: SetUserRoleInput) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('set_user_role', {
    p_target_user_id: userId,
    p_new_role: input.role,
  })
  if (error) throw error
  return data?.[0] ?? null
}
