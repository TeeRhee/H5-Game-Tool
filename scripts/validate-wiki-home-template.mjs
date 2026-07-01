import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const templatePath = path.join(repoRoot, "skill-pack/wiki/templates/wiki.json");
const template = JSON.parse(fs.readFileSync(templatePath, "utf8"));

function region(id) {
  const match = template.regions.find((item) => item.id === id);
  if (!match) throw new Error(`Missing Wiki template region: ${id}`);
  return match;
}

function matchesExpected(actual, expected) {
  if (Array.isArray(expected)) {
    return Array.isArray(actual) && actual.length === expected.length && expected.every((item, index) => matchesExpected(actual[index], item));
  }

  if (expected && typeof expected === "object") {
    if (!actual || typeof actual !== "object") return false;
    return Object.entries(expected).every(([key, value]) => matchesExpected(actual[key], value));
  }

  return actual === expected;
}

const header = region("shell.header").observedHomeLayout;
const summary = region("home.summary").observedHomeLayout;
const grid = region("home.category-grid").observedHomeLayout;

const checks = [
  { label: "Canvas width", actual: template.viewport.defaultCanvas.width, expected: 1000 },
  { label: "Canvas height", actual: template.viewport.defaultCanvas.height, expected: 610 },
  { label: "Header frame", actual: header.absoluteFrame, expected: { x: 0, y: 0, width: 1000, height: 68 } },
  { label: "Header padding", actual: header.padding, expected: { top: 32, right: 32, bottom: 0, left: 32 } },
  { label: "Header topbar", actual: header.topBar, expected: { x: 32, y: 32, width: 696, height: 36 } },
  { label: "Header search", actual: header.search, expected: { x: 748, y: 32, width: 220, height: 36 } },
  { label: "Header topbar/search gap", actual: header.gapBetweenTopBarAndSearch, expected: 20 },
  { label: "Body frame", actual: grid.body, expected: { x: 0, y: 68, width: 1000, height: 542 } },
  { label: "Content frame", actual: grid.contentFrame, expected: { bodyRelativeX: 32, bodyRelativeY: 20, width: 936, height: 568, gap: 20 } },
  { label: "Summary frame", actual: summary.bodyRelativeFrame, expected: { x: 32, y: 20, width: 190, height: 56 } },
  { label: "Summary title row", actual: summary.titleRow, expected: { x: 0, y: 0, width: 190, height: 28, gap: 4 } },
  { label: "Summary meta row", actual: summary.metaRow, expected: { x: 0, y: 36, width: 132, height: 20, gap: 4 } },
  { label: "Category grid frame", actual: grid.gridFrame, expected: { contentRelativeX: 0, contentRelativeY: 76, width: 936, height: 492 } },
  { label: "Category card grid", actual: grid.cardGrid, expected: { columns: 4, cardWidth: 225, cardHeight: 114, columnGap: 12, rowGap: 12 } },
  { label: "Category row y positions", actual: grid.rows.map((row) => row.y), expected: [0, 126, 252, 378] },
  { label: "Category card x positions", actual: grid.cardGrid.cardXPositions, expected: [0, 237, 474, 711] },
  { label: "Home scrollbar", actual: grid.scrollbar, expected: { absoluteX: 988, absoluteY: 68, width: 12, height: 542, thumbWidth: 4, thumbHeight: 80, thumbY: 119 } },
].map((check) => ({ ...check, pass: matchesExpected(check.actual, check.expected) }));

const failed = checks.filter((check) => !check.pass);

console.log(
  JSON.stringify(
    {
      template: path.relative(repoRoot, templatePath),
      status: failed.length ? "invalid" : "valid",
      passed: checks.length - failed.length,
      total: checks.length,
      failed: failed.map((check) => check.label),
    },
    null,
    2,
  ),
);

if (failed.length) process.exit(1);
