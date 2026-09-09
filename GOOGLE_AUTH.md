# Google OAuth backend

`POST /api/auth/google` accepts an optional JSON body such as
`{"next":"/dashboard"}` and returns a Google authorization URL. The UI should
navigate the browser to that URL. First-time Google signup and returning-user
sign-in use the same endpoint. Supabase returns the browser to `/auth/callback`,
where the server exchanges the one-time PKCE code for HttpOnly session cookies.

## Google Cloud configuration

Create a Web OAuth client and register the Supabase callback URI, not the
Next.js callback directly:

- Local: `http://127.0.0.1:54321/auth/v1/callback`
- Hosted: `https://<project-ref>.supabase.co/auth/v1/callback`

Add the application's local and production origins in Google Cloud as authorized
JavaScript origins.

## Local Supabase

Set these environment variables outside source control:

```text
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=
```

Change `[auth.external.google].enabled` in `supabase/config.toml` to `true`, then
restart Supabase. Add `http://localhost:3000/auth/callback` to the Supabase Auth
redirect allow-list (the repository's local configuration already permits local
port 3000 paths).

## Hosted Supabase

Enable Google under Auth Providers and enter the production Google credentials.
Add the exact HTTPS production callback URL to the Auth redirect allow-list.
Keep the Google secret only in Google/Supabase configuration; it is never needed
by browser code or the Next.js endpoint.

Google-created profiles always begin with the `customer` role. Provider metadata
is normalized into `full_name` and `avatar_url`; OAuth metadata cannot select an
elevated application role.
