This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
## Admin and super-admin seeding

Admin roles are never available through public signup. Add the six
`WISHSTEAD_ADMIN_*` and `WISHSTEAD_SUPER_ADMIN_*` values shown in
`.env.example`, together with the target project's Supabase URL and secret
service key.

For local development only, the existing `WISHSTEAD_TEST_ADMIN_*` and
`WISHSTEAD_TEST_SUPER_ADMIN_*` variables are accepted as fallbacks.

For local Supabase:

```bash
npm run seed:admins:local
```

For the hosted production project, load its production environment variables,
set `WISHSTEAD_CONFIRM_PRODUCTION_SEED=YES`, then run:

```bash
npm run seed:admins:production
```

The command is repeatable: it creates missing accounts and synchronizes names
and roles. It does not change an existing password unless
`WISHSTEAD_SEED_ROTATE_PASSWORDS=true`. Both roles sign in through
`/auth/login` and reach the same role-aware `/dashboard`.

## Production authentication email templates

The version-controlled source templates are in `supabase/templates`. Local
Supabase loads them through `supabase/config.toml`. Before launch, copy each
template into the matching Supabase Dashboard section under Authentication →
Email Templates, and enable the password-changed security notification. Hosted
Supabase does not deploy local template files through database migrations.
