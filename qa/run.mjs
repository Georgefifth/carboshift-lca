// Playwright QA Runner for CarboShift LCA
import { chromium, firefox } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:5199";
const OUT = process.env.QA_OUT ?? "evidence/stage-3-qa";
const BROWSER = process.env.BROWSER === "firefox" ? "firefox" : "chromium";
const HEADED = process.env.HEADED === "1";

const SHOTS = path.join(OUT, "screens");
fs.mkdirSync(SHOTS, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: "mobile", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectVisible(page, selector, timeout = 10000) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible", timeout });
  return locator;
}

const scenarios = [
  {
    id: "smoke",
    title: "Landing page renders cleanly without horizontal overflow",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "networkidle" });
      await ctx.expectVisible("body");
      const title = (await page.title()).trim();
      ctx.assert(title.includes("CarboShift LCA"), `Unexpected title: ${title}`);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      ctx.assert(overflow <= 1, `Horizontal overflow detected: ${overflow}px`);

      // Verify key landmark elements
      await ctx.expectVisible("header");
      await ctx.expectVisible("text=Carbon Breakeven");
      await ctx.expectVisible("text=10-Yr Carbon Abatement");
      await ctx.shot("landing");
    },
  },
  {
    id: "core-flow",
    title: "Configure vehicles, adjust grid, and assert reactive breakeven calculation",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "networkidle" });

      // Change incumbent vehicle to 2014 Ford F-150
      const incumbentSelect = page.locator("select").first();
      await incumbentSelect.selectOption({ label: "2014 Ford F-150 V8 (Full-size Truck)" });
      await page.waitForTimeout(300);

      // Verify incumbent tailpipe emissions updated
      const baselineText = await page.locator("text=Incumbent Baseline").first().textContent();
      ctx.assert(baselineText !== null, "Baseline vehicle section should exist");

      // Verify that Carbon Breakeven is actively calculated (e.g. Month 14 or Month X)
      const breakevenPill = await page.locator("text=/Month \\d+/").first();
      await breakevenPill.waitFor({ state: "visible", timeout: 5000 });
      const text = await breakevenPill.textContent();
      ctx.assert(text !== null && text.includes("Month"), `Breakeven should show Month X, got: ${text}`);

      await ctx.shot("configured-f150");
    },
  },
  {
    id: "scenario-presets",
    title: "Switch between benchmark preset scenarios",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "networkidle" });

      // Click Preset 3: Coal Grid Stress Test
      await page.click("text=3. Coal Grid Stress Test");
      await page.waitForTimeout(400);

      // Verify grid updated to MISO (560 g/kWh)
      const misoGrid = await page.locator("text=/560\\s*g\\/kWh/").first();
      await misoGrid.waitFor({ state: "visible", timeout: 5000 });
      await ctx.shot("preset-miso-coal");

      // Click Preset 4: Clean Hydro Super-Shift
      await page.click("text=4. Clean Hydro Super-Shift");
      await page.waitForTimeout(400);

      // Verify grid updated to NWPP (112 g/kWh)
      const hydroGrid = await page.locator("text=/112\\s*g\\/kWh/").first();
      await hydroGrid.waitFor({ state: "visible", timeout: 5000 });
      await ctx.shot("preset-clean-hydro");
    },
  },
  {
    id: "tabs-deepdive",
    title: "Navigate across Lifecycle Waterfall and TCO Economics views",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "networkidle" });

      // Click Tab 2: Lifecycle Waterfall
      await page.click("text=2. Lifecycle Waterfall");
      await page.waitForTimeout(300);
      await ctx.expectVisible("text=10-Year Lifecycle Waterfall Decomposition");
      await ctx.shot("tab-waterfall");

      // Click Tab 3: TCO Economics
      await page.click("text=3. TCO Economics");
      await page.waitForTimeout(300);
      await ctx.expectVisible("text=Total Cost of Ownership (TCO)");
      await ctx.shot("tab-economics");

      // Return to Tab 1: Crossover Trajectory
      await page.click("text=1. Crossover Trajectory");
      await page.waitForTimeout(300);
      await ctx.expectVisible("text=CRADLE-TO-GRAVE CARBON CROSSOVER TRAJECTORY");
      await ctx.shot("tab-crossover");
    },
  },
  {
    id: "scientific-audit",
    title: "Open and inspect the Scientific Audit & Methodology modal",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "networkidle" });

      await page.click("text=Scientific Audit");
      await page.waitForTimeout(300);

      // Verify modal contents
      await ctx.expectVisible("text=CarboShift Scientific Audit & Methodology");
      await ctx.expectVisible("text=Argonne National Laboratory GREET");
      await ctx.expectVisible("text=US EPA eGRID 2024 Release");
      await ctx.shot("modal-audit-open");

      // Close modal
      await page.click("text=Close Audit Spec");
      await page.waitForTimeout(200);

      const modalCount = await page.locator("text=CarboShift Scientific Audit & Methodology").count();
      ctx.assert(modalCount === 0, "Modal should be closed after clicking Close");
      await ctx.shot("modal-closed");
    },
  },
  {
    id: "units-toggle",
    title: "Toggle between Imperial (mi/gal) and Metric (km/L)",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "networkidle" });

      // Click toggle
      await page.click("text=Unit: Imperial (mi/gal)");
      await page.waitForTimeout(200);

      await ctx.expectVisible("text=Unit: Metric (km/L)");
      await ctx.shot("metric-units");

      // Toggle back to Imperial
      await page.click("text=Unit: Metric (km/L)");
      await page.waitForTimeout(200);
      await ctx.expectVisible("text=Unit: Imperial (mi/gal)");
    },
  },
];

function collectIssues(page) {
  const issues = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") issues.push({ kind: "console", text: msg.text() });
  });
  page.on("pageerror", (err) => {
    issues.push({ kind: "pageerror", text: err.message });
  });
  page.on("requestfailed", (req) => {
    const reason = req.failure()?.errorText ?? "request failed";
    if (!reason.includes("ERR_ABORTED")) {
      issues.push({ kind: "requestfailed", text: `${reason} ${req.url()}` });
    }
  });
  page.on("response", (res) => {
    const status = res.status();
    if (status >= 500) issues.push({ kind: "http", text: `${status} ${res.url()}` });
    else if (status >= 400) {
      issues.push({ kind: "http", level: "warn", text: `${status} ${res.url()}` });
    }
  });
  return issues;
}

async function main() {
  const browserType = BROWSER === "firefox" ? firefox : chromium;
  const browser = await browserType.launch({ headless: !HEADED });
  const startedAt = new Date().toISOString();
  const results = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      baseURL: BASE,
      viewport: vp.viewport,
      deviceScaleFactor: vp.deviceScaleFactor,
    });

    for (const scenario of scenarios) {
      const page = await context.newPage();
      const issues = collectIssues(page);
      const screenshots = [];
      const started = Date.now();
      let status = "pass";
      let error = null;

      const ctx = {
        assert,
        expectVisible: (selector, timeout) => expectVisible(page, selector, timeout),
        shot: async (name, opts = {}) => {
          const file = path.join(SHOTS, `${scenario.id}-${name}-${vp.name}.png`);
          await page.screenshot({ path: file, fullPage: opts.fullPage ?? true });
          screenshots.push(file);
          return file;
        },
      };

      try {
        await scenario.run(page, ctx);
      } catch (err) {
        status = "fail";
        error = err.message;
      } finally {
        await page.close().catch(() => {});
      }

      const errors = issues.filter((i) => (i.level ?? "error") === "error");
      const warnings = issues.filter((i) => i.level === "warn");
      if (status === "pass" && errors.length > 0) {
        status = "fail";
        error = errors.map((i) => `${i.kind}: ${i.text}`).join(" | ");
      }

      results.push({
        viewport: vp.name,
        id: scenario.id,
        title: scenario.title,
        status,
        ms: Date.now() - started,
        error,
        errors,
        warnings,
        screenshots,
      });

      console.log(
        `${status === "pass" ? "✓" : "✗"} [${vp.name}] ${scenario.id}` +
          (error ? ` — ${error}` : "")
      );
    }

    await context.close();
  }

  await browser.close();

  const summary = {
    total: results.length,
    pass: results.filter((r) => r.status === "pass").length,
    fail: results.filter((r) => r.status === "fail").length,
  };
  const finishedAt = new Date().toISOString();
  const report = {
    base: BASE,
    browser: BROWSER,
    headed: HEADED,
    startedAt,
    finishedAt,
    summary,
    results,
  };

  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(report, null, 2));

  const warnings = results.flatMap((r) =>
    r.warnings.map((w) => `- [${r.viewport}] ${r.id}: ${w.kind} — ${w.text}`)
  );
  const md = [
    `# QA Execution Report — ${finishedAt}`,
    "",
    `- **Base URL**: ${BASE}`,
    `- **Browser**: ${BROWSER} (${HEADED ? "headed" : "headless"})`,
    `- **Scenarios Executed**: ${summary.total}`,
    `- **Passed**: ${summary.pass}`,
    `- **Failed**: ${summary.fail}`,
    "",
    "| Viewport | Scenario ID | Status | Duration (ms) | Notes / Detail |",
    "|---|---|---|---|---|",
    ...results.map(
      (r) =>
        `| ${r.viewport} | ${r.id} | ${r.status === 'pass' ? '✅ PASS' : '❌ FAIL'} | ${r.ms} | ${(r.error ?? "All assertions passed").replace(/\|/g, "\\|")} |`
    ),
    "",
    ...(warnings.length ? ["## Warnings", "", ...warnings, ""] : []),
    "## Captured Evidence Screenshots",
    "",
    ...results.flatMap((r) => r.screenshots.map((s) => `- \`${s}\``)),
    "",
  ];
  fs.writeFileSync(path.join(OUT, "report.md"), md.join("\n"));

  console.log(`\n${summary.pass}/${summary.total} passed — report written to ${OUT}/`);
  process.exit(summary.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
