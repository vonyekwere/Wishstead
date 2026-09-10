import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('all required authentication route contracts exist', async () => {
  const routes = {
    'src/app/api/auth/signup/route.ts': 'POST',
    'src/app/api/auth/login/route.ts': 'POST',
    'src/app/api/auth/google/route.ts': 'POST',
    'src/app/api/auth/vendor-application/route.ts': 'POST',
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
  const validation = await read('src/features/auth/server/validation.ts')

  assert.match(service, /\/auth\/callback\?next=\/auth\/reset-password/)
  assert.match(handlers, /exchangeCodeForSession/)
  assert.match(handlers, /safeRedirectPath/)
  assert.match(validation, /value\.startsWith\('\/\/'\)/)
})

test('Google OAuth uses a server-side PKCE callback and safe local redirects', async () => {
  const service = await read('src/features/auth/server/service.ts')
  const handlers = await read('src/features/auth/server/http-handlers.ts')
  const validation = await read('src/features/auth/server/validation.ts')

  assert.match(service, /signInWithOAuth/)
  assert.match(service, /provider:\s*'google'/)
  assert.match(service, /skipBrowserRedirect:\s*true/)
  assert.match(handlers, /exchangeCodeForSession/)
  assert.match(handlers, /oauth_access_denied/)
  assert.match(validation, /safeRedirectPath/)
  assert.match(validation, /value\.startsWith\('\/\/'\)/)
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

test('Google profile metadata is normalized by the auth trigger', async () => {
  const migration = await read('supabase/migrations/20260908120000_support_google_auth_profiles.sql')
  assert.match(migration, /raw_user_meta_data ->> 'name'/i)
  assert.match(migration, /raw_user_meta_data ->> 'picture'/i)
  assert.match(migration, /values \(new\.id, profile_name, profile_avatar, 'customer'\)/i)
  assert.match(migration, /revoke execute on function public\.handle_new_user/i)
})

test('vendor applications are private, constrained, and least privileged', async () => {
  const migration = await read('supabase/migrations/20260909120000_create_vendor_applications.sql')
  const service = await read('src/features/auth/server/service.ts')
  assert.match(migration, /alter table public\.vendor_applications enable row level security/i)
  assert.match(migration, /auth\.uid\(\) = user_id/i)
  assert.match(migration, /'vendor-logos'/i)
  assert.match(service, /vendor_applications/)
  assert.match(service, /deleteUser\(data\.user\.id\)/)
})

test('successful vendor registration assigns the vendor role atomically', async () => {
  const migration = await read('supabase/migrations/20260909130000_activate_registered_vendors.sql')
  assert.match(migration, /before insert on public\.vendor_applications/i)
  assert.match(migration, /update public\.profiles set role = 'vendor'/i)
  assert.match(migration, /new\.status := 'approved'/i)
  assert.match(migration, /where exists[\s\S]*vendor_applications/i)
  assert.match(migration, /revoke execute on function public\.activate_registered_vendor/i)
})

test('new passwords are consistently hardened and explained to users', async () => {
  const validation = await read('src/features/auth/server/validation.ts')
  const policy = await read('src/features/auth/password-policy.ts')
  const config = await read('supabase/config.toml')
  const signup = await read('src/app/(site)/signup/page.tsx')
  const vendor = await read('src/app/(site)/vender/page.tsx')
  const reset = await read('src/app/(site)/auth/reset-password/page.tsx')

  assert.match(validation, /isStrongPassword/)
  assert.match(policy, /uppercase[\s\S]*lowercase[\s\S]*number[\s\S]*symbol/)
  assert.match(config, /password_requirements = "lower_upper_letters_digits_symbols"/)
  for (const page of [signup, vendor, reset]) assert.match(page, /PasswordRequirements/)
})

test('local auth emails use branded production-portable templates', async () => {
  const config = await read('supabase/config.toml')
  const recovery = await read('supabase/templates/recovery.html')
  const confirmation = await read('supabase/templates/confirmation.html')

  assert.match(config, /auth\.email\.template\.recovery[\s\S]*templates\/recovery\.html/)
  assert.match(config, /auth\.email\.notification\.password_changed/)
  assert.match(recovery, /WISHSTEAD/)
  assert.match(recovery, /\{\{ \.ConfirmationURL \}\}/)
  assert.match(confirmation, /\{\{ \.ConfirmationURL \}\}/)
})

test('account settings are available to every role without exposing role updates', async () => {
  const page = await read('src/app/dashboard/settings/page.tsx')
  const settings = await read('src/components/dashboard/AccountSettings.tsx')
  const service = await read('src/features/auth/server/service.ts')

  assert.match(page, /customer[\s\S]*vendor[\s\S]*admin[\s\S]*super_admin/)
  assert.match(settings, /\/api\/auth\/profile/)
  assert.match(settings, /\/api\/auth\/email/)
  assert.match(settings, /\/api\/auth\/password/)
  assert.match(settings, /\/api\/auth\/account/)
  assert.doesNotMatch(settings, /setUserRole|\/role/)
  assert.match(service, /identity\.provider === 'email'/)
  assert.match(service, /last_sign_in_at[\s\S]*10 \* 60 \* 1000/)
  assert.match(service, /super_admin_deletion_forbidden/)
})
