import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DocumentPage, DocumentSection, PageHeading, PlaceholderNotice, Seal } from "@/components/site/document-layout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Itanimulli Inc. | Community Uplift in Georgia" },
      { name: "description", content: "Itanimulli Inc. supports community membership, uplift, self education, wealth, and health productivity in Conley, Georgia." },
      { property: "og:title", content: "Itanimulli Inc. | Community Uplift in Georgia" },
      { property: "og:description", content: "An evolving corporation, evolving alongside society." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <DocumentPage page="01 / 06">
      <section className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <div className="sm:hidden"><Seal compact /></div>
        <PageHeading eyebrow="Conley, Georgia" title="Itanimulli Inc.">
          <p className="text-center text-primary/80">An evolving corporation, along with society.</p>
        </PageHeading>
        <div className="document-copy mt-12 max-w-5xl border-y border-primary/40 py-10 text-base sm:text-xl">
          <p>
            This organization's objective is community membership, uplift, self education, wealth and health productivity. That is what our involvement in the community upholds — in each one of our members, as well as in each community we adopt, build and uplift.
          </p>
        </div>
        <Button asChild size="lg" className="mt-10">
          <Link to="/levels">Enter the Three Levels <ArrowRight aria-hidden="true" /></Link>
        </Button>
      </section>

      <div className="mx-auto mt-20 max-w-6xl">
        <DocumentSection number="Core Philosophy" title="A New Puzzle Piece">
          <blockquote>
            “Itanimulli Inc. is built to evolve and mold with time. Each member brings a new puzzle piece, as society reveals a new puzzle.”
          </blockquote>
        </DocumentSection>
        <DocumentSection number="Leadership" title="Vinson D Bass">
          <p>Chief Executive Officer</p>
        </DocumentSection>
        <DocumentSection number="Current & Upcoming Projects" title="The Organization Blog">
          <p className="mb-7">Members follow current and upcoming projects through the Itanimulli Inc. blog.</p>
          <PlaceholderNotice>[Blog Site URL Pending — External Link Will Appear Here]</PlaceholderNotice>
        </DocumentSection>
      </div>
    </DocumentPage>
  );
}
