import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DocumentPage, PageHeading, PlaceholderNotice } from "@/components/site/document-layout";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Membership | Join Itanimulli Inc." },
      { name: "description", content: "Express interest in community membership with Itanimulli Inc. in Conley, Georgia." },
      { property: "og:title", content: "Membership | Itanimulli Inc." },
      { property: "og:description", content: "Each member is equal. Express interest in joining Itanimulli Inc." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/join" },
      { name: "twitter:card", content: "summary_large_image" },
    ], links: [{ rel: "canonical", href: "/join" }],
  }),
  component: JoinPage,
});

function JoinPage() {
  const [submitted, setSubmitted] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmitted(true); }

  return (
    <DocumentPage page="05 / 06">
      <PageHeading eyebrow="Membership" title="Become a Puzzle Piece">
        <p>Each member is equal. Each community is not the same, but still faces the same equations in life in some shape or form.</p>
      </PageHeading>
      <form onSubmit={submit} className="mx-auto mt-16 max-w-3xl border-y border-primary/45 py-12" aria-label="Membership interest form">
        <div className="grid gap-7 sm:grid-cols-2">
          <Field id="join-name" label="Full Name"><Input id="join-name" name="name" required /></Field>
          <Field id="join-email" label="Email Address"><Input id="join-email" name="email" type="email" required /></Field>
          <Field id="join-phone" label="Phone Number"><Input id="join-phone" name="phone" type="tel" /></Field>
          <Field id="join-community" label="Community"><Input id="join-community" name="community" /></Field>
          <div className="sm:col-span-2"><Field id="join-interest" label="Area of Interest"><Input id="join-interest" name="interest" placeholder="Foundation, branch, outreach, or other" /></Field></div>
          <div className="sm:col-span-2"><Field id="join-message" label="Your Message"><Textarea id="join-message" name="message" rows={6} required /></Field></div>
        </div>
        <Button type="submit" size="lg" className="mt-8">Express Interest</Button>
        {submitted ? <div className="mt-6" role="status"><PlaceholderNotice>Your interest has been noted in this preview. Form delivery is pending a finalized email address.</PlaceholderNotice></div> : null}
      </form>
    </DocumentPage>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <div className="grid gap-3"><Label htmlFor={id} className="document-label text-xs text-primary">{label}</Label>{children}</div>;
}
