import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DocumentPage, PageHeading } from "@/components/site/document-layout";
import { Panel, StatusLine } from "@/components/site/auth-ui";
import { claimOwner } from "@/lib/accounts.functions";
import { useMyAccess } from "./dashboard";

const messages: Record<string, string> = {
  not_configured: "The owner email hasn't been set up yet, so no one can become owner. This is expected until setup is finished.",
  email_mismatch: "This account's email isn't the configured owner email.",
  unverified: "Verify this account's email address first.",
  owner_exists: "An owner is already assigned.",
};

export const Route = createFileRoute("/_authenticated/owner-setup")({
  head: () => ({ meta: [{ title: "Owner Setup | Itanimulli Inc." }, { name: "robots", content: "noindex" }] }),
  component: OwnerSetup,
});

function OwnerSetup() {
  const { data } = useMyAccess();
  const claim = useServerFn(claimOwner);
  const qc = useQueryClient();
  const [msg, setMsg] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const isOwner = data?.roles.includes("owner");

  return (
    <DocumentPage page="Members">
      <PageHeading eyebrow="Trusted Setup" title="Owner Setup" />
      <div className="mx-auto mt-14 grid max-w-2xl gap-8">
        <Link to="/dashboard" className="document-label text-xs underline underline-offset-4">← Dashboard</Link>
        <Panel title="Claim the Owner Role">
          <p className="document-copy text-sm">Only the verified account matching the organization's configured owner email can become owner. Everyone else is refused by the server.</p>
          {isOwner ? <StatusLine>You are the owner. <Link to="/admin/members" className="underline">Manage members and invitations.</Link></StatusLine> : (
            <Button className="justify-self-start" onClick={async () => {
              try {
                const r = await claim();
                if (r.ok) { await qc.invalidateQueries({ queryKey: ["my-access"] }); setMsg({ tone: "info", text: "You are now the owner." }); }
                else setMsg({ tone: "error", text: messages[r.reason] });
              } catch { setMsg({ tone: "error", text: "Owner setup failed. Sign in again and retry." }); }
            }}>Claim Owner Role</Button>
          )}
          {msg ? <StatusLine tone={msg.tone}>{msg.text}</StatusLine> : null}
        </Panel>
      </div>
    </DocumentPage>
  );
}
