import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentPage, PageHeading } from "@/components/site/document-layout";
import { FormField, StatusLine } from "@/components/site/auth-ui";
import { supabase } from "@/integrations/supabase/client";
import { acceptInvitation, previewInvitation } from "@/lib/accounts.functions";
import { MIN_PASSWORD_LENGTH } from "@/lib/access-rules";

const NOT_FOUND = "This invitation link isn't valid. Ask the person who invited you for a new one.";
const reasons: Record<string, string | undefined> = {
  not_found: "This invitation link isn't valid. Ask the person who invited you for a new one.",
  revoked: "This invitation was withdrawn. Ask for a new one if you still need access.",
  used: "This invitation has already been used. Sign in instead.",
  expired: "This invitation has expired. Ask for a new one.",
  bad_role: "This invitation isn't valid.",
  account_exists: "An account already exists for this email. Sign in instead.",
};

export const Route = createFileRoute("/accept-invite")({
  validateSearch: (search: Record<string, unknown>) => ({ token: typeof search["token"] === "string" ? search["token"] : "" }),
  head: () => ({
    meta: [
      { title: "Accept Your Invitation | Itanimulli Inc." },
      { name: "description", content: "Accept a private membership invitation to Itanimulli Inc." },
      { property: "og:title", content: "Accept Your Invitation | Itanimulli Inc." },
      { property: "og:description", content: "Accept a private membership invitation to Itanimulli Inc." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AcceptInvitePage,
});

function AcceptInvitePage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const preview = useServerFn(previewInvitation);
  const accept = useServerFn(acceptInvitation);
  const [state, setState] = useState<{ loading: boolean; email?: string; reason?: string }>({ loading: true });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    preview({ data: { token } })
      .then((r) => setState(r.ok ? { loading: false, email: r.email } : { loading: false, reason: r.reason }))
      .catch(() => setState({ loading: false, reason: "not_found" }));
  }, [token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    if (password.length < MIN_PASSWORD_LENGTH) { setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`); return; }
    if (password !== String(form.get("confirm"))) { setError("The two passwords don't match."); return; }
    setBusy(true); setError(null);
    try {
      const result = await accept({ data: { token, password, displayName: String(form.get("name") ?? "") } });
      if (!result.ok) { setError(reasons[result.reason] ?? NOT_FOUND); return; }
      const { error } = await supabase.auth.signInWithPassword({ email: result.email, password });
      if (error) { navigate({ to: "/auth", search: {} }); return; }
      navigate({ to: "/dashboard" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DocumentPage page="Members">
      <PageHeading eyebrow="Private Invitation" title="Accept Your Invitation" />
      <div className="mx-auto mt-14 max-w-md">
        {state.loading ? <StatusLine>Checking your invitation…</StatusLine> : state.reason ? (
          <div className="grid gap-6">
            <StatusLine tone="error">{reasons[state.reason] ?? NOT_FOUND}</StatusLine>
            <Link to="/auth" search={{}} className="document-label text-xs underline underline-offset-4">Go to sign in</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-7">
            <p className="document-copy text-sm">This invitation is for <strong>{state.email}</strong>. Choose your own password; nobody else will know it.</p>
            <FormField id="name" label="Your Name (optional)"><Input id="name" name="name" autoComplete="name" /></FormField>
            <FormField id="password" label="Password" hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}><Input id="password" name="password" type="password" autoComplete="new-password" required /></FormField>
            <FormField id="confirm" label="Confirm Password"><Input id="confirm" name="confirm" type="password" autoComplete="new-password" required /></FormField>
            {error ? <StatusLine tone="error">{error}</StatusLine> : null}
            <Button type="submit" size="lg" disabled={busy}>{busy ? "Creating Account…" : "Create My Account"}</Button>
          </form>
        )}
      </div>
    </DocumentPage>
  );
}
