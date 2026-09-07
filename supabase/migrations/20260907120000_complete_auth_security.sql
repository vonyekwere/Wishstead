-- Make the authorization boundary explicit instead of depending on Supabase's
-- default schema grants.
revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, avatar_url) on table public.profiles to authenticated;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- Append-only security events. There are deliberately no client-facing RLS
-- policies; only the backend service role can read or write this table.
create table public.auth_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null check (char_length(action) between 1 and 100),
  target_user_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.auth_audit_log enable row level security;
revoke all on table public.auth_audit_log from public, anon, authenticated;
grant select, insert on table public.auth_audit_log to service_role;
grant usage, select on sequence public.auth_audit_log_id_seq to service_role;

create index auth_audit_log_actor_created_idx
on public.auth_audit_log (actor_id, created_at desc);

create index auth_audit_log_target_created_idx
on public.auth_audit_log (target_user_id, created_at desc);

-- Role changes are authorized again inside PostgreSQL. The caller must be a
-- super-admin, cannot alter their own role, and every change is audited.
create or replace function public.set_user_role(
  p_target_user_id uuid,
  p_new_role public.user_role
)
returns table (id uuid, role public.user_role)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  caller_role public.user_role;
  previous_role public.user_role;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select profiles.role
  into caller_role
  from public.profiles
  where profiles.id = caller_id;

  if caller_role is distinct from 'super_admin'::public.user_role then
    raise exception 'Super-admin access required' using errcode = '42501';
  end if;

  if p_target_user_id = caller_id then
    raise exception 'Super-admins cannot change their own role' using errcode = '22023';
  end if;

  select profiles.role
  into previous_role
  from public.profiles
  where profiles.id = p_target_user_id
  for update;

  if not found then
    raise exception 'Target profile not found' using errcode = 'P0002';
  end if;

  update public.profiles
  set role = p_new_role
  where profiles.id = p_target_user_id;

  insert into public.auth_audit_log (
    actor_id,
    action,
    target_user_id,
    metadata
  ) values (
    caller_id,
    'user.role_changed',
    p_target_user_id,
    jsonb_build_object('from', previous_role, 'to', p_new_role)
  );

  return query
  select profiles.id, profiles.role
  from public.profiles
  where profiles.id = p_target_user_id;
end;
$$;

revoke all on function public.set_user_role(uuid, public.user_role)
from public, anon;
grant execute on function public.set_user_role(uuid, public.user_role)
to authenticated;

