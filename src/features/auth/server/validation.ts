import 'server-only'

import type {
  ForgotPasswordInput,
  ChangeEmailInput,
  ChangePasswordInput,
  DeleteAccountInput,
  LoginInput,
  ResetPasswordInput,
  SignUpInput,
  SetUserRoleInput,
  UpdateProfileInput,
} from '@/features/auth/types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LENGTH = 254
const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 128
const MAX_NAME_LENGTH = 120
const MAX_AVATAR_URL_LENGTH = 2048
const USER_ROLES = ['customer', 'vendor', 'admin', 'super_admin'] as const

export class RequestValidationError extends Error {}

export class RequestSecurityError extends Error {
  readonly code = 'invalid_origin'
  readonly status = 403
}

export function validateRequestOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return

  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const host = forwardedHost || request.headers.get('host')
  const forwardedProtocol = request.headers
    .get('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim()
  const protocol = forwardedProtocol || new URL(request.url).protocol.slice(0, -1)

  let originUrl: URL
  try {
    originUrl = new URL(origin)
  } catch {
    throw new RequestSecurityError('Request origin is invalid')
  }

  if (!host || originUrl.host !== host || originUrl.protocol !== `${protocol}:`) {
    throw new RequestSecurityError('Request origin is not allowed')
  }
}

function objectBody(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new RequestValidationError('Request body must be a JSON object')
  }
  return value as Record<string, unknown>
}

function requiredString(
  body: Record<string, unknown>,
  key: string,
  label: string,
) {
  const value = body[key]
  if (typeof value !== 'string' || !value.trim()) {
    throw new RequestValidationError(`${label} is required`)
  }
  return value.trim()
}

function optionalString(body: Record<string, unknown>, key: string) {
  const value = body[key]
  if (value === undefined) return undefined
  if (typeof value !== 'string' || !value.trim()) {
    throw new RequestValidationError(`${key} must be a non-empty string`)
  }
  return value.trim()
}

function email(body: Record<string, unknown>) {
  const value = requiredString(body, 'email', 'Email').toLowerCase()
  if (value.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(value)) {
    throw new RequestValidationError('Enter a valid email address')
  }
  return value
}

function password(body: Record<string, unknown>) {
  const value = body.password
  if (typeof value !== 'string' || !value) {
    throw new RequestValidationError('Password is required')
  }
  if (value.length < MIN_PASSWORD_LENGTH || value.length > MAX_PASSWORD_LENGTH) {
    throw new RequestValidationError(
      `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`,
    )
  }
  return value
}

function captchaToken(body: Record<string, unknown>) {
  return optionalString(body, 'captchaToken')
}

export function parseLoginInput(value: unknown): LoginInput {
  const body = objectBody(value)
  return { email: email(body), password: password(body), captchaToken: captchaToken(body) }
}

export function parseSignUpInput(value: unknown): SignUpInput {
  const body = objectBody(value)
  const fullName = requiredString(body, 'fullName', 'Full name')
  if (fullName.length > MAX_NAME_LENGTH) {
    throw new RequestValidationError(`Full name must not exceed ${MAX_NAME_LENGTH} characters`)
  }
  return { email: email(body), password: password(body), fullName, captchaToken: captchaToken(body) }
}

export function parseForgotPasswordInput(value: unknown): ForgotPasswordInput {
  const body = objectBody(value)
  return { email: email(body), captchaToken: captchaToken(body) }
}

export function parseResetPasswordInput(value: unknown): ResetPasswordInput {
  return { password: password(objectBody(value)) }
}

export function parseChangePasswordInput(value: unknown): ChangePasswordInput {
  const body = objectBody(value)
  const newPassword = password(body)
  const currentPassword = requiredString(body, 'currentPassword', 'Current password')
  if (currentPassword === newPassword) {
    throw new RequestValidationError('New password must be different from the current password')
  }
  return { currentPassword, password: newPassword }
}

export function parseChangeEmailInput(value: unknown): ChangeEmailInput {
  return { email: email(objectBody(value)) }
}

export function parseDeleteAccountInput(value: unknown): DeleteAccountInput {
  const body = objectBody(value)
  return { password: requiredString(body, 'password', 'Password') }
}

export function parseSetUserRoleInput(value: unknown): SetUserRoleInput {
  const body = objectBody(value)
  const role = requiredString(body, 'role', 'Role')
  if (!USER_ROLES.includes(role as (typeof USER_ROLES)[number])) {
    throw new RequestValidationError('Role is invalid')
  }
  return { role: role as SetUserRoleInput['role'] }
}

export function parseUserId(value: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new RequestValidationError('User ID must be a valid UUID')
  }
  return value
}

export function parseUpdateProfileInput(value: unknown): UpdateProfileInput {
  const body = objectBody(value)
  const result: UpdateProfileInput = {}

  if ('fullName' in body) {
    if (body.fullName === null) result.fullName = null
    else {
      const fullName = requiredString(body, 'fullName', 'Full name')
      if (fullName.length > MAX_NAME_LENGTH) {
        throw new RequestValidationError(`Full name must not exceed ${MAX_NAME_LENGTH} characters`)
      }
      result.fullName = fullName
    }
  }

  if ('avatarUrl' in body) {
    if (body.avatarUrl === null || body.avatarUrl === '') result.avatarUrl = null
    else {
      const avatarUrl = requiredString(body, 'avatarUrl', 'Avatar URL')
      if (avatarUrl.length > MAX_AVATAR_URL_LENGTH) {
        throw new RequestValidationError('Avatar URL is too long')
      }
      let parsed: URL
      try {
        parsed = new URL(avatarUrl)
      } catch {
        throw new RequestValidationError('Avatar URL must be a valid URL')
      }
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new RequestValidationError('Avatar URL must use HTTP or HTTPS')
      }
      result.avatarUrl = parsed.toString()
    }
  }

  if (result.fullName === undefined && result.avatarUrl === undefined) {
    throw new RequestValidationError('Provide fullName or avatarUrl to update')
  }
  return result
}
