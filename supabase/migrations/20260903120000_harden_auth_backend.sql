create table public.auth_rate_limits (
  scope text not null,
  client_id text not null,
  request_count integer not null,
  reset_at timestamptz not null,
  primary key (scope, client_id)
);

revoke all on table public.auth_rate_limits from public, anon, authenticated;

create index auth_rate_limits_reset_at_idx
on public.auth_rate_limits (reset_at);

create or replace function public.check_auth_rate_limit(
  p_scope text,
  p_client_id text,
  p_request_limit integer,
  p_window_seconds integer
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
  current_reset_at timestamptz;
begin
  if p_scope = '' or p_client_id = '' or p_request_limit < 1 or p_window_seconds < 1 then
    raise exception 'Invalid rate limit arguments' using errcode = '22023';
  end if;

  insert into public.auth_rate_limits as limits (
    scope,
    client_id,
    request_count,
    reset_at
  )
  values (
    p_scope,
    p_client_id,
    1,
    now() + make_interval(secs => p_window_seconds)
  )
  on conflict (scope, client_id) do update
  set
    request_count = case
      when limits.reset_at <= now() then 1
      else limits.request_count + 1
    end,
    reset_at = case
      when limits.reset_at <= now() then now() + make_interval(secs => p_window_seconds)
      else limits.reset_at
    end
  returning request_count, reset_at
  into current_count, current_reset_at;

  delete from public.auth_rate_limits
  where reset_at < now() - interval '1 day';

  if current_count > p_request_limit then
    return greatest(1, ceil(extract(epoch from (current_reset_at - now())))::integer);
  end if;

  return 0;
end;
$$;

revoke all on function public.check_auth_rate_limit(text, text, integer, integer)
from public, anon, authenticated;

grant execute on function public.check_auth_rate_limit(text, text, integer, integer)
to service_role;

alter table public.profiles
add constraint profiles_full_name_length_check
check (full_name is null or char_length(full_name) between 1 and 120),
add constraint profiles_avatar_url_length_check
check (avatar_url is null or char_length(avatar_url) <= 2048),
add constraint profiles_avatar_url_protocol_check
check (avatar_url is null or avatar_url ~* '^https?://');
