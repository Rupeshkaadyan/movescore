/**
 * Responsive + console-error QA against a running production server.
 *
 * Drives the system Chrome through puppeteer-core (no browser download, and
 * puppeteer-core is deliberately NOT a project dependency — resolve it with
 * NODE_PATH at runtime).
 *
 *   NODE_PATH=/path/to/node_modules node scripts/responsive-check.mjs http://localhost:3000
 *
 * Exits non-zero if any page scrolls horizontally or logs a console error.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const puppeteer = require(process.env.PUPPETEER_PKG ?? "puppeteer-core");

const BASE = process.argv[2] ?? "http://localhost:3000";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const WIDTHS = [320, 375, 390, 430, 768, 1024, 1440];
const PAGES = [
  "/",
  "/compare/new-york-ny-vs-austin-tx",
  "/cities/austin-tx",
  "/cities/austin-tx/neighborhoods",
  "/cost-of-living/austin-tx",
  "/salary/austin-tx",
  "/move-cost",
  "/search",
  "/methodology",
];

const problems = [];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  protocolTimeout: 60_000,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

// One page reused across every check: creating ~63 pages crashes Chrome.
const page = await browser.newPage();

let consoleErrors = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});
page.on("pageerror", (e) => consoleErrors.push(String(e)));

for (const width of WIDTHS) {
  await page.setViewport({ width, height: 900 });

  for (const path of PAGES) {
    const label = `${width}px ${path}`;
    consoleErrors = [];

    try {
      await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 30_000 });

      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const vw = window.innerWidth;
        const offenders = [];

        for (const el of document.querySelectorAll("*")) {
          const r = el.getBoundingClientRect();
          const over = Math.round(r.right - vw);
          // Also catch elements that are themselves wider than the viewport
          // even if their right edge happens to be on-screen (negative offset).
          const tooWide = Math.round(r.width - vw);
          const worst = Math.max(over, tooWide);
          if (worst > 1) {
            offenders.push({
              over: worst,
              tag: el.tagName.toLowerCase(),
              cls: (el.className || "").toString().slice(0, 70),
              id: el.id || "",
            });
          }
        }
        offenders.sort((a, b) => b.over - a.over);

        return {
          scrollWidth: doc.scrollWidth,
          innerWidth: vw,
          offenders: offenders.slice(0, 3),
        };
      });

      const hScroll = metrics.scrollWidth - metrics.innerWidth;

      if (hScroll > 1) {
        const where = metrics.offenders.length
          ? metrics.offenders
              .map((o) => `<${o.tag}${o.id ? "#" + o.id : ""}> +${o.over}px .${o.cls}`)
              .join(" | ")
          : "no single element exceeds viewport (check table/min-width)";
        problems.push(`H-SCROLL ${label}: +${hScroll}px — ${where}`);
        console.log(`FAIL  ${label}  +${hScroll}px  ${where}`);
      } else if (consoleErrors.length) {
        problems.push(`CONSOLE ${label}: ${consoleErrors[0]}`);
        console.log(`WARN  ${label}  console: ${consoleErrors[0]}`);
      } else {
        console.log(`ok    ${label}`);
      }
    } catch (err) {
      problems.push(`ERROR ${label}: ${String(err).slice(0, 160)}`);
      console.log(`ERR   ${label}  ${String(err).slice(0, 120)}`);
    }
  }
}

await browser.close();

console.log(`\n${problems.length ? "PROBLEMS" : "CLEAN"} — ${problems.length} issue(s)`);
for (const p of problems) console.log(" - " + p);
if (problems.length) process.exit(1);
