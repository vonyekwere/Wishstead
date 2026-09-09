import 'server-only'

import { NextResponse } from 'next/server'
import { RequestValidationError } from '@/features/auth/server/validation'

type ErrorDetails = {
  message: string
  code: string
  status: number
}

type ErrorLike = {
  message?: unknown
  code?: unknown
  status?: unknown
  name?: unknown
}

const AUTH_STATUS_BY_CODE: Record<string, number> = {
  bad_code_verifier: 400,
  bad_oauth_callback: 400,
  bad_oauth_state: 400,
  bad_jwt: 401,
  email_not_confirmed: 403,
  invalid_credentials: 401,
  no_authorization: 401,
  not_admin: 403,
  flow_state_expired: 400,
  flow_state_not_found: 400,
  oauth_provider_not_supported: 400,
  provider_disabled: 503,
  refresh_token_not_found: 401,
  refresh_token_already_used: 401,
  session_not_found: 401,
  user_not_found: 404,
  user_banned: 403,
  weak_password: 422,
  validation_failed: 400,
}

const DATABASE_STATUS_BY_CODE: Record<string, number> = {
  '22P02': 400,
  '23503': 409,
  '23505': 409,
  '42501': 403,
  PGRST116: 404,
  P0002: 404,
}

function isErrorLike(error: unknown): error is ErrorLike {
  return typeof error === 'object' && error !== null
}

function validHttpStatus(value: unknown) {
  return typeof value === 'number' && value >= 400 && value <= 599
    ? value
    : undefined
}

export function getErrorDetails(error: unknown): ErrorDetails {
  if (error instanceof RequestValidationError) {
    return { message: error.message, code: 'validation_error', status: 400 }
  }

  if (error instanceof SyntaxError) {
    return { message: 'Malformed JSON request body', code: 'invalid_json', status: 400 }
  }

  if (isErrorLike(error)) {
    const message =
      typeof error.message === 'string' && error.message
        ? error.message
        : 'An unknown error occurred'
    const code =
      typeof error.code === 'string' && error.code
        ? error.code
        : typeof error.name === 'string' && error.name
          ? error.name
          : 'internal_error'
    const suppliedStatus = validHttpStatus(error.status)
    const status =
      AUTH_STATUS_BY_CODE[code] ??
      DATABASE_STATUS_BY_CODE[code] ??
      suppliedStatus ??
      500

    return { message, code, status }
  }

  if (typeof error === 'string' && error) {
    return { message: error, code: 'internal_error', status: 500 }
  }

  return {
    message: 'An unknown error occurred',
    code: 'unknown_error',
    status: 500,
  }
}

export function isMissingAuthSession(error: unknown) {
  return (
    isErrorLike(error) &&
    (error.name === 'AuthSessionMissingError' || error.code === 'session_not_found')
  )
}

export function errorResponse(error: unknown, headers?: HeadersInit) {
  const details = getErrorDetails(error)
  const requestId = crypto.randomUUID()
  const exposeOriginal =
    process.env.NODE_ENV !== 'production' || details.status < 500
  const message = exposeOriginal
    ? details.message
    : 'An internal server error occurred'

  const responseHeaders = new Headers(headers)
  responseHeaders.set('Cache-Control', 'no-store')
  responseHeaders.set('X-Request-Id', requestId)

  return NextResponse.json(
    {
      success: false,
      error: message,
      code: details.code,
      requestId,
    },
    {
      status: details.status,
      headers: responseHeaders,
    },
  )
}

export function httpError(
  message: string,
  status: number,
  code: string,
  headers?: HeadersInit,
) {
  return errorResponse({ message, status, code }, headers)
}
