import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { CITIES, cityLabel } from "@/lib/data/cities";
import { money, percent } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Job markets by U.S. city — wages, unemployment and growth",
  description:
    "Compare U.S. city job markets: metro wage index, unemployment rate, year-over-year job growth and the largest local sectors.",
  path: "/jobs",
});

export default function JobsPage() {
  const ranked = [...CITIES].sort((a, b) => b.metrics.salaryIndex - a.metrics.salaryIndex);

  return (
    <Container className="py-10">
      <SectionHeading
        eyebrow="Jobs"
        title="Where the wages are"
        description="Wage index compares a metro's pay for the same occupation against the U.S. average of 100. Pair it with the cost index — a high wage index in an expensive city can still leave you worse off."
      />

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-3 pr-4 font-semibold">City</th>
              <th scope="col" className="py-3 pr-4 text-right font-semibold">Wage index</th>
              <th scope="col" className="py-3 pr-4 text-right font-semibold">Unemployment</th>
              <th scope="col" className="py-3 pr-4 text-right font-semibold">Job growth YoY</th>
              <th scope="col" className="py-3 pr-4 text-right font-semibold">Median household income</th>
              <th scope="col" className="py-3 pr-4 font-semibold">Largest sectors</th>
              <th scope="col" className="py-3 text-right font-semibold">Compare</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((city) => (
              <tr key={city.slug} className="border-b border-line/70">
                <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">
                  {cityLabel(city)}
                </th>
                <td className="py-3 pr-4 text-right tabular-nums">{city.metrics.salaryIndex}</td>
                <td className="py-3 pr-4 text-right tabular-nums">{percent(city.metrics.unemploymentRate, 1)}</td>
                <td className="py-3 pr-4 text-right tabular-nums">{percent(city.metrics.jobGrowthYoY, 1)}</td>
                <td className="py-3 pr-4 text-right tabular-nums">{money(city.metrics.medianHouseholdIncome)}</td>
                <td className="py-3 pr-4 text-xs text-muted">
                  {city.metrics.topIndustries.slice(0, 3).join(", ")}
                </td>
                <td className="py-3 text-right">
                  <Link
                    href={`/compare/austin-tx-vs-${city.slug}`}
                    className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
                  >
                    Compare
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
