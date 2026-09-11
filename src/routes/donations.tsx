import { createFileRoute } from "@tanstack/react-router";
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentPage, DocumentSection, PageHeading, PlaceholderNotice } from "@/components/site/document-layout";

export const Route = createFileRoute("/donations")({
  head: () => ({
    meta: [
      { title: "Donations Society | Itanimulli Inc." },
      { name: "description", content: "Learn how donors and philanthropists can become involved in Itanimulli Inc. projects and operations." },
      { property: "og:title", content: "Donations Society | Itanimulli Inc." },
      { property: "og:description", content: "Every donation carries an invitation to organization involvement." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/donations" },
      { name: "twitter:card", content: "summary_large_image" },
    ], links: [{ rel: "canonical", href: "/donations" }],
  }),
  component: DonationsPage,
});

function DonationsPage() {
  return (
    <DocumentPage page="04 / 06">
      <PageHeading eyebrow="Donations Society" title="Philanthropy">
        <p>Itanimulli Inc. imbues our society into philanthropy.</p>
      </PageHeading>
      <div className="mx-auto mt-20 max-w-6xl">
        <DocumentSection number="An Open Invitation" title="Every Donation Matters">
          <p>You don't have to be a member to join the Donations Society. Each donation, from $1 to millions of dollars, carries an invitation to organization involvement in projects and operations, in agreement amongst board members as well as society members.</p>
        </DocumentSection>
        <DocumentSection number="Certificate of Donations" title="Involvement in Service">
          <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start">
            <Award className="size-12 text-primary" strokeWidth={1} aria-hidden="true" />
            <p>Each philanthropist or donor must present a certificate of donations for involvement in events and projects by selected members of Itanimulli Inc.</p>
          </div>
        </DocumentSection>
        <section className="border-y border-primary/45 py-12 text-center sm:py-16">
          <Button type="button" size="lg">Donate — Coming Soon</Button>
          <div className="mx-auto mt-6 max-w-xl"><PlaceholderNotice>[Donation Link Pending]</PlaceholderNotice></div>
        </section>
      </div>
    </DocumentPage>
  );
}
