'use client'

export type ApiErrorBody = {
  success: false
  error: string
  code: string
  requestId?: string
}

export class AuthApiError extends Error {
  readonly code: string
  readonly status: number
  readonly requestId?: string

  constructor(body: ApiErrorBody, status: number) {
    super(body.error)
    this.name = 'AuthApiError'
    this.code = body.code
    this.status = status
    this.requestId = body.requestId
  }
}

export async function authRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, {
      ...init,
      credentials: 'same-origin',
      headers:
        init?.body instanceof FormData
          ? init.headers
          : { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new Error('Unable to reach the server. Check your connection and try again.')
  }

  const body = (await response.json().catch(() => null)) as
    | (T & { success: true })
    | ApiErrorBody
    | null
  if (!response.ok || !body || body.success === false) {
    if (body && body.success === false) throw new AuthApiError(body, response.status)
    throw new Error('The server returned an invalid response. Please try again.')
  }
  return body
}

export async function beginGoogleOAuth(next = '/dashboard') {
  const result = await authRequest<{ success: true; url: string }>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ next }),
  })
  window.location.assign(result.url)
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
