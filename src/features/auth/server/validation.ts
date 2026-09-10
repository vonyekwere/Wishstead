import 'server-only'

import type {
  ForgotPasswordInput,
  ChangeEmailInput,
  ChangePasswordInput,
  DeleteAccountInput,
  LoginInput,
  OAuthInput,
  ResetPasswordInput,
  SignUpInput,
  SetUserRoleInput,
  UpdateProfileInput,
  VendorApplicationInput,
} from '@/features/auth/types'
import { isStrongPassword, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/features/auth/password-policy'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LENGTH = 254
const MAX_NAME_LENGTH = 120
const MAX_AVATAR_URL_LENGTH = 2048
const MAX_REDIRECT_PATH_LENGTH = 2048
const MAX_BUSINESS_NAME_LENGTH = 160
const MAX_BUSINESS_DESCRIPTION_LENGTH = 2000
const MAX_CATEGORY_LENGTH = 100
const MAX_LOGO_SIZE = 5 * 1024 * 1024
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
  if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
    throw new RequestValidationError(
      `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters`,
    )
  }
  return value
}

function newPassword(body: Record<string, unknown>) {
  const value = password(body)
  if (!isStrongPassword(value)) {
    throw new RequestValidationError(
      'Password must include uppercase, lowercase, number, and special characters',
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

export function safeRedirectPath(value: unknown, fallback = '/') {
  if (value === undefined || value === null || value === '') return fallback
  if (
    typeof value !== 'string' ||
    value.length > MAX_REDIRECT_PATH_LENGTH ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    throw new RequestValidationError('Redirect path is invalid')
  }

  const parsed = new URL(value, 'http://wishstead.local')
  if (parsed.origin !== 'http://wishstead.local') {
    throw new RequestValidationError('Redirect path is invalid')
  }
  return `${parsed.pathname}${parsed.search}${parsed.hash}`
}

export function parseOAuthInput(value: unknown): OAuthInput {
  if (value === undefined || value === null) return { next: '/' }
  const body = objectBody(value)
  return { next: safeRedirectPath(body.next) }
}

function requiredFormString(formData: FormData, key: string, label: string) {
  const value = formData.get(key)
  if (typeof value !== 'string' || !value.trim()) {
    throw new RequestValidationError(`${label} is required`)
  }
  return value.trim()
}

export function parseVendorApplicationInput(
  formData: FormData,
): VendorApplicationInput {
  const fullName = requiredFormString(formData, 'fullName', 'Full name')
  const emailValue = requiredFormString(formData, 'email', 'Email')
  const passwordValue = requiredFormString(formData, 'password', 'Password')
  const businessName = requiredFormString(formData, 'businessName', 'Business name')
  const businessDescription = requiredFormString(
    formData,
    'businessDescription',
    'Business description',
  )
  const primaryCategory = requiredFormString(
    formData,
    'primaryCategory',
    'Primary category',
  )
  const websiteValue = formData.get('websiteUrl')
  const websiteUrl =
    typeof websiteValue === 'string' && websiteValue.trim()
      ? websiteValue.trim()
      : null
  const logoValue = formData.get('logo')
  const logo = logoValue instanceof File && logoValue.size > 0 ? logoValue : null

  if (fullName.length > MAX_NAME_LENGTH) {
    throw new RequestValidationError(`Full name must not exceed ${MAX_NAME_LENGTH} characters`)
  }
  if (businessName.length < 2 || businessName.length > MAX_BUSINESS_NAME_LENGTH) {
    throw new RequestValidationError('Business name must be between 2 and 160 characters')
  }
  if (
    businessDescription.length < 20 ||
    businessDescription.length > MAX_BUSINESS_DESCRIPTION_LENGTH
  ) {
    throw new RequestValidationError(
      'Business description must be between 20 and 2000 characters',
    )
  }
  if (primaryCategory.length < 2 || primaryCategory.length > MAX_CATEGORY_LENGTH) {
    throw new RequestValidationError('Primary category must be between 2 and 100 characters')
  }
  if (websiteUrl) {
    if (websiteUrl.length > MAX_AVATAR_URL_LENGTH) {
      throw new RequestValidationError('Website URL is too long')
    }
    let parsedWebsite: URL
    try {
      parsedWebsite = new URL(websiteUrl)
    } catch {
      throw new RequestValidationError('Website URL must be valid')
    }
    if (!['http:', 'https:'].includes(parsedWebsite.protocol)) {
      throw new RequestValidationError('Website URL must use HTTP or HTTPS')
    }
  }
  if (logo && !['image/png', 'image/jpeg'].includes(logo.type)) {
    throw new RequestValidationError('Logo must be a PNG or JPEG image')
  }
  if (logo && logo.size > MAX_LOGO_SIZE) {
    throw new RequestValidationError('Logo must not exceed 5MB')
  }

  const credentials = parseSignUpInput({
    fullName,
    email: emailValue,
    password: passwordValue,
  })
  return {
    ...credentials,
    businessName,
    businessDescription,
    websiteUrl: websiteUrl ? new URL(websiteUrl).toString() : null,
    primaryCategory,
    logo,
  }
}

export function parseSignUpInput(value: unknown): SignUpInput {
  const body = objectBody(value)
  const fullName = requiredString(body, 'fullName', 'Full name')
  if (fullName.length > MAX_NAME_LENGTH) {
    throw new RequestValidationError(`Full name must not exceed ${MAX_NAME_LENGTH} characters`)
  }
  return { email: email(body), password: newPassword(body), fullName, captchaToken: captchaToken(body) }
}

export function parseForgotPasswordInput(value: unknown): ForgotPasswordInput {
  const body = objectBody(value)
  return { email: email(body), captchaToken: captchaToken(body) }
}

export function parseResetPasswordInput(value: unknown): ResetPasswordInput {
  return { password: newPassword(objectBody(value)) }
}

export function parseChangePasswordInput(value: unknown): ChangePasswordInput {
  const body = objectBody(value)
  const newPasswordValue = newPassword(body)
  const currentPassword = requiredString(body, 'currentPassword', 'Current password')
  if (currentPassword === newPasswordValue) {
    throw new RequestValidationError('New password must be different from the current password')
  }
  return { currentPassword, password: newPasswordValue }
}

export function parseChangeEmailInput(value: unknown): ChangeEmailInput {
  return { email: email(objectBody(value)) }
}

export function parseDeleteAccountInput(value: unknown): DeleteAccountInput {
  const body = objectBody(value)
  const confirmation = requiredString(body, 'confirmation', 'Confirmation')
  if (confirmation !== 'DELETE') {
    throw new RequestValidationError('Type DELETE to confirm account deletion')
  }
  const passwordValue = body.password
  if (passwordValue !== undefined && typeof passwordValue !== 'string') {
    throw new RequestValidationError('Password must be a string')
  }
  return {
    confirmation,
    password: typeof passwordValue === 'string' && passwordValue ? passwordValue : undefined,
  }
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
