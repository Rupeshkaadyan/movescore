import type { Metadata } from "next";
import { SearchExperience } from "@/components/search/SearchExperience";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Search MoveScore",
  description:
    "Search cities, comparisons, salary calculators and guides. Try “Austin”, “New York vs Austin” or “100k in Texas”.",
  path: "/search",
});

export default function SearchPage() {
  return (
    <Container className="py-10">
      <SectionHeading
        eyebrow="Search"
        title="Find a city, comparison or calculator"
        description="Try a city name, a state, “New York vs Austin”, or “100k in Texas”."
      />
      <div className="mt-8 max-w-3xl">
        <SearchExperience />
      </div>
    </Container>
  );
}
