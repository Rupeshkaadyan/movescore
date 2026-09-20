import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { MoveCostCalculator } from "@/components/move-cost/MoveCostCalculator";
import { AssumptionNote } from "@/components/results/panels";
import { MOVE_COST_ASSUMPTIONS } from "@/lib/calc/notes";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Moving cost calculator — estimate the cost to move between U.S. cities",
  description:
    "Estimate what it costs to move between two U.S. cities: movers, packing, travel, first month and deposit, utilities and vehicle registration.",
  path: "/move-cost",
});

export default function MoveCostPage() {
  return (
    <Container className="py-10">
      <SectionHeading
        eyebrow="Move cost calculator"
        title="What it actually costs to move"
        description="Priced on distance and shipment weight, plus the upfront costs people forget: deposit, first month, utility setup and vehicle registration."
      />
      <div className="mt-8">
        <MoveCostCalculator />
      </div>
      <div className="mt-8 max-w-3xl">
        <AssumptionNote items={MOVE_COST_ASSUMPTIONS} />
      </div>
    </Container>
  );
}
