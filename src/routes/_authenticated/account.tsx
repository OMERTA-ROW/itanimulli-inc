import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentPage, PageHeading } from "@/components/site/document-layout";
import { FormField, Panel, SignOutButton, StatusLine } from "@/components/site/auth-ui";
import { supabase } from "@/integrations/supabase/client";
import { updateDisplayName } from "@/lib/accounts.functions";
import { MIN_PASSWORD_LENGTH } from "@/lib/access-rules";
import { useMyAccess } from "./dashboard";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Account & Settings | Itanimulli Inc." }, { name: "robots", content: "noindex" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { data } = useMyAccess();
  const qc = useQueryClient();
  const saveName = useServerFn(updateDisplayName);
  const [nameMsg, setNameMsg] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ tone: "info" | "error"; text: string } | null>(null);

  async function onName(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await saveName({ data: { displayName: String(new FormData(e.currentTarget).get("name")) } });
      await qc.invalidateQueries({ queryKey: ["my-access"] });
      setNameMsg({ tone: "info", text: "Name saved." });
    } catch { setNameMsg({ tone: "error", text: "Couldn't save your name." }); }
  }

  async function onPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("new"));
    if (password.length < MIN_PASSWORD_LENGTH) { setPwMsg({ tone: "error", text: `Use at least ${MIN_PASSWORD_LENGTH} characters.` }); return; }
    const { error } = await supabase.auth.updateUser({ password, current_password: String(f.get("current")) } as never);
    setPwMsg(error ? { tone: "error", text: "Couldn't change your password. Check your current password." } : { tone: "info", text: "Password changed." });
    if (!error) e.currentTarget.reset();
  }

  return (
    <DocumentPage page="Members">
      <PageHeading eyebrow="Private Access" title="Account & Settings" />
      <div className="mx-auto mt-14 grid max-w-2xl gap-8">
        <Link to="/dashboard" className="document-label text-xs underline underline-offset-4">← Dashboard</Link>
        <Panel title="Profile">
          <p className="document-copy text-sm">Email: {data?.profile?.email ?? "…"}</p>
          <form onSubmit={onName} className="grid gap-5">
            <FormField id="name" label="Display Name"><Input id="name" name="name" defaultValue={data?.profile?.display_name ?? ""} key={data?.profile?.display_name ?? ""} /></FormField>
            {nameMsg ? <StatusLine tone={nameMsg.tone}>{nameMsg.text}</StatusLine> : null}
            <Button type="submit" className="justify-self-start">Save Name</Button>
          </form>
        </Panel>
        <Panel title="Change Password">
          <form onSubmit={onPassword} className="grid gap-5">
            <FormField id="current" label="Current Password"><Input id="current" name="current" type="password" autoComplete="current-password" required /></FormField>
            <FormField id="new" label="New Password"><Input id="new" name="new" type="password" autoComplete="new-password" required /></FormField>
            {pwMsg ? <StatusLine tone={pwMsg.tone}>{pwMsg.text}</StatusLine> : null}
            <Button type="submit" className="justify-self-start">Change Password</Button>
          </form>
        </Panel>
        <div><SignOutButton /></div>
      </div>
    </DocumentPage>
  );
}
