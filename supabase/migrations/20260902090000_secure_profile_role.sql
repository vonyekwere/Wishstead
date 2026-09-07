REVOKE UPDATE ON TABLE public.profiles FROM authenticated;

GRANT UPDATE (full_name, avatar_url)
ON TABLE public.profiles
TO authenticated;