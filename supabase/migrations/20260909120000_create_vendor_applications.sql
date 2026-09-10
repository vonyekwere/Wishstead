create type public.vendor_application_status as enum (
  'pending',
  'approved',
  'rejected'
);

create table public.vendor_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  business_name text not null check (char_length(business_name) between 2 and 160),
  business_description text not null check (char_length(business_description) between 20 and 2000),
  website_url text check (
    website_url is null or
    (char_length(website_url) <= 2048 and website_url ~* '^https?://')
  ),
  primary_category text not null check (char_length(primary_category) between 2 and 100),
  logo_path text check (logo_path is null or char_length(logo_path) <= 500),
  status public.vendor_application_status not null default 'pending',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text check (
    rejection_reason is null or char_length(rejection_reason) <= 1000
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vendor_applications enable row level security;
revoke all on table public.vendor_applications from public, anon, authenticated;
grant select on table public.vendor_applications to authenticated;

create policy "Users can view own vendor application"
on public.vendor_applications
for select
to authenticated
using (auth.uid() = user_id);

create trigger vendor_applications_set_updated_at
before update on public.vendor_applications
for each row execute procedure public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vendor-logos',
  'vendor-logos',
  false,
  5242880,
  array['image/png', 'image/jpeg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

create index vendor_applications_status_created_idx
on public.vendor_applications (status, created_at desc);

