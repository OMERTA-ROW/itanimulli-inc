import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DocumentPage, PageHeading } from "@/components/site/document-layout";
import { Panel, SignOutButton, StatusLine } from "@/components/site/auth-ui";
import { getMyAccess } from "@/lib/accounts.functions";
import { isStaff } from "@/lib/access-rules";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Member Dashboard | Itanimulli Inc." }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

export function useMyAccess() {
  const fn = useServerFn(getMyAccess);
  return useQuery({ queryKey: ["my-access"], queryFn: () => fn() });
}

function Dashboard() {
  const { data, isLoading, error } = useMyAccess();
  const roles = data?.roles ?? [];
  return (
    <DocumentPage page="Members">
      <PageHeading eyebrow="Private Access" title="Member Dashboard" />
      <div className="mx-auto mt-14 grid max-w-3xl gap-8">
        {isLoading ? <StatusLine>Loading your account…</StatusLine> : null}
        {error ? <StatusLine tone="error">We couldn't load your account. Try signing in again.</StatusLine> : null}
        {data ? (
          <>
            <Panel title={`Welcome${data.profile?.display_name ? `, ${data.profile.display_name}` : ""}`}>
              <p className="document-copy text-sm">Signed in as {data.profile?.email}. Role: {roles.length ? roles.join(", ") : "none yet"}.</p>
              {roles.length === 0 ? <StatusLine>Your account has no membership yet. Organization records appear here once an administrator grants access.</StatusLine> : (
                <StatusLine>There are no projects or records here yet. Member updates will appear in this space.</StatusLine>
              )}
            </Panel>
            <nav className="flex flex-wrap gap-4" aria-label="Account">
              <Link to="/account" className="document-label border border-primary/55 px-4 py-3 text-xs hover:bg-accent">Account & Settings</Link>
              {isStaff(roles) ? <Link to="/admin/members" className="document-label border border-primary/55 px-4 py-3 text-xs hover:bg-accent">Members & Invitations</Link> : null}
              {!roles.includes("owner") ? <Link to="/owner-setup" className="document-label border border-primary/25 px-4 py-3 text-xs text-primary/70 hover:bg-accent">Owner Setup</Link> : null}
              <SignOutButton />
            </nav>
          </>
        ) : null}
      </div>
    </DocumentPage>
  );
}
