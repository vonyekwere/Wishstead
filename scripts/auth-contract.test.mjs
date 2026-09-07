import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('all required authentication route contracts exist', async () => {
  const routes = {
    'src/app/api/auth/signup/route.ts': 'POST',
    'src/app/api/auth/login/route.ts': 'POST',
    'src/app/api/auth/logout/route.ts': 'POST',
    'src/app/api/auth/me/route.ts': 'GET',
    'src/app/api/auth/profile/route.ts': 'PATCH',
    'src/app/api/auth/forgot-password/route.ts': 'POST',
    'src/app/api/auth/reset-password/route.ts': 'POST',
    'src/app/api/auth/verification-status/route.ts': 'GET',
    'src/app/api/auth/resend-verification/route.ts': 'POST',
    'src/app/api/auth/email/route.ts': 'PATCH',
    'src/app/api/auth/password/route.ts': 'PATCH',
    'src/app/api/auth/account/route.ts': 'DELETE',
    'src/app/api/admin/users/[userId]/role/route.ts': 'PATCH',
    'src/app/auth/callback/route.ts': 'GET',
  }

  await Promise.all(
    Object.entries(routes).map(async ([path, method]) => {
      const source = await read(path)
      assert.match(source, new RegExp(`as ${method}\\b`), `${path} must export ${method}`)
    }),
  )
})

test('password recovery is routed through the server-side PKCE callback', async () => {
  const service = await read('src/features/auth/server/service.ts')
  const handlers = await read('src/features/auth/server/http-handlers.ts')

  assert.match(service, /\/auth\/callback\?next=\/auth\/reset-password/)
  assert.match(handlers, /exchangeCodeForSession/)
  assert.match(handlers, /!next\.startsWith\('\/\/'\)/)
})

test('public auth responses do not serialize the session tokens', async () => {
  const handlers = await read('src/features/auth/server/http-handlers.ts')
  assert.doesNotMatch(handlers, /session:\s*result\.session/)
})

test('success and error responses are handled by separate modules', async () => {
  const handlers = await read('src/features/auth/server/http-handlers.ts')
  const successResponses = await read('src/features/auth/server/responses.ts')
  const errorResponses = await read('src/features/auth/server/errors.ts')

  assert.match(handlers, /successResponse/)
  assert.match(handlers, /errorResponse/)
  assert.match(successResponses, /success:\s*true/)
  assert.match(errorResponses, /success:\s*false/)
  assert.match(errorResponses, /validation_error/)
  assert.match(errorResponses, /invalid_json/)
  assert.match(errorResponses, /AUTH_STATUS_BY_CODE/)
  assert.match(errorResponses, /DATABASE_STATUS_BY_CODE/)
})

test('normal users cannot update their profile role', async () => {
  const migration = await read('supabase/migrations/20260902090000_secure_profile_role.sql')
  assert.match(migration, /REVOKE UPDATE ON TABLE public\.profiles FROM authenticated/i)
  assert.match(migration, /GRANT UPDATE \(full_name, avatar_url\)/i)
})

test('distributed rate limiting and profile constraints are migration-backed', async () => {
  const migration = await read('supabase/migrations/20260903120000_harden_auth_backend.sql')
  assert.match(migration, /check_auth_rate_limit/)
  assert.match(migration, /to service_role/i)
  assert.match(migration, /profiles_full_name_length_check/)
  assert.match(migration, /profiles_avatar_url_protocol_check/)
})

test('role administration is database-authorized and audited', async () => {
  const migration = await read('supabase/migrations/20260907120000_complete_auth_security.sql')
  assert.match(migration, /create table public\.auth_audit_log/i)
  assert.match(migration, /caller_role is distinct from 'super_admin'/i)
  assert.match(migration, /Super-admins cannot change their own role/i)
  assert.match(migration, /revoke all on function public\.set_user_role/i)
  assert.match(migration, /grant execute on function public\.set_user_role[\s\S]*to authenticated/i)
})

test('profile and internal function grants are explicit', async () => {
  const migration = await read('supabase/migrations/20260907120000_complete_auth_security.sql')
  assert.match(migration, /revoke all on table public\.profiles from authenticated/i)
  assert.match(migration, /grant update \(full_name, avatar_url\)/i)
  assert.match(migration, /revoke execute on function public\.handle_new_user\(\)/i)
})
