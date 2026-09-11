import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DocumentPage, PageHeading, PlaceholderNotice } from "@/components/site/document-layout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Itanimulli Inc. | Conley, Georgia" },
      { name: "description", content: "Contact Itanimulli Inc., a community-focused nonprofit organization based in Conley, Georgia." },
      { property: "og:title", content: "Contact Itanimulli Inc." },
      { property: "og:description", content: "Contact the Itanimulli Inc. organization in Conley, Georgia." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
      { name: "twitter:card", content: "summary_large_image" },
    ], links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmitted(true); }

  return (
    <DocumentPage page="06 / 06">
      <PageHeading eyebrow="Correspondence" title="Contact Itanimulli Inc.">
        <p>Conley, Georgia</p>
      </PageHeading>
      <div className="mx-auto mt-16 grid max-w-6xl gap-14 border-y border-primary/45 py-12 lg:grid-cols-[0.8fr_1.2fr]">
        <aside aria-label="Organization contact details">
          <h2 className="document-title text-xl">Official Details</h2>
          <div className="mt-8 grid gap-5">
            <PlaceholderNotice>Address: [Pending]</PlaceholderNotice>
            <PlaceholderNotice>Phone: [Pending]</PlaceholderNotice>
            <PlaceholderNotice>Email: [Pending]</PlaceholderNotice>
            <PlaceholderNotice>Blog: [External URL Pending]</PlaceholderNotice>
          </div>
          <div className="document-copy mt-10 text-sm"><p>Vinson D Bass<br />Chief Executive Officer</p></div>
        </aside>
        <form onSubmit={submit} className="grid content-start gap-7" aria-label="Contact form">
          <Field id="contact-name" label="Full Name"><Input id="contact-name" name="name" required /></Field>
          <Field id="contact-email" label="Email Address"><Input id="contact-email" name="email" type="email" required /></Field>
          <Field id="contact-subject" label="Subject"><Input id="contact-subject" name="subject" required /></Field>
          <Field id="contact-message" label="Message"><Textarea id="contact-message" name="message" rows={7} required /></Field>
          <Button type="submit" size="lg" className="justify-self-start">Send Correspondence</Button>
          {submitted ? <div role="status"><PlaceholderNotice>Your message has been noted in this preview. Form delivery is pending a finalized email address.</PlaceholderNotice></div> : null}
        </form>
      </div>
    </DocumentPage>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <div className="grid gap-3"><Label htmlFor={id} className="document-label text-xs text-primary">{label}</Label>{children}</div>;
}
