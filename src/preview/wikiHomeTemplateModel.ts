import wikiTemplate from "../../skill-pack/wiki/templates/wiki.json";

type AnyRecord = Record<string, any>;

export interface TemplateCheck {
  label: string;
  actual: unknown;
  expected: unknown;
  pass: boolean;
}

const template = wikiTemplate as AnyRecord;

function region(id: string) {
  const match = (template.regions as AnyRecord[]).find((item) => item.id === id);
  if (!match) throw new Error(`Missing Wiki template region: ${id}`);
  return match;
}

const headerRegion = region("shell.header");
const summaryRegion = region("home.summary");
const categoryGridRegion = region("home.category-grid");

const headerLayout = headerRegion.observedHomeLayout;
const summaryLayout = summaryRegion.observedHomeLayout;
const gridLayout = categoryGridRegion.observedHomeLayout;

export const wikiHomeTemplateLayout = {
  canvas: template.viewport.defaultCanvas,
  header: headerLayout,
  summary: summaryLayout,
  body: gridLayout.body,
  content: gridLayout.contentFrame,
  grid: gridLayout.gridFrame,
  cardGrid: gridLayout.cardGrid,
  scrollbar: gridLayout.scrollbar,
};

const expectedChecks: Array<{ label: string; actual: unknown; expected: unknown }> = [
  { label: "Canvas width", actual: wikiHomeTemplateLayout.canvas.width, expected: 1000 },
  { label: "Canvas height", actual: wikiHomeTemplateLayout.canvas.height, expected: 610 },
  { label: "Header frame", actual: wikiHomeTemplateLayout.header.absoluteFrame, expected: { x: 0, y: 0, width: 1000, height: 68 } },
  { label: "Header padding", actual: wikiHomeTemplateLayout.header.padding, expected: { top: 32, right: 32, bottom: 0, left: 32 } },
  { label: "Header topbar", actual: wikiHomeTemplateLayout.header.topBar, expected: { x: 32, y: 32, width: 696, height: 36 } },
  { label: "Header search", actual: wikiHomeTemplateLayout.header.search, expected: { x: 748, y: 32, width: 220, height: 36 } },
  { label: "Header topbar/search gap", actual: wikiHomeTemplateLayout.header.gapBetweenTopBarAndSearch, expected: 20 },
  { label: "Body frame", actual: wikiHomeTemplateLayout.body, expected: { x: 0, y: 68, width: 1000, height: 542 } },
  { label: "Content frame", actual: wikiHomeTemplateLayout.content, expected: { bodyRelativeX: 32, bodyRelativeY: 20, width: 936, height: 568, gap: 20 } },
  { label: "Summary frame", actual: wikiHomeTemplateLayout.summary.bodyRelativeFrame, expected: { x: 32, y: 20, width: 190, height: 56 } },
  { label: "Summary title row", actual: wikiHomeTemplateLayout.summary.titleRow, expected: { x: 0, y: 0, width: 190, height: 28, gap: 4 } },
  { label: "Summary meta row", actual: wikiHomeTemplateLayout.summary.metaRow, expected: { x: 0, y: 36, width: 132, height: 20, gap: 4 } },
  { label: "Category grid frame", actual: wikiHomeTemplateLayout.grid, expected: { contentRelativeX: 0, contentRelativeY: 76, width: 936, height: 492 } },
  { label: "Category card grid", actual: wikiHomeTemplateLayout.cardGrid, expected: { columns: 4, cardWidth: 225, cardHeight: 114, columnGap: 12, rowGap: 12 } },
  { label: "Category row y positions", actual: gridLayout.rows.map((row: AnyRecord) => row.y), expected: [0, 126, 252, 378] },
  { label: "Category card x positions", actual: wikiHomeTemplateLayout.cardGrid.cardXPositions, expected: [0, 237, 474, 711] },
  { label: "Home scrollbar", actual: wikiHomeTemplateLayout.scrollbar, expected: { absoluteX: 988, absoluteY: 68, width: 12, height: 542, thumbWidth: 4, thumbHeight: 80, thumbY: 119 } },
];

function matchesExpected(actual: unknown, expected: unknown): boolean {
  if (Array.isArray(expected)) {
    return Array.isArray(actual) && expected.length === actual.length && expected.every((item, index) => matchesExpected(actual[index], item));
  }

  if (expected && typeof expected === "object") {
    if (!actual || typeof actual !== "object") return false;
    return Object.entries(expected).every(([key, value]) => matchesExpected((actual as AnyRecord)[key], value));
  }

  return actual === expected;
}

export function getWikiHomeTemplateChecks(): TemplateCheck[] {
  return expectedChecks.map((check) => ({
    ...check,
    pass: matchesExpected(check.actual, check.expected),
  }));
}

export function getObservedScrollbarTop() {
  const scrollHeight = wikiHomeTemplateLayout.content.bodyRelativeY + wikiHomeTemplateLayout.content.height;
  const maxScrollTop = Math.max(scrollHeight - wikiHomeTemplateLayout.body.height, 0);
  const maxThumbTop = Math.max(wikiHomeTemplateLayout.scrollbar.height - wikiHomeTemplateLayout.scrollbar.thumbHeight - 16, 0);

  if (maxScrollTop === 0 || maxThumbTop === 0) return 0;
  return ((wikiHomeTemplateLayout.scrollbar.thumbY - 8) / maxThumbTop) * maxScrollTop;
}
