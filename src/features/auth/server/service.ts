import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type {
  ChangeEmailInput,
  ChangePasswordInput,
  DeleteAccountInput,
  ForgotPasswordInput,
  LoginInput,
  OAuthInput,
  ResetPasswordInput,
  SignUpInput,
  SetUserRoleInput,
  UpdateProfileInput,
  VendorApplicationInput,
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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`,
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

export async function startGoogleOAuth(input: OAuthInput) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) {
    throw {
      message: 'Application site URL is not configured',
      code: 'site_url_not_configured',
      status: 500,
    }
  }

  let callbackUrl: URL
  try {
    callbackUrl = new URL('/auth/callback', siteUrl)
  } catch {
    throw {
      message: 'Application site URL is invalid',
      code: 'site_url_invalid',
      status: 500,
    }
  }
  if (!['http:', 'https:'].includes(callbackUrl.protocol)) {
    throw {
      message: 'Application site URL must use HTTP or HTTPS',
      code: 'site_url_invalid',
      status: 500,
    }
  }
  callbackUrl.searchParams.set('next', input.next)

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl.toString(),
      skipBrowserRedirect: true,
      queryParams: { prompt: 'select_account' },
    },
  })

  if (error) throw error
  if (!data.url) {
    throw {
      message: 'Google did not return an authorization URL',
      code: 'oauth_url_missing',
      status: 502,
    }
  }

  return { url: data.url }
}

export async function submitVendorApplication(input: VendorApplicationInput) {
  const supabase = await createClient()
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { full_name: input.fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`,
    },
  })
  if (signUpError) throw signUpError
  if (!data.user || data.user.identities?.length === 0) {
    throw {
      message: 'Unable to create vendor account with these credentials',
      code: 'vendor_account_unavailable',
      status: 409,
    }
  }

  const admin = createAdminClient()
  let logoPath: string | null = null

  try {
    if (input.logo) {
      const extension = input.logo.type === 'image/png' ? 'png' : 'jpg'
      logoPath = `${data.user.id}/${crypto.randomUUID()}.${extension}`
      const { error: uploadError } = await admin.storage
        .from('vendor-logos')
        .upload(logoPath, await input.logo.arrayBuffer(), {
          contentType: input.logo.type,
          upsert: false,
        })
      if (uploadError) throw uploadError
    }

    const { data: application, error: applicationError } = await admin
      .from('vendor_applications')
      .insert({
        user_id: data.user.id,
        business_name: input.businessName,
        business_description: input.businessDescription,
        website_url: input.websiteUrl,
        primary_category: input.primaryCategory,
        logo_path: logoPath,
      })
      .select('id, status, created_at')
      .single()
    if (applicationError) throw applicationError

    await writeVendorApplicationAudit(data.user.id, application.id)
    return {
      user: data.user,
      application,
      emailVerificationRequired: !data.session,
    }
  } catch (error) {
    if (logoPath) await admin.storage.from('vendor-logos').remove([logoPath])
    await admin.auth.admin.deleteUser(data.user.id)
    throw error
  }
}

async function writeVendorApplicationAudit(userId: string, applicationId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from('auth_audit_log').insert({
    actor_id: userId,
    action: 'vendor.application_submitted',
    target_user_id: userId,
    metadata: { applicationId },
  })
  if (error) console.error('Vendor application audit write failed:', error)
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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`,
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
    { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard` },
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

  const hasPasswordIdentity = user.identities?.some(
    (identity) => identity.provider === 'email',
  )
  if (hasPasswordIdentity) {
    if (!input.password) {
      throw {
        message: 'Your current password is required',
        code: 'password_required',
        status: 422,
      }
    }
    const { error: reauthenticationError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: input.password,
    })
    if (reauthenticationError) throw reauthenticationError
  } else {
    const signedInAt = user.last_sign_in_at
      ? new Date(user.last_sign_in_at).getTime()
      : 0
    if (!signedInAt || Date.now() - signedInAt > 10 * 60 * 1000) {
      throw {
        message: 'Sign in with Google again before deleting your account',
        code: 'recent_login_required',
        status: 403,
      }
    }
  }

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
