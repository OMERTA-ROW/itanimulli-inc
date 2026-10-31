import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentPage, PageHeading } from "@/components/site/document-layout";
import { FormField, Panel, StatusLine } from "@/components/site/auth-ui";
import { createInvitation, listInvitations, listMembers, removeMember, revokeInvitation, setMemberRole } from "@/lib/accounts.functions";
import { DEFAULT_INVITE_DAYS, isStaff, MAX_INVITE_DAYS } from "@/lib/access-rules";
import { useMyAccess } from "./dashboard";

export const Route = createFileRoute("/_authenticated/admin/members")({
  head: () => ({ meta: [{ title: "Members & Invitations | Itanimulli Inc." }, { name: "robots", content: "noindex" }] }),
  component: MembersAdmin,
});

function inviteStatus(i: { used_at: string | null; revoked_at: string | null; expires_at: string }) {
  if (i.used_at) return "Accepted";
  if (i.revoked_at) return "Revoked";
  if (new Date(i.expires_at) <= new Date()) return "Expired";
  return "Pending";
}

function MembersAdmin() {
  const { data: me, isLoading } = useMyAccess();
  const staff = isStaff(me?.roles ?? []);
  const isOwner = me?.roles.includes("owner") ?? false;
  const qc = useQueryClient();
  const fetchMembers = useServerFn(listMembers);
  const fetchInvites = useServerFn(listInvitations);
  const create = useServerFn(createInvitation);
  const revoke = useServerFn(revokeInvitation);
  const setRole = useServerFn(setMemberRole);
  const remove = useServerFn(removeMember);
  const members = useQuery({ queryKey: ["members"], queryFn: () => fetchMembers(), enabled: staff });
  const invites = useQuery({ queryKey: ["invitations"], queryFn: () => fetchInvites(), enabled: staff });
  const [link, setLink] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: "info" | "error"; text: string } | null>(null);

  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ["members"] }), qc.invalidateQueries({ queryKey: ["invitations"] })]);
  async function run(action: () => Promise<unknown>, ok: string) {
    try { await action(); await refresh(); setMsg({ tone: "info", text: ok }); }
    catch (e) { setMsg({ tone: "error", text: e instanceof Error && e.message !== "Forbidden" ? e.message : "You don't have permission to do that." }); }
  }

  async function onInvite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const form = e.currentTarget;
    await run(async () => {
      const r = await create({ data: { email: String(f.get("email")), role: String(f.get("role")), days: Number(f.get("days")) } });
      setLink(`${window.location.origin}/accept-invite?token=${r.token}`);
      form.reset();
    }, "Invitation created. Copy the link below and send it privately to that person.");
  }

  if (isLoading) return <DocumentPage page="Members"><StatusLine>Loading…</StatusLine></DocumentPage>;
  if (!staff) return (
    <DocumentPage page="Members">
      <PageHeading eyebrow="Restricted" title="Members & Invitations" />
      <div className="mx-auto mt-14 max-w-md"><StatusLine tone="error">Only the owner and administrators can open this page.</StatusLine><Link to="/dashboard" className="mt-6 block underline">Back to dashboard</Link></div>
    </DocumentPage>
  );

  return (
    <DocumentPage page="Members">
      <PageHeading eyebrow="Administration" title="Members & Invitations" />
      <div className="mx-auto mt-14 grid max-w-5xl gap-8">
        <Link to="/dashboard" className="document-label text-xs underline underline-offset-4">← Dashboard</Link>
        {msg ? <StatusLine tone={msg.tone}>{msg.text}</StatusLine> : null}
        <Panel title="Invite a Member">
          <form onSubmit={onInvite} className="grid gap-5 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
            <FormField id="email" label="Email"><Input id="email" name="email" type="email" required /></FormField>
            <FormField id="role" label="Role">
              <select id="role" name="role" className="h-10 border border-input bg-background px-3 text-sm text-primary">
                <option value="member">Member</option>
                {isOwner ? <option value="admin">Administrator</option> : null}
              </select>
            </FormField>
            <FormField id="days" label="Expires (days)"><Input id="days" name="days" type="number" min={1} max={MAX_INVITE_DAYS} defaultValue={DEFAULT_INVITE_DAYS} /></FormField>
            <Button type="submit">Create Link</Button>
          </form>
          {link ? (
            <div className="grid gap-3">
              <p className="text-xs text-primary/70">This link works once and is shown only now. No email has been sent.</p>
              <div className="flex gap-3"><Input readOnly value={link} aria-label="Invitation link" onFocus={(e) => e.currentTarget.select()} /><Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(link)}>Copy</Button></div>
            </div>
          ) : null}
        </Panel>

        <Panel title="Invitations">
          {invites.data?.length ? (
            <ul className="grid gap-3">
              {invites.data.map((i: any) => {
                const status = inviteStatus(i);
                return (
                  <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/25 pb-3 text-sm">
                    <span>{i.email} · {i.role} · <strong>{status}</strong> · expires {new Date(i.expires_at).toLocaleDateString()}</span>
                    {status === "Pending" ? <Button size="sm" variant="outline" onClick={() => run(() => revoke({ data: { id: i.id } }), "Invitation revoked.")}>Revoke</Button> : null}
                  </li>
                );
              })}
            </ul>
          ) : <p className="text-sm text-primary/70">No invitations yet.</p>}
        </Panel>

        <Panel title="Members">
          {members.data?.length ? (
            <ul className="grid gap-3">
              {members.data.map((m: any) => {
                const self = m.id === me?.userId;
                const owner = m.roles.includes("owner");
                return (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/25 pb-3 text-sm">
                    <span>{m.display_name ? `${m.display_name} · ` : ""}{m.email} · {m.roles.join(", ") || "no access"}{self ? " (you)" : ""}</span>
                    {!self && !owner ? (
                      <span className="flex gap-2">
                        {isOwner ? (
                          m.roles.includes("admin")
                            ? <Button size="sm" variant="outline" onClick={() => run(() => setRole({ data: { userId: m.id, role: "member" } }), "Changed to member.")}>Make Member</Button>
                            : <Button size="sm" variant="outline" onClick={() => run(() => setRole({ data: { userId: m.id, role: "admin" } }), "Changed to administrator.")}>Make Admin</Button>
                        ) : null}
                        <Button size="sm" variant="destructive" onClick={() => { if (confirm(`Remove ${m.email}? Their account will be deleted.`)) run(() => remove({ data: { userId: m.id } }), "Member removed."); }}>Remove</Button>
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : <p className="text-sm text-primary/70">No members yet.</p>}
        </Panel>
      </div>
    </DocumentPage>
  );
}
