import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentPage, PageHeading } from "@/components/site/document-layout";
import { FormField, StatusLine } from "@/components/site/auth-ui";
import { supabase } from "@/integrations/supabase/client";
import { safeRedirect } from "@/lib/access-rules";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => (typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {}),
  head: () => ({
    meta: [
      { title: "Member Sign In | Itanimulli Inc." },
      { name: "description", content: "Private sign in for invited members of Itanimulli Inc." },
      { property: "og:title", content: "Member Sign In | Itanimulli Inc." },
      { property: "og:description", content: "Private sign in for invited members of Itanimulli Inc." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function toPath(href: string | undefined) {
  if (!href) return undefined;
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return undefined;
    return url.pathname + url.search;
  } catch {
    return undefined;
  }
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    setBusy(false);
    if (error) { setError("Those details didn't match an account. Check your email and password."); return; }
    navigate({ to: safeRedirect(toPath(redirect)) as "/dashboard" });
  }

  async function forgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(String(form.get("email")), { redirectTo: `${window.location.origin}/reset-password` });
    setBusy(false);
    if (error) { setError("We couldn't send the reset email. Please try again shortly."); return; }
    setNotice("If an account exists for that address, a reset link is on its way.");
  }

  return (
    <DocumentPage page="Members">
      <PageHeading eyebrow="Private Access" title="Member Sign In">
        <p>Accounts are by invitation only. If you received an invitation link, open it to set your password.</p>
      </PageHeading>
      <div className="mx-auto mt-14 max-w-md">
        {mode === "signin" ? (
          <form onSubmit={signIn} className="grid gap-7" aria-label="Sign in">
            <FormField id="email" label="Email Address"><Input id="email" name="email" type="email" autoComplete="email" required /></FormField>
            <FormField id="password" label="Password"><Input id="password" name="password" type="password" autoComplete="current-password" required /></FormField>
            {error ? <StatusLine tone="error">{error}</StatusLine> : null}
            <Button type="submit" size="lg" disabled={busy}>{busy ? "Signing In…" : "Sign In"}</Button>
            <button type="button" className="document-label text-left text-xs underline underline-offset-4" onClick={() => { setMode("forgot"); setError(null); }}>Forgot your password?</button>
          </form>
        ) : (
          <form onSubmit={forgot} className="grid gap-7" aria-label="Reset password">
            <FormField id="reset-email" label="Email Address"><Input id="reset-email" name="email" type="email" autoComplete="email" required /></FormField>
            {error ? <StatusLine tone="error">{error}</StatusLine> : null}
            {notice ? <StatusLine>{notice}</StatusLine> : null}
            <Button type="submit" size="lg" disabled={busy}>Send Reset Link</Button>
            <button type="button" className="document-label text-left text-xs underline underline-offset-4" onClick={() => { setMode("signin"); setNotice(null); }}>Back to sign in</button>
          </form>
        )}
        <p className="document-copy mt-10 text-sm">Interested in membership? <Link to="/join" className="underline underline-offset-4">Express interest here.</Link></p>
      </div>
    </DocumentPage>
  );
}
