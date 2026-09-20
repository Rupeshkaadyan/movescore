import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/primitives";

const COLUMNS = [
  {
    title: "Compare",
    links: [
      { label: "Compare cities", href: "/compare" },
      { label: "Cost of living", href: "/cost-of-living" },
      { label: "Salary calculator", href: "/salary/100000/austin-tx" },
      { label: "Move cost calculator", href: "/move-cost" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "All cities", href: "/cities" },
      { label: "Neighborhoods", href: "/neighborhoods" },
      { label: "Jobs by city", href: "/jobs" },
      { label: "Housing by city", href: "/housing" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Guides", href: "/guides" },
      { label: "Methodology & sources", href: "/methodology" },
      { label: "Search", href: "/search" },
      { label: "Saved comparisons", href: "/account" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-ink text-slate-300 no-print">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Image
              src="/brand/logo-white.png"
              alt="MoveScore"
              width={148}
              height={52}
              className="h-10 w-auto"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              A smarter move for a brighter you. Compare the real cost of moving
              between U.S. cities using transparent, sourced data.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} MoveScore. Figures shown are demo data for
            development — see{" "}
            <Link href="/methodology" className="underline hover:text-white">
              methodology
            </Link>
            .
          </p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Data sources: U.S. Census, BLS, HUD, NOAA, FBI, CMS, EPA.</span>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </p>
        </div>
      </Container>
    </footer>
  );
}
