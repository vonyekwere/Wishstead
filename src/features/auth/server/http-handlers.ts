import 'server-only'

import { NextResponse } from 'next/server'
import { writeAuthAuditEvent } from '@/features/auth/server/audit'
import {
  errorResponse,
  getErrorDetails,
  httpError,
} from '@/features/auth/server/errors'
import { requireApiRole } from '@/features/auth/server/guards'
import {
  getCurrentProfile,
  getCurrentUser,
  getVerificationStatus,
} from '@/features/auth/server/session'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/features/auth/server/rate-limit'
import { successResponse } from '@/features/auth/server/responses'
import {
  forgotPassword,
  changeEmail,
  changePassword,
  deleteAccount,
  loginUser,
  logoutUser,
  resetPassword,
  resendVerification,
  setUserRole,
  signUpUser,
  startGoogleOAuth,
  updateProfile,
} from '@/features/auth/server/service'
import {
  parseForgotPasswordInput,
  parseChangeEmailInput,
  parseChangePasswordInput,
  parseDeleteAccountInput,
  parseLoginInput,
  parseOAuthInput,
  parseResetPasswordInput,
  parseSignUpInput,
  parseSetUserRoleInput,
  parseUserId,
  parseUpdateProfileInput,
  safeRedirectPath,
  validateRequestOrigin,
} from '@/features/auth/server/validation'

const AUTH_WINDOW_MS = 15 * 60 * 1000

async function rateLimited(request: Request, scope: string, limit: number) {
  const retryAfter = await checkRateLimit(request, scope, limit, AUTH_WINDOW_MS)
  if (!retryAfter) return null
  return httpError(
    'Too many requests. Please try again later.',
    429,
    'rate_limit_exceeded',
    { 'Retry-After': String(retryAfter) },
  )
}

export async function signUpHandler(request: Request) {
  try {
    validateRequestOrigin(request)
    const limited = await rateLimited(request, 'signup', 10)
    if (limited) return limited
    const input = parseSignUpInput(await request.json())
    const result = await signUpUser(input)
    return successResponse(
      { user: result.user, emailVerificationRequired: !result.session },
      201,
    )
  } catch (error) {
    console.error('Signup API error:', error)
    return errorResponse(error)
  }
}

export async function loginHandler(request: Request) {
  try {
    validateRequestOrigin(request)
    const limited = await rateLimited(request, 'login', 10)
    if (limited) return limited
    const input = parseLoginInput(await request.json())
    const result = await loginUser(input)
    return successResponse({ user: result.user })
  } catch (error) {
    console.error('Login API error:', error)
    return errorResponse(error)
  }
}

export async function googleOAuthHandler(request: Request) {
  try {
    validateRequestOrigin(request)
    const limited = await rateLimited(request, 'google-oauth', 10)
    if (limited) return limited

    const contentLength = request.headers.get('content-length')
    const input =
      contentLength === '0' || (!contentLength && !request.headers.get('content-type'))
        ? parseOAuthInput(undefined)
        : parseOAuthInput(await request.json())
    const result = await startGoogleOAuth(input)
    return successResponse(result)
  } catch (error) {
    console.error('Google OAuth API error:', error)
    return errorResponse(error)
  }
}

export async function logoutHandler(request: Request) {
  try {
    validateRequestOrigin(request)
    await logoutUser()
    return successResponse({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout API error:', error)
    return errorResponse(error)
  }
}

export async function forgotPasswordHandler(request: Request) {
  try {
    validateRequestOrigin(request)
    const limited = await rateLimited(request, 'forgot-password', 5)
    if (limited) return limited
    const input = parseForgotPasswordInput(await request.json())
    await forgotPassword(input)
    return successResponse({
      message: 'If the email exists, a password reset link has been sent',
    })
  } catch (error) {
    console.error('Forgot password API error:', error)
    return errorResponse(error)
  }
}

export async function resetPasswordHandler(request: Request) {
  try {
    validateRequestOrigin(request)
    const limited = await rateLimited(request, 'reset-password', 5)
    if (limited) return limited
    const input = parseResetPasswordInput(await request.json())
    await resetPassword(input)
    return successResponse({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Reset password API error:', error)
    return errorResponse(error)
  }
}

async function currentUserResponse(
  getter: typeof getCurrentUser,
  errorMessage: string,
) {
  try {
    const result = await getter()
    if (!result) {
      return httpError('Unauthorized', 401, 'unauthorized')
    }

    return successResponse({
      user: result.user,
      profile: result.profile,
    })
  } catch (error) {
    console.error(`${errorMessage} API error:`, error)
    return errorResponse(error)
  }
}

export function currentUserHandler() {
  return currentUserResponse(getCurrentUser, 'Get current user')
}

export function currentProfileHandler() {
  return currentUserResponse(getCurrentProfile, 'Get profile')
}

export async function updateProfileHandler(request: Request) {
  try {
    validateRequestOrigin(request)
    const input = parseUpdateProfileInput(await request.json())
    const result = await updateProfile(input)
    if (!result) {
      return httpError('Unauthorized', 401, 'unauthorized')
    }
    return successResponse(result)
  } catch (error) {
    console.error('Update profile API error:', error)
    return errorResponse(error)
  }
}

export async function verificationStatusHandler() {
  try {
    const status = await getVerificationStatus()
    if (!status) {
      return httpError('Unauthorized', 401, 'unauthorized')
    }
    return successResponse(status)
  } catch (error) {
    console.error('Verification status API error:', error)
    return errorResponse(error)
  }
}

export async function resendVerificationHandler(request: Request) {
  try {
    validateRequestOrigin(request)
    const limited = await rateLimited(request, 'resend-verification', 3)
    if (limited) return limited
    const input = parseForgotPasswordInput(await request.json())
    await resendVerification(input)
    return successResponse({
      message: 'If the account is eligible, a verification email has been sent',
    })
  } catch (error) {
    console.error('Resend verification API error:', error)
    return errorResponse(error)
  }
}

export async function changeEmailHandler(request: Request) {
  try {
    validateRequestOrigin(request)
    const limited = await rateLimited(request, 'change-email', 3)
    if (limited) return limited
    const result = await changeEmail(parseChangeEmailInput(await request.json()))
    await writeAuthAuditEvent({
      actorId: result.user.id,
      action: 'user.email_change_requested',
      targetUserId: result.user.id,
    })
    return successResponse({ message: 'Email change confirmation sent' })
  } catch (error) {
    console.error('Change email API error:', error)
    return errorResponse(error)
  }
}

export async function changePasswordHandler(request: Request) {
  try {
    validateRequestOrigin(request)
    const limited = await rateLimited(request, 'change-password', 5)
    if (limited) return limited
    const result = await changePassword(parseChangePasswordInput(await request.json()))
    if (!result) return httpError('Unauthorized', 401, 'unauthorized')
    await writeAuthAuditEvent({
      actorId: result.userId,
      action: 'user.password_changed',
      targetUserId: result.userId,
    })
    return successResponse({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password API error:', error)
    return errorResponse(error)
  }
}

export async function deleteAccountHandler(request: Request) {
  try {
    validateRequestOrigin(request)
    const limited = await rateLimited(request, 'delete-account', 5)
    if (limited) return limited
    const result = await deleteAccount(parseDeleteAccountInput(await request.json()))
    if (!result) return httpError('Unauthorized', 401, 'unauthorized')
    await writeAuthAuditEvent({
      actorId: result.userId,
      action: 'user.account_deleted',
      targetUserId: result.userId,
    })
    return successResponse({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Delete account API error:', error)
    return errorResponse(error)
  }
}

export async function setUserRoleHandler(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    validateRequestOrigin(request)
    const auth = await requireApiRole(['super_admin'])
    if (auth.error) {
      return httpError(auth.error, auth.status, auth.status === 401 ? 'unauthorized' : 'forbidden')
    }
    const { userId: rawUserId } = await context.params
    const userId = parseUserId(rawUserId)
    const result = await setUserRole(userId, parseSetUserRoleInput(await request.json()))
    if (!result) return httpError('Profile not found', 404, 'not_found')
    return successResponse({ profile: result })
  } catch (error) {
    console.error('Set user role API error:', error)
    return errorResponse(error)
  }
}

export async function adminHandler() {
  try {
    const auth = await requireApiRole(['admin', 'super_admin'])
    if (auth.error) {
      return httpError(
        auth.error,
        auth.status,
        auth.status === 401 ? 'unauthorized' : 'forbidden',
      )
    }

    return successResponse({
      message: 'Admin API access granted',
      user: auth.user,
      profile: auth.profile,
    })
  } catch (error) {
    console.error('Admin API error:', error)
    return errorResponse(error)
  }
}

function callbackErrorUrl(error: unknown, origin: string) {
  const details = getErrorDetails(error)
  const url = new URL('/auth/error', origin)
  const message =
    process.env.NODE_ENV !== 'production' || details.status < 500
      ? details.message
      : 'An internal server error occurred'
  url.searchParams.set('error', message)
  url.searchParams.set('code', details.code)
  return url
}

export async function authCallbackHandler(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const flowId = requestUrl.searchParams.get('sb_flow_id')
  let safeNext = '/'
  try {
    safeNext = safeRedirectPath(requestUrl.searchParams.get('next'))
  } catch {
    safeNext = '/'
  }

  const providerError = requestUrl.searchParams.get('error')
  if (providerError) {
    return NextResponse.redirect(
      callbackErrorUrl(
        {
          message:
            providerError === 'access_denied'
              ? 'Google authentication was cancelled'
              : 'Google authentication failed',
          code: providerError === 'access_denied' ? 'oauth_access_denied' : 'oauth_provider_error',
          status: 400,
        },
        requestUrl.origin,
      ),
    )
  }

  if (!code) {
    return NextResponse.redirect(
      callbackErrorUrl(
        {
          message: 'Authentication code is missing',
          code: 'missing_auth_code',
          status: 400,
        },
        requestUrl.origin,
      ),
    )
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined,
    )

    if (error) throw error
    await writeAuthAuditEvent({
      actorId: data.user.id,
      action: 'user.oauth_completed',
      targetUserId: data.user.id,
      metadata: {
        provider: data.user.app_metadata.provider ?? 'unknown',
      },
    })
    return NextResponse.redirect(new URL(safeNext, requestUrl.origin))
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(callbackErrorUrl(error, requestUrl.origin))
  }
}
