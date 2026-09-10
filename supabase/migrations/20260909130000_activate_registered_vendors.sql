alter table public.vendor_applications
alter column status set default 'approved'::public.vendor_application_status;

create or replace function public.activate_registered_vendor()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set role = 'vendor' where id = new.user_id;
  new.status := 'approved';
  new.reviewed_at := coalesce(new.reviewed_at, now());
  return new;
end;
$$;

revoke execute on function public.activate_registered_vendor() from public, anon, authenticated;

create trigger vendor_applications_activate_vendor
before insert on public.vendor_applications
for each row execute procedure public.activate_registered_vendor();

update public.profiles as profiles
set role = 'vendor'
where exists (
  select 1 from public.vendor_applications as applications
  where applications.user_id = profiles.id
);

update public.vendor_applications
set status = 'approved', reviewed_at = coalesce(reviewed_at, now())
where status = 'pending';
