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
const secondaryBreadcrumbs = region("secondary.breadcrumbs").observedSecondaryLayout;
const secondaryList = region("secondary.card-list").observedSecondaryLayout;
const secondaryMultiTabs = region("secondary.multi-level-tabs").observedSecondaryMultiNavLayout;
const secondaryMultiSidebar = region("secondary.multi-level-sidebar").observedSecondaryMultiNavLayout;
const secondaryMultiList = region("secondary.multi-level-card-list").observedSecondaryMultiNavLayout;
const detailBreadcrumbs = region("detail.breadcrumbs").observedDetailLayouts;
const detailShell = region("detail.content-shell").observedDetailLayouts;
const detailHero = region("detail.hero-card").observedDetailLayouts;
const detailAttributes = region("detail.attribute-section").observedDetailLayouts;
const detailRelated = region("detail.related-section").observedDetailLayouts;
const detailCard = region("detail.detail-card-section").observedDetailLayouts;
const detailExtended = region("detail.extended-section").observedDetailLayouts;

const checks = [
  { label: "Canvas width", actual: template.viewport.defaultCanvas.width, expected: 1000 },
  { label: "Canvas height", actual: template.viewport.defaultCanvas.height, expected: 610 },
  { label: "Observed all-states reference documented", actual: template.viewport.observedFigmaViewport.rule.includes("DetailPageAllStates"), expected: true },
  { label: "Header frame", actual: header.absoluteFrame, expected: { x: 0, y: 0, width: 1000, height: 68 } },
  { label: "Header padding", actual: header.padding, expected: { top: 32, right: 32, bottom: 0, left: 32 } },
  { label: "Header topbar", actual: header.topBar, expected: { x: 32, y: 32, width: 696, height: 36 } },
  { label: "Header search", actual: header.search, expected: { x: 748, y: 32, width: 220, height: 36 } },
  { label: "Header topbar/search gap", actual: header.gapBetweenTopBarAndSearch, expected: 20 },
  { label: "Body frame", actual: grid.body, expected: { x: 0, y: 68, width: 1000, height: 542 } },
  { label: "Content frame", actual: grid.contentFrame, expected: { bodyRelativeX: 32, bodyRelativeY: 20, width: 936, height: 568, gap: 20 } },
  { label: "Summary frame", actual: summary.bodyRelativeFrame, expected: { x: 32, y: 20, width: 190, height: 56 } },
  { label: "Summary title row", actual: summary.titleRow, expected: { x: 0, y: 0, width: 190, height: 28, gap: 4 } },
  { label: "Summary title game segment", actual: summary.titleRow.textSegments[0], expected: { binding: "gameName", x: 0, width: 80 } },
  { label: "Summary title fixed segment", actual: summary.titleRow.textSegments[1], expected: { x: 84, width: 86 } },
  { label: "Summary meta row", actual: summary.metaRow, expected: { x: 0, y: 36, width: 132, height: 20, gap: 4 } },
  { label: "Category grid frame", actual: grid.gridFrame, expected: { contentRelativeX: 0, contentRelativeY: 76, width: 936, height: 492 } },
  { label: "Category card grid", actual: grid.cardGrid, expected: { columns: 4, cardWidth: 225, cardHeight: 114, columnGap: 12, rowGap: 12 } },
  { label: "Category row y positions", actual: grid.rows.map((row) => row.y), expected: [0, 126, 252, 378] },
  { label: "Category card x positions", actual: grid.cardGrid.cardXPositions, expected: [0, 237, 474, 711] },
  { label: "Home scrollbar", actual: grid.scrollbar, expected: { absoluteX: 988, absoluteY: 68, width: 12, height: 542, thumbWidth: 4, thumbHeight: 80, thumbY: 119 } },
  { label: "Secondary breadcrumbs reserved frame", actual: secondaryBreadcrumbs.frame, expected: { bodyRelativeX: 20, bodyRelativeY: 16, absoluteX: 20, absoluteY: 80, width: 216, height: 28 } },
  { label: "Secondary body frame", actual: secondaryList.body, expected: { x: 0, y: 64, width: 1000, height: 546 } },
  { label: "Secondary list container", actual: secondaryList.listContainer, expected: { bodyRelativeX: 32, bodyRelativeY: 64, absoluteX: 32, absoluteY: 128, width: 936, height: 408, rowGap: 8 } },
  { label: "Secondary card grid", actual: secondaryList.cardGrid, expected: { columns: 3, visibleDesignRows: 4, cardWidth: 306.6667, cardHeight: 96, columnGap: 8, rowGap: 8 } },
  { label: "Secondary card x positions", actual: secondaryList.cardGrid.cardXPositions, expected: [0, 314.6667, 629.3334] },
  { label: "Secondary row y positions", actual: secondaryList.cardGrid.rowYPositions, expected: [0, 104, 208, 312] },
  { label: "Secondary DescribeCard image area", actual: secondaryList.describeCardInternals.image, expected: { x: 8, y: 8, width: 80, height: 80 } },
  { label: "Secondary DescribeCard content area", actual: secondaryList.describeCardInternals.content, expected: { x: 100, y: 8, width: 198.6667, height: 80 } },
  { label: "Secondary pagination frame", actual: secondaryList.pagination, expected: { bodyRelativeX: 0, bodyRelativeY: 482, absoluteX: 0, absoluteY: 546, width: 1000, height: 64 } },
  { label: "Secondary multi-nav state node", actual: template.source.stateNodes.secondaryMultiNav, expected: "375:4979" },
  { label: "Secondary multi-nav body", actual: secondaryMultiTabs.body, expected: { x: 0, y: 68, width: 1000, height: 542 } },
  { label: "Secondary multi-nav tabs container", actual: secondaryMultiTabs.tabsContainer, expected: { bodyRelativeX: 32, bodyRelativeY: 16, absoluteX: 32, absoluteY: 84, width: 390, height: 26, gap: 6 } },
  { label: "Secondary multi-nav tab instances", actual: secondaryMultiTabs.tabInstances, expected: { component: "Nav.SecondaryTab", count: 6, width: 60, height: 26, xPositions: [0, 66, 132, 198, 264, 330], activeIndex: 0 } },
  { label: "Secondary multi-nav content shell", actual: secondaryMultiSidebar.contentShell, expected: { bodyRelativeX: 32, bodyRelativeY: 62, absoluteX: 32, absoluteY: 130, width: 936, height: 480, gap: 20 } },
  { label: "Secondary multi-nav sidebar", actual: secondaryMultiSidebar.navigate, expected: { shellRelativeX: 0, shellRelativeY: 0, absoluteX: 32, absoluteY: 130, width: 96, height: 480, paddingRight: 16, paddingY: 8, listWidth: 80 } },
  { label: "Secondary multi-nav show card list", actual: secondaryMultiList.showCardList, expected: { shellRelativeX: 116, shellRelativeY: 0, absoluteX: 148, absoluteY: 130, width: 820, height: 480, rowGap: 8 } },
  { label: "Secondary multi-nav card grid", actual: secondaryMultiList.cardGrid, expected: { component: "Game.ShowCard", columns: 2, visibleDesignRows: 6, cardWidth: 406, cardHeight: 76, columnGap: 8, rowGap: 8, cardXPositions: [0, 414], rowYPositions: [0, 84, 168, 252, 336, 420], overflowBeyondShell: 16 } },
  { label: "Detail large breadcrumbs", actual: detailBreadcrumbs.largeCardExpanded.frame, expected: { bodyRelativeX: 20, bodyRelativeY: 16, absoluteX: 20, absoluteY: 80, width: 338, height: 28 } },
  { label: "Detail all-states breadcrumbs", actual: detailBreadcrumbs.allStates.frame, expected: { bodyRelativeX: 20, bodyRelativeY: 16, absoluteX: 20, absoluteY: 80, width: 338, height: 28 } },
  { label: "Detail large content shell", actual: detailShell.largeCardExpanded.detailContent, expected: { bodyRelativeX: 20, bodyRelativeY: 64, absoluteX: 20, absoluteY: 128, width: 960, height: 1212 } },
  { label: "Detail large scroll", actual: detailShell.largeCardExpanded.scroll, expected: { bodyRelativeX: 980, bodyRelativeY: 60, absoluteX: 980, absoluteY: 124, width: 12, height: 466 } },
  { label: "Detail large section stack", actual: detailShell.largeCardExpanded.sectionStack, expected: { padding: 16, gap: 20, heroHeight: 128, expandedSectionsY: 128, expandedSectionsHeight: 1084 } },
  { label: "Detail all-states content shell", actual: detailShell.allStates.detailContent, expected: { bodyRelativeX: 20, bodyRelativeY: 64, absoluteX: 20, absoluteY: 128, width: 960, height: 1022 } },
  { label: "Detail all-states scroll", actual: detailShell.allStates.scroll, expected: { bodyRelativeX: 980, bodyRelativeY: 60, absoluteX: 980, absoluteY: 124, width: 12, height: 1015 } },
  { label: "Detail all-states section stack", actual: detailShell.allStates.sectionStack, expected: { padding: 16, gap: 20, heroHeight: 108, detailSectionsY: 108, detailSectionsHeight: 914 } },
  { label: "Detail large hero card", actual: detailHero.largeCardExpanded.card, expected: { component: "Layout.DescribeCard", sectionRelativeX: 16, sectionRelativeY: 16, absoluteX: 36, absoluteY: 144, width: 928, height: 96 } },
  { label: "Detail all-states hero card", actual: detailHero.allStates.card, expected: { component: "Game.ShowCard", sectionRelativeX: 16, sectionRelativeY: 16, absoluteX: 36, absoluteY: 144, width: 928, height: 76 } },
  { label: "Detail large attribute section", actual: detailAttributes.largeCardExpanded.section, expected: { parentRelativeX: 16, parentRelativeY: 16, absoluteX: 36, absoluteY: 272, width: 928, height: 154 } },
  { label: "Detail all-states attribute section", actual: detailAttributes.allStates.section, expected: { parentRelativeX: 16, parentRelativeY: 16, absoluteX: 36, absoluteY: 252, width: 928, height: 84 } },
  { label: "Detail large related section", actual: detailRelated.largeCardExpanded.section, expected: { parentRelativeX: 16, parentRelativeY: 190, absoluteX: 36, absoluteY: 446, width: 928, height: 208 } },
  { label: "Detail large related row", actual: detailRelated.largeCardExpanded.relatedRow, expected: { x: 0, y: 62, width: 928, height: 76, columns: 2, cardWidth: 458, cardHeight: 76, columnGap: 12 } },
  { label: "Detail large related detail row", actual: detailRelated.largeCardExpanded.detailsRow, expected: { x: 0, y: 150, width: 928, height: 58, itemWidth: 214, itemHeight: 42, itemXPositions: [0, 238, 476, 714] } },
  { label: "Detail all-states related section", actual: detailRelated.allStates.section, expected: { parentRelativeX: 16, parentRelativeY: 120, absoluteX: 36, absoluteY: 356, width: 928, height: 138 } },
  { label: "Detail large structured card", actual: detailCard.largeCardExpanded, expected: { component: "Layout.DetailCard", parentRelativeX: 16, parentRelativeY: 418, absoluteX: 36, absoluteY: 674, width: 928, height: 328 } },
  { label: "Detail all-states structured card", actual: detailCard.allStates, expected: { component: "Layout.DetailCard", parentRelativeX: 16, parentRelativeY: 388, absoluteX: 36, absoluteY: 624, width: 928, height: 258 } },
  { label: "Detail large extended section", actual: detailExtended.largeCardExpanded, expected: { parentRelativeX: 16, parentRelativeY: 766, absoluteX: 36, absoluteY: 1022, width: 928, height: 302 } },
  { label: "Detail all-states extended section", actual: detailExtended.allStates, expected: { parentRelativeX: 16, parentRelativeY: 666, absoluteX: 36, absoluteY: 902, width: 928, height: 232 } },
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
