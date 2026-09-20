import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { CITIES, cityLabel } from "@/lib/data/cities";
import { money, percent } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Housing costs by U.S. city — rents, home prices and property tax",
  description:
    "Median rent, median home price, property tax rate and year-over-year price change for 30 major U.S. cities.",
  path: "/housing",
});

export default function HousingPage() {
  const ranked = [...CITIES].sort((a, b) => b.metrics.medianHomePrice - a.metrics.medianHomePrice);

  return (
    <Container className="py-10">
      <SectionHeading
        eyebrow="Housing"
        title="Rents, home prices and property tax"
        description="Rent and home values are the largest line in almost every relocation budget. The property tax column matters most if you plan to buy — it is where no-income-tax states often recover the difference."
      />

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-3 pr-4 font-semibold">City</th>
              <th scope="col" className="py-3 pr-4 text-right font-semibold">Median home</th>
              <th scope="col" className="py-3 pr-4 text-right font-semibold">1-bed rent</th>
              <th scope="col" className="py-3 pr-4 text-right font-semibold">2-bed rent</th>
              <th scope="col" className="py-3 pr-4 text-right font-semibold">Property tax</th>
              <th scope="col" className="py-3 pr-4 text-right font-semibold">Rent YoY</th>
              <th scope="col" className="py-3 text-right font-semibold">Profile</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((city) => (
              <tr key={city.slug} className="border-b border-line/70">
                <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">
                  {cityLabel(city)}
                </th>
                <td className="py-3 pr-4 text-right tabular-nums">{money(city.metrics.medianHomePrice)}</td>
                <td className="py-3 pr-4 text-right tabular-nums">{money(city.metrics.medianRent1br)}</td>
                <td className="py-3 pr-4 text-right tabular-nums">{money(city.metrics.medianRent2br)}</td>
                <td className="py-3 pr-4 text-right tabular-nums">{percent(city.metrics.propertyTaxRate, 2)}</td>
                <td
                  className={`py-3 pr-4 text-right tabular-nums font-medium ${
                    city.metrics.rentGrowthYoY <= 0 ? "text-emerald-600" : "text-slate-700"
                  }`}
                >
                  {percent(city.metrics.rentGrowthYoY, 1)}
                </td>
                <td className="py-3 text-right">
                  <Link
                    href={`/cities/${city.slug}`}
                    className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
                  >
                    Open
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
