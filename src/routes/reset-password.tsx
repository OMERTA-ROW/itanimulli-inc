import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentPage, PageHeading } from "@/components/site/document-layout";
import { FormField, StatusLine } from "@/components/site/auth-ui";
import { supabase } from "@/integrations/supabase/client";
import { MIN_PASSWORD_LENGTH } from "@/lib/access-rules";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a New Password | Itanimulli Inc." },
      { name: "description", content: "Choose a new password for your Itanimulli Inc. member account." },
      { property: "og:title", content: "Set a New Password | Itanimulli Inc." },
      { property: "og:description", content: "Choose a new password for your Itanimulli Inc. member account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const isRecovery = window.location.hash.includes("type=recovery");
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session) || isRecovery));
    const { data } = supabase.auth.onAuthStateChange((event) => { if (event === "PASSWORD_RECOVERY") setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    if (password.length < MIN_PASSWORD_LENGTH) { setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`); return; }
    if (password !== String(form.get("confirm"))) { setError("The two passwords don't match."); return; }
    setBusy(true); setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setError("This reset link has expired. Request a new one from the sign-in page."); return; }
    navigate({ to: "/dashboard" });
  }

  return (
    <DocumentPage page="Members">
      <PageHeading eyebrow="Account Recovery" title="Set a New Password" />
      <div className="mx-auto mt-14 max-w-md">
        {ready ? (
          <form onSubmit={submit} className="grid gap-7">
            <FormField id="password" label="New Password"><Input id="password" name="password" type="password" autoComplete="new-password" required /></FormField>
            <FormField id="confirm" label="Confirm Password"><Input id="confirm" name="confirm" type="password" autoComplete="new-password" required /></FormField>
            {error ? <StatusLine tone="error">{error}</StatusLine> : null}
            <Button type="submit" size="lg" disabled={busy}>Save Password</Button>
          </form>
        ) : (
          <StatusLine>Open this page from the reset link in your email. <Link to="/auth" className="underline">Request a new link.</Link></StatusLine>
        )}
      </div>
    </DocumentPage>
  );
}
