-- Google supplies `name`, `full_name`, and `avatar_url`/`picture` depending on
-- the identity payload. Normalize those values while preserving profile
-- constraints and keeping every new account at the least-privileged role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_name text;
  profile_avatar text;
begin
  profile_name := left(
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'name'), '')
    ),
    120
  );

  profile_avatar := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'avatar_url'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'picture'), '')
  );

  if profile_avatar is not null and (
    char_length(profile_avatar) > 2048 or
    profile_avatar !~* '^https?://'
  ) then
    profile_avatar := null;
  end if;

  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, profile_name, profile_avatar, 'customer');

  return new;
end;
$$;

revoke execute on function public.handle_new_user()
from public, anon, authenticated;
