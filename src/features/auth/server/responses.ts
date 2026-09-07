import 'server-only'

import { NextResponse } from 'next/server'

export function successResponse<T extends Record<string, unknown>>(
  payload: T,
  status = 200,
  headers?: HeadersInit,
) {
  const responseHeaders = new Headers(headers)
  responseHeaders.set('Cache-Control', 'no-store')
  return NextResponse.json(
    { success: true, ...payload },
    { status, headers: responseHeaders },
  )
}
