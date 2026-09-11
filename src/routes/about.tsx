import { createFileRoute } from "@tanstack/react-router";
import { DocumentPage, DocumentSection, PageHeading } from "@/components/site/document-layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Itanimulli Inc. | Mission & Philosophy" },
      { name: "description", content: "Read the mission, equality commitment, and evolving philosophy of Itanimulli Inc." },
      { property: "og:title", content: "About Itanimulli Inc." },
      { property: "og:description", content: "Community membership, uplift, self education, wealth and health productivity." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ], links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <DocumentPage page="02 / 06">
      <PageHeading eyebrow="Official Statement" title="About the Organization">
        <p>Itanimulli Inc. is a private but public organization.</p>
      </PageHeading>
      <div className="mx-auto mt-20 max-w-6xl">
        <DocumentSection number="I" title="Our Objective">
          <p>This organization's objective is community membership, uplift, self education, wealth and health productivity. That is what our involvement in the community upholds — in each one of our members, as well as in each community we adopt, build and uplift.</p>
        </DocumentSection>
        <DocumentSection number="II" title="Equality & Community">
          <p>Each member is equal. Each community is not the same, but still faces the same equations in life in some shape or form. In this organization, each member, each community of Itanimulli Inc. eradicates those problems for better environmental enhancements.</p>
        </DocumentSection>
        <DocumentSection number="III" title="Built to Evolve">
          <blockquote>“Always remember, Itanimulli Inc. is built to evolve and mold with time. Each member brings a new puzzle piece, as society reveals a new puzzle.”</blockquote>
        </DocumentSection>
      </div>
    </DocumentPage>
  );
}
