<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Accounts are invitation-only: invitations store only a SHA-256 hash of a single-use token, and accepting runs server-side in `src/lib/accounts.functions.ts`; why: the raw link is the credential and must never be stored or reusable.
- All role decisions live in `src/lib/access-rules.ts` (tested) and are enforced in server functions plus RLS; why: the browser is never trusted for roles.
- Roles live only in `public.user_roles`; owner is granted solely by `claimOwner` when the verified email matches the `OWNER_EMAIL` secret; why: no first-visitor or client-flag ownership.
- Private pages live under `src/routes/_authenticated/` (client-only gate redirecting to `/auth?redirect=`); why: session is in browser storage and return-to must survive sign-in.
