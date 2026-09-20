/**
 * End-to-end smoke test of the core MoveScore flow, in a real browser.
 *
 *   NODE_PATH=/path/to/node_modules node scripts/smoke.mjs http://localhost:3000
 *
 * Mirrors docs/DEPLOYMENT.md step "Production smoke test": run a comparison,
 * change the scenario, reload, and check invalid and unknown input.
 * Exits non-zero on the first failed assertion.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const puppeteer = require(process.env.PUPPETEER_PKG ?? "puppeteer-core");

const BASE = process.argv[2] ?? "http://localhost:3000";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const failures = [];
function check(name, ok, detail = "") {
  console.log(`${ok ? "ok  " : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(name);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  protocolTimeout: 60_000,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

const jsErrors = [];
page.on("pageerror", (e) => jsErrors.push(String(e)));

// 1-6. Homepage → pick cities → enter salary and household → run comparison.
await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
check("homepage loads", (await page.title()).includes("MoveScore"));

// Wait for hydration: clicking before React attaches handlers does nothing.
await page.waitForSelector('button[type="submit"]:not([disabled])', { timeout: 15_000 });
await new Promise((r) => setTimeout(r, 1200));

await page.select('select[aria-label="Current city"]', "new-york-ny");
await page.select('select[aria-label="New city"]', "austin-tx");

// Set the controlled React input through the native value setter so React
// registers the change. Typing into it appends to the existing value, which
// then fails HTML5 max validation and silently blocks the submit.
const salaryInput = await page.$('input[aria-label="Annual salary"]');
await salaryInput.evaluate((el) => {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set;
  setter.call(el, "150000");
  el.dispatchEvent(new Event("input", { bubbles: true }));
});
await page.select('select[aria-label="Household size"]', "3");
const salaryValue = await salaryInput.evaluate((el) => el.value);
check("salary field accepted the input", salaryValue === "150000", salaryValue);

// The form navigates via client-side routing. Polling page.url() from Node is
// more robust than an in-page waitForFunction, whose execution context is
// destroyed by the navigation.
await page.click('button[type="submit"]');
let url = page.url();
for (let i = 0; i < 40 && !url.includes("/compare"); i++) {
  await new Promise((r) => setTimeout(r, 250));
  url = page.url();
}
await new Promise((r) => setTimeout(r, 800));
check("comparison URL built from the form", url.includes("/compare/new-york-ny-vs-austin-tx"), url);
check("salary carried into the URL", url.includes("150000"), url);

// 7. A result actually rendered, not an empty shell.
const bodyText = await page.evaluate(() => document.body.innerText);
const hasMoney = /\$[\d,]{3,}/.test(bodyText);
check("result shows computed money figures", hasMoney);
check("result names both cities", bodyText.includes("New York") && bodyText.includes("Austin"));

// 8. Change the scenario: move the salary slider and confirm the page re-renders.
const slider = await page.$('input[type="range"]');
if (slider) {
  await slider.focus();
  for (let i = 0; i < 12; i++) await page.keyboard.press("ArrowRight");
  await new Promise((r) => setTimeout(r, 1200));
  const after = await page.evaluate(() => document.body.innerText);
  check("changing the scenario updates results", after !== bodyText);
} else {
  check("salary slider present", false, "no range input found");
}

// 9-10. Reload keeps the scenario working (URL is the source of truth).
await page.reload({ waitUntil: "domcontentloaded" });
const reloaded = await page.evaluate(() => document.body.innerText);
check("reload reproduces the comparison", /\$[\d,]{3,}/.test(reloaded));

// 13. Unknown city is a clean 404, not a crash.
const notFound = await page.goto(`${BASE}/cities/not-a-real-city`, {
  waitUntil: "domcontentloaded",
});
check("unknown city returns 404", notFound.status() === 404, `got ${notFound.status()}`);

// 14. Invalid input does not break the page.
const badParams = await page.goto(
  `${BASE}/compare/new-york-ny-vs-austin-tx?salary=abc&household=99&children=-4`,
  { waitUntil: "domcontentloaded" },
);
const badText = await page.evaluate(() => document.body.innerText);
check("invalid params still render a page", badParams.status() === 200 && badText.length > 500);

check("no uncaught JS errors", jsErrors.length === 0, jsErrors[0] ?? "");

await browser.close();

console.log(`\n${failures.length ? "FAILED" : "ALL PASSED"} — ${failures.length} failure(s)`);
if (failures.length) process.exit(1);
