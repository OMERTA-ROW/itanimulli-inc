import { createFileRoute } from "@tanstack/react-router";
import { AsteriskList, DocumentPage, PageHeading } from "@/components/site/document-layout";

const levelOne = ["Organization Funding", "Grants", "School Grants", "Loans", "Society Association Gifts"];
const levelTwo = ["New World Order Protesters Society", "Advocate Society", "Donations Society", "Community Outreach Society", "Vlog Society"];

export const Route = createFileRoute("/levels")({
  head: () => ({
    meta: [
      { title: "The Three Levels | Itanimulli Inc." },
      { name: "description", content: "Explore the foundation, branches, and Community Outreach Society of Itanimulli Inc." },
      { property: "og:title", content: "The Three Levels | Itanimulli Inc." },
      { property: "og:description", content: "The formal progression of Itanimulli Inc.: foundation, branches, and outreach." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/levels" },
      { name: "twitter:card", content: "summary_large_image" },
    ], links: [{ rel: "canonical", href: "/levels" }],
  }),
  component: LevelsPage,
});

function LevelMarker({ level }: { level: string }) {
  return <div className="document-label mb-7 inline-block border border-primary px-5 py-2 text-xs">{level}</div>;
}

function LevelsPage() {
  return (
    <DocumentPage page="03 / 06">
      <PageHeading eyebrow="Organizational Progression" title="The Three Levels" />
      <div className="relative mx-auto mt-20 max-w-5xl before:absolute before:bottom-0 before:left-3 before:top-0 before:w-px before:bg-primary/35 sm:before:left-6">
        <section className="relative border-t border-primary/50 py-14 pl-10 sm:pl-16">
          <span className="absolute left-0 top-14 grid size-6 place-items-center rounded-full border border-primary bg-background text-[0.6rem] sm:left-3">I</span>
          <LevelMarker level="Level One — The Foundation" />
          <div className="document-copy text-base sm:text-lg">
            <p>Level one involvements amongst the community is a blessing — to work side by side among society for generations to come. Itanimulli Inc. is an evolving corporation, along with society.</p>
            <AsteriskList items={levelOne} />
            <p>This is Level One of Itanimulli Inc. The foundation basis of our organization.</p>
          </div>
        </section>

        <section className="relative border-t border-primary/50 py-14 pl-10 sm:pl-16">
          <span className="absolute left-0 top-14 grid size-6 place-items-center rounded-full border border-primary bg-background text-[0.6rem] sm:left-3">II</span>
          <LevelMarker level="Level Two — The Branches" />
          <div className="document-copy text-base sm:text-lg">
            <p>Level two involves the branches of Itanimulli Inc., to have a more underlined understanding of the Itanimulli Inc. mission. These branches are also displayed on our blog. As a reminder, Itanimulli Inc. will always be an evolving corporation. These are just our supreme pieces to the Itanimulli Inc. puzzle in society.</p>
            <AsteriskList items={levelTwo} />
            <p>Always remember, Itanimulli Inc. is built to evolve and mold with time. Each member brings a new puzzle piece, as society reveals a new puzzle.</p>
          </div>
        </section>

        <section className="relative border-y border-primary/50 py-14 pl-10 sm:pl-16">
          <span className="absolute left-0 top-14 grid size-6 place-items-center rounded-full border border-primary bg-background text-[0.6rem] sm:left-3">III</span>
          <LevelMarker level="Level Three — Community Outreach" />
          <div className="document-copy text-base sm:text-lg">
            <p>Level three is the Community Outreach Society — recruitment in consolidation with festivity and commemoration. These functions will be documented and posted under the Vlog Society of Itanimulli Inc.</p>
          </div>
        </section>
      </div>
    </DocumentPage>
  );
}
