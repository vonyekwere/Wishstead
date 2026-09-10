import nextEnv from '@next/env'
import { createClient } from '@supabase/supabase-js'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

const targetArgument = process.argv.find((argument) => argument.startsWith('--target='))
const target = targetArgument?.split('=')[1]

if (!['local', 'production'].includes(target)) {
  throw new Error('Use --target=local or --target=production')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const secretKey = process.env.SUPABASE_SECRET_KEY?.trim()
const isLocalUrl = /^https?:\/\/(127\.0\.0\.1|localhost):54321\/?$/i.test(supabaseUrl ?? '')

if (!supabaseUrl || !secretKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required')
}
if (target === 'local' && !isLocalUrl) {
  throw new Error(`Local seed refused: ${supabaseUrl} is not the local Supabase URL`)
}
if (target === 'production' && isLocalUrl) {
  throw new Error('Production seed refused: the configured Supabase URL is local')
}
if (target === 'production' && process.env.WISHSTEAD_CONFIRM_PRODUCTION_SEED !== 'YES') {
  throw new Error('Set WISHSTEAD_CONFIRM_PRODUCTION_SEED=YES to seed a production project')
}

function privilegedValue(name) {
  const primary = process.env[`WISHSTEAD_${name}`]
  const localFallback = target === 'local' ? process.env[`WISHSTEAD_TEST_${name}`] : undefined
  return primary ?? localFallback
}

const accounts = [
  {
    role: 'admin',
    email: privilegedValue('ADMIN_EMAIL')?.trim().toLowerCase(),
    fullName: privilegedValue('ADMIN_NAME')?.trim(),
    password: privilegedValue('ADMIN_PASSWORD'),
  },
  {
    role: 'super_admin',
    email: privilegedValue('SUPER_ADMIN_EMAIL')?.trim().toLowerCase(),
    fullName: privilegedValue('SUPER_ADMIN_NAME')?.trim(),
    password: privilegedValue('SUPER_ADMIN_PASSWORD'),
  },
]

for (const account of accounts) {
  if (!account.email || !account.email.includes('@')) throw new Error(`A valid ${account.role} email is required`)
  if (!account.fullName) throw new Error(`${account.role} name is required`)
  if (
    !account.password ||
    account.password.length < 12 ||
    !/[A-Z]/.test(account.password) ||
    !/[a-z]/.test(account.password) ||
    !/\d/.test(account.password) ||
    !/[^A-Za-z0-9]/.test(account.password)
  ) {
    throw new Error(`${account.role} password must have 12+ characters, uppercase, lowercase, number, and special character`)
  }
}
if (accounts[0].email === accounts[1].email) throw new Error('Admin and super-admin must use different emails')

const supabase = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
})
const rotatePasswords = process.env.WISHSTEAD_SEED_ROTATE_PASSWORDS === 'true'

async function findUser(email) {
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 })
    if (error) throw new Error(`Could not list users: ${error.message}`)
    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email)
    if (user) return user
    if (data.users.length < 100) return null
  }
}

async function ensureAccount(account) {
  let user = await findUser(account.email)
  let action = 'UPDATED'

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: { full_name: account.fullName },
    })
    if (error) throw new Error(`Could not create ${account.email}: ${error.message}`)
    user = data.user
    action = 'CREATED'
  } else {
    const attributes = {
      email_confirm: true,
      user_metadata: { ...(user.user_metadata ?? {}), full_name: account.fullName },
      ...(rotatePasswords ? { password: account.password } : {}),
    }
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, attributes)
    if (error) throw new Error(`Could not update ${account.email}: ${error.message}`)
    user = data.user
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: account.fullName, role: account.role })
    .eq('id', user.id)
    .select('id, role')
    .single()
  if (profileError) throw new Error(`Could not assign ${account.role} to ${account.email}: ${profileError.message}`)

  const { error: auditError } = await supabase.from('auth_audit_log').insert({
    actor_id: null,
    action: 'user.role_seeded',
    target_user_id: user.id,
    metadata: { role: profile.role, target, password_rotated: Boolean(rotatePasswords && action === 'UPDATED') },
  })
  if (auditError) throw new Error(`Account updated but audit logging failed for ${account.email}: ${auditError.message}`)

  console.log(`${action}: ${account.email} -> ${profile.role}`)
}

console.log(`Seeding Wishstead privileged users into ${target}: ${supabaseUrl}`)
for (const account of accounts) await ensureAccount(account)
console.log('Admin seed completed. Use /auth/login to sign in.')
