-- =========================================================
-- USER ROLES
-- =========================================================

create type public.user_role as enum (
  'customer',
  'vendor',
  'admin'
);


-- =========================================================
-- PROFILES TABLE
-- =========================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  full_name text,
  avatar_url text,

  role public.user_role not null default 'customer',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- =========================================================
-- INDEX
-- =========================================================

create index profiles_role_idx
on public.profiles(role);


-- =========================================================
-- ENABLE ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles enable row level security;


-- =========================================================
-- RLS: USER CAN READ OWN PROFILE
-- =========================================================

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
);


-- =========================================================
-- RLS: USER CAN UPDATE OWN PROFILE
-- =========================================================

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (
  auth.uid() = id
)
with check (
  auth.uid() = id
);


-- =========================================================
-- AUTOMATIC PROFILE CREATION
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin

  insert into public.profiles (
    id,
    full_name,
    role
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    'customer'
  );

  return new;

end;
$$;


-- =========================================================
-- AUTH USER CREATED TRIGGER
-- =========================================================

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();


-- =========================================================
-- UPDATED_AT FUNCTION
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin

  new.updated_at = now();

  return new;

end;
$$;


-- =========================================================
-- UPDATED_AT TRIGGER
-- =========================================================

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute procedure public.set_updated_at();