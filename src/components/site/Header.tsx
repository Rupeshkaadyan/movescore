"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/primitives";

const NAV = [
  { label: "Compare Cities", href: "/compare" },
  { label: "Cost of Living", href: "/cost-of-living" },
  { label: "Jobs", href: "/jobs" },
  { label: "Housing", href: "/housing" },
  { label: "Neighborhoods", href: "/neighborhoods" },
  { label: "Guides", href: "/guides" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur no-print">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" aria-label="MoveScore home">
          <Image
            src="/brand/logo-light.png"
            alt="MoveScore"
            width={148}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-brand-soft text-brand-dark" : "text-slate-700 hover:bg-surface",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/search"
            className="rounded-lg p-2 text-slate-600 hover:bg-surface"
            aria-label="Search MoveScore"
          >
            <Search className="h-5 w-5" aria-hidden />
          </Link>
          <Link
            href="/account"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-surface"
          >
            Sign In
          </Link>
          <Link
            href="/compare"
            className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-slate-700 hover:bg-surface lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
        </button>
      </Container>

      {open ? (
        <div id="mobile-nav" className="border-t border-line bg-white lg:hidden">
          <Container className="flex flex-col py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-surface"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-2 border-t border-line pt-3">
              <Link
                href="/search"
                className="flex-1 rounded-xl border border-line px-3 py-2.5 text-center text-sm font-medium"
              >
                Search
              </Link>
              <Link
                href="/compare"
                className="flex-1 rounded-xl bg-brand px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                Get Started
              </Link>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
