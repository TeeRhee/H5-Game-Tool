import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const templatePath = path.join(repoRoot, "skill-pack/wiki/templates/wiki.json");
const template = JSON.parse(fs.readFileSync(templatePath, "utf8"));
const mapping = JSON.parse(fs.readFileSync(path.join(repoRoot, "skill-pack/wiki/mapping/wiki.json"), "utf8"));
const components = JSON.parse(fs.readFileSync(path.join(repoRoot, "skill-pack/components.json"), "utf8"));

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
const secondaryLargeCard = region("secondary.card-list").observedSecondaryLargeCardLayout;
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
const guideDocument = region("guide.document-detail");
const guideDocumentLayouts = guideDocument.observedGuideDetailLayouts;
const modalRegion = region("modal.item-explanation");
const baseImageComponent = components.components.find((component) => component.id === "Base.Image");
const modalComponent = components.components.find((component) => component.id === "Base.Modal");
const describeCardComponent = components.components.find((component) => component.id === "Layout.DescribeCard");
const detailCardComponent = components.components.find((component) => component.id === "Layout.DetailCard");
const showCardComponent = components.components.find((component) => component.id === "Game.ShowCard");
const breadcrumbsComponent = components.components.find((component) => component.id === "Nav.Breadcrumbs");
const commandMenuItemComponent = components.components.find((component) => component.id === "Nav.CommandMenuItem");

const checks = [
  { label: "Canvas width", actual: template.viewport.defaultCanvas.width, expected: 1000 },
  { label: "Canvas height", actual: template.viewport.defaultCanvas.height, expected: 610 },
  { label: "Home state node", actual: template.source.stateNodes.home, expected: "477:3685" },
  { label: "Observed all-states reference documented", actual: template.viewport.observedFigmaViewport.rule.includes("DetailPageAllStates"), expected: true },
  { label: "Guide detail with nav and info state node", actual: template.source.stateNodes.guideDetailWithNavAndInfo, expected: "304:18296" },
  { label: "Guide detail with info state node", actual: template.source.stateNodes.guideDetailWithInfo, expected: "306:4332" },
  { label: "Guide detail with nav state node", actual: template.source.stateNodes.guideDetailWithNav, expected: "306:4716" },
  { label: "Modal state node", actual: template.source.stateNodes.modal, expected: "438:3663" },
  { label: "Modal detail state node", actual: template.source.stateNodes.modalDetail, expected: "436:5415" },
  { label: "Modal video state node", actual: template.source.stateNodes.modalVideo, expected: "438:3662" },
  { label: "Modal component node", actual: modalComponent?.sourceNodeId, expected: "438:3663" },
  { label: "Modal video variant prop", actual: modalComponent?.props?.variant?.values?.includes("video"), expected: true },
  { label: "Modal video variant node", actual: modalComponent?.observedVariantNodes?.video, expected: "438:3662" },
  { label: "Modal quick locate", actual: template.source.quickLocate.itemExplanationModal.aliases.includes("Base.Modal"), expected: true },
  { label: "Modal usage policy", actual: template.templateUsagePolicy.itemExplanationModal.includes("original source page opens a modal"), expected: true },
  { label: "Modal region component", actual: modalRegion.allowedComponents.includes("Base.Modal"), expected: true },
  { label: "Modal overlay layout", actual: modalRegion.layout.overlay.includes("50% opacity") && modalRegion.layout.dialog.includes("Property=Vedio") && modalRegion.layout.video.includes("357 x 238"), expected: true },
  { label: "Modal mapping rule", actual: mapping.rules.some((rule) => rule.includes("Base.Modal") && rule.includes("variant=video") && rule.includes("normal detail pages")), expected: true },
  { label: "Modal renderer rule", actual: template.requiredRendererBehavior.some((rule) => rule.includes("modal.item-explanation") && rule.includes("variant=video") && rule.includes("438:3662")), expected: true },
  { label: "Guide document quick locate", actual: template.source.quickLocate.documentGuideDetail.aliases.includes("GuideDetailWithInfo"), expected: true },
  { label: "Guide document usage policy", actual: template.templateUsagePolicy.documentGuideDetail.includes("GuideDetailWithNavAndInfo"), expected: true },
  { label: "Breadcrumb placement policy", actual: template.templateUsagePolicy.breadcrumbPlacement.includes("bodyRelativeX=32") && template.templateUsagePolicy.breadcrumbPlacement.includes("bodyRelativeY=16") && template.templateUsagePolicy.breadcrumbPlacement.includes("height=26"), expected: true },
  { label: "Page-scoped card-set consistency policy", actual: template.templateUsagePolicy.pageScopedCardSetConsistency.includes("current rendered page/list only"), expected: true },
  { label: "Image ratio does not inherit across second-level tabs", actual: template.requiredRendererBehavior.some((rule) => rule.includes("Do not reuse an imageRatio selected for one second-level tab")), expected: true },
  { label: "Mapping image ratio scoped to current page list", actual: mapping.rules.some((rule) => rule.includes("current rendered page/list") && rule.includes("re-evaluate imageRatio independently")), expected: true },
  { label: "Base Image 4:5 ratio", actual: baseImageComponent?.props?.ratio?.values?.includes("4:5"), expected: true },
  { label: "DescribeCard 4:5 ratio", actual: describeCardComponent?.props?.imageRatio?.values?.includes("4:5"), expected: true },
  { label: "ShowCard 4:5 ratio", actual: showCardComponent?.props?.imageRatio?.values?.includes("4:5"), expected: true },
  { label: "Mapping 4:5 image ratio rule", actual: mapping.rules.some((rule) => rule.includes("4:5") && rule.includes("vertical portraits")), expected: true },
  { label: "Template 4:5 image ratio rule", actual: template.requiredRendererBehavior.some((rule) => rule.includes("4:5") && rule.includes("vertical portraits")), expected: true },
  { label: "ShowCard voice variant registered", actual: showCardComponent?.props?.variant?.values?.includes("voice"), expected: true },
  { label: "ShowCard voice Figma node", actual: showCardComponent?.observedStructure?.voiceVariant?.figmaNodeId, expected: "434:3632" },
  { label: "ShowCard voice mapping rule", actual: mapping.rules.some((rule) => rule.includes("variant=voice") && rule.includes("audioSrc") && rule.includes("durationLabel")), expected: true },
  { label: "ShowCard voice renderer rule", actual: template.requiredRendererBehavior.some((rule) => rule.includes("variant=voice") && rule.includes("498 x 58")), expected: true },
  { label: "Tooltip portal rule in component contract", actual: components.components.find((component) => component.id === "Base.ToolTip")?.observedStructure?.portalRule, expected: "The visible bubble must render in a page/body-level overlay or portal, not as a normal child inside the hovered text/card/list container. The trigger remains inside the original component for measurement, but the bubble must escape overflow:hidden, clip, and scroll containers so it is never cropped by small cards or list rows. A tooltip implementation that depends on local overflow:visible, local z-index stacking, or absolute positioning inside the hovered container is invalid." },
  { label: "Tooltip placement auto rule in component contract", actual: components.components.find((component) => component.id === "Base.ToolTip")?.props?.placement?.rule, expected: "Use auto for production text disclosure so the component chooses the direction that best fits the current viewport. Do not constrain placement to the nearest scroll/clipping container; the bubble is rendered through the portal/overlay specifically to escape those containers. Do not keep the bubble inside the hovered card/list row just to satisfy local layout rules. Use a fixed direction only for intentional component demos or when the caller has already resolved placement." },
  { label: "ShowCard tooltip mapping portal rule", actual: mapping.rules.some((rule) => rule.includes("Game.ShowCard descriptions") && rule.includes("page/body-level portal overlay") && rule.includes("overflow:hidden, clip, or scroll containers")), expected: true },
  { label: "ShowCard tooltip renderer portal rule", actual: template.requiredRendererBehavior.some((rule) => rule.includes("Base.ToolTip") && rule.includes("page/body-level portal overlay") && rule.includes("small hover containers")), expected: true },
  { label: "DescribeCard showTitle prop", actual: describeCardComponent?.props?.showTitle?.default, expected: true },
  { label: "DescribeCard showDescription prop", actual: describeCardComponent?.props?.showDescription?.default, expected: true },
  { label: "DescribeCard nested Base.Image rule", actual: describeCardComponent?.observedStructure?.nestedImageComponent?.includes("nested Base.Image component"), expected: true },
  { label: "DescribeCard nested Base.Image template", actual: secondaryList.describeCardInternals.image.component, expected: "Base.Image" },
  { label: "DescribeCard nested Base.Image mapping", actual: mapping.rules.some((rule) => rule.includes("Layout.DescribeCard image data") && rule.includes("nested Base.Image")), expected: true },
  { label: "DescribeCard optional region renderer rule", actual: template.requiredRendererBehavior.some((rule) => rule.includes("ShowImage") && rule.includes("ShowTitle") && rule.includes("collapse its spacing")), expected: true },
  { label: "DescribeCard optional region mapping rule", actual: mapping.rules.some((rule) => rule.includes("showImage, showTitle, showDescription, showBadge, and showAttributes")), expected: true },
  { label: "Header frame", actual: header.absoluteFrame, expected: { x: 0, y: 0, width: 1000, height: 84 } },
  { label: "Header padding", actual: header.padding, expected: { top: 32, right: 32, bottom: 16, left: 32 } },
  { label: "Header topbar", actual: header.topBar, expected: { x: 32, y: 32, width: 696, height: 36 } },
  { label: "Header search", actual: header.search, expected: { x: 748, y: 32, width: 220, height: 36 } },
  { label: "Header topbar/search gap", actual: header.gapBetweenTopBarAndSearch, expected: 20 },
  { label: "Body frame", actual: grid.body, expected: { x: 0, y: 68, width: 1000, height: 542 } },
  { label: "Content frame", actual: grid.contentFrame, expected: { bodyRelativeX: 32, bodyRelativeY: 20, width: 936, height: 604, gap: 12 } },
  { label: "Summary banner", actual: summary.summaryBanner, expected: { contentRelativeX: 0, contentRelativeY: 0, width: 936, height: 100 } },
  { label: "Summary frame", actual: summary.bodyRelativeFrame, expected: { x: 52, y: 42, width: 170, height: 56 } },
  { label: "Summary title row", actual: summary.titleRow, expected: { x: 0, y: 0, width: 170, height: 28, gap: 4 } },
  { label: "Summary title game segment", actual: summary.titleRow.textSegments[0], expected: { binding: "gameName", x: 0, width: 80 } },
  { label: "Summary title fixed segment", actual: summary.titleRow.textSegments[1], expected: { x: 84, width: 86 } },
  { label: "Summary meta row", actual: summary.metaRow, expected: { x: 0, y: 36, width: 132, height: 20, gap: 4 } },
  { label: "Category grid frame", actual: grid.gridFrame, expected: { contentRelativeX: 0, contentRelativeY: 112, width: 936, height: 492 } },
  { label: "Category card grid", actual: grid.cardGrid, expected: { columns: 4, cardWidth: 225, cardHeight: 114, columnGap: 12, rowGap: 12 } },
  { label: "Category row y positions", actual: grid.rows.map((row) => row.y), expected: [0, 126, 252, 378] },
  { label: "Category card x positions", actual: grid.cardGrid.cardXPositions, expected: [0, 237, 474, 711] },
  { label: "Home scrollbar", actual: grid.scrollbar, expected: { absoluteX: 988, absoluteY: 68, width: 12, height: 542, thumbWidth: 4, thumbHeight: 80, thumbY: 8 } },
  { label: "Secondary breadcrumbs reserved frame", actual: secondaryBreadcrumbs.frame, expected: { bodyRelativeX: 20, bodyRelativeY: 16, absoluteX: 20, absoluteY: 96, width: 216, height: 28 } },
  { label: "Secondary body frame", actual: secondaryList.body, expected: { x: 0, y: 80, width: 1000, height: 530 } },
  { label: "Secondary list container", actual: secondaryList.listContainer, expected: { bodyRelativeX: 32, bodyRelativeY: 64, absoluteX: 32, absoluteY: 144, width: 936, height: 408, rowGap: 8 } },
  { label: "Secondary card grid", actual: secondaryList.cardGrid, expected: { columns: 3, visibleDesignRows: 4, cardWidth: 306.6667, cardHeight: 96, columnGap: 8, rowGap: 8 } },
  { label: "Secondary card x positions", actual: secondaryList.cardGrid.cardXPositions, expected: [0, 314.6667, 629.3334] },
  { label: "Secondary row y positions", actual: secondaryList.cardGrid.rowYPositions, expected: [0, 104, 208, 312] },
  { label: "Secondary DescribeCard SM default", actual: secondaryList.describeCardInternals.sizeSmDefault, expected: { width: 328, height: 106, padding: 8, gap: 12 } },
  { label: "Secondary DescribeCard image area", actual: secondaryList.describeCardInternals.image, expected: { x: 8, y: 8, width: 90, height: 90 } },
  { label: "Secondary DescribeCard content area", actual: secondaryList.describeCardInternals.content, expected: { x: 110, y: 8, width: 210, height: 90, gap: 6 } },
  { label: "Secondary DescribeCard subtitle", actual: secondaryList.describeCardInternals.description, expected: { x: 0, y: 26, width: 210, height: 36, lineHeight: 18, visibleLines: 2, tooltip: "Wrap with Base.ToolTip only when the rendered subtitle is actually truncated or hidden." } },
  { label: "Secondary pagination frame", actual: secondaryList.pagination, expected: { bodyRelativeX: 0, bodyRelativeY: 482, absoluteX: 0, absoluteY: 562, width: 1000, height: 64 } },
  { label: "Secondary large-card default columns", actual: secondaryLargeCard.cardGrid, expected: { defaultGridTemplateColumns: "repeat(4, 210px)", fallbackGridTemplateColumns: "repeat(3, 210px)" } },
  { label: "Secondary large-card column rule", actual: secondaryLargeCard.cardGrid.columnSelectionRule.includes("Do not reduce columns because itemCount is less than 4"), expected: true },
  { label: "Secondary large-card single-row column independence", actual: secondaryLargeCard.cardGrid.singleRowRule.includes("Single-row alignment must not change the column count"), expected: true },
  { label: "Secondary multi-nav state node", actual: template.source.stateNodes.secondaryMultiNav, expected: "375:4979" },
  { label: "Secondary multi-nav body", actual: secondaryMultiTabs.body, expected: { x: 0, y: 84, width: 1000, height: 526 } },
  { label: "Secondary multi-nav tabs container", actual: secondaryMultiTabs.tabsContainer, expected: { bodyRelativeX: 32, bodyRelativeY: 16, absoluteX: 32, absoluteY: 100, width: 390, height: 26, gap: 6 } },
  { label: "Secondary multi-nav tab instances", actual: secondaryMultiTabs.tabInstances, expected: { component: "Nav.SecondaryTab", count: 6, width: 60, height: 26, xPositions: [0, 66, 132, 198, 264, 330], activeIndex: 0 } },
  { label: "Secondary multi-nav content shell", actual: secondaryMultiSidebar.contentShell, expected: { bodyRelativeX: 32, bodyRelativeY: 62, absoluteX: 32, absoluteY: 146, width: 936, height: 480, gap: 20 } },
  { label: "Secondary multi-nav sidebar", actual: secondaryMultiSidebar.navigate, expected: { shellRelativeX: 0, shellRelativeY: 0, absoluteX: 32, absoluteY: 146, width: 96, height: 480, paddingRight: 16, paddingY: 8, listWidth: 80 } },
  { label: "Secondary multi-nav show card list", actual: secondaryMultiList.showCardList, expected: { shellRelativeX: 116, shellRelativeY: 0, absoluteX: 148, absoluteY: 130, width: 820, height: 480, rowGap: 8 } },
  { label: "Secondary multi-nav card grid", actual: secondaryMultiList.cardGrid, expected: { component: "Game.ShowCard", columns: 2, visibleDesignRows: 6, cardWidth: 406, cardHeight: 76, columnGap: 8, rowGap: 8, cardXPositions: [0, 414], rowYPositions: [0, 84, 168, 252, 336, 420], overflowBeyondShell: 16 } },
  { label: "Detail large breadcrumbs", actual: detailBreadcrumbs.largeCardExpanded.frame, expected: { bodyRelativeX: 32, bodyRelativeY: 16, absoluteX: 32, absoluteY: 100, width: 294, height: 26 } },
  { label: "Detail all-states breadcrumbs", actual: detailBreadcrumbs.allStates.frame, expected: { bodyRelativeX: 32, bodyRelativeY: 16, absoluteX: 32, absoluteY: 100, width: 294, height: 26 } },
  { label: "Detail breadcrumb placement text", actual: region("detail.breadcrumbs").layout?.breadcrumbs.includes("Body-relative x=32, y=16, w=294, h=26"), expected: true },
  { label: "Breadcrumb item hug sizing", actual: breadcrumbsComponent?.observedStructure?.itemSizing?.includes("hugs its label text width"), expected: true },
  { label: "Breadcrumb typography", actual: breadcrumbsComponent?.observedStructure?.itemSizing?.includes("12px font size with 18px line height"), expected: true },
  { label: "Breadcrumb template item sizing", actual: region("detail.breadcrumbs").layout?.itemSizing?.includes("width:auto"), expected: true },
  { label: "Detail large content shell", actual: detailShell.largeCardExpanded.detailContent, expected: { bodyRelativeX: 20, bodyRelativeY: 62, absoluteX: 20, absoluteY: 146, width: 960, height: 1204 } },
  { label: "Detail large content chrome", actual: detailShell.largeCardExpanded.detailContentChrome, expected: { backgroundToken: "var(--color-bg-black)", backgroundHex: "#000306", strokeColor: "rgba(255,255,255,0.10)", cornerRadius: 8, clipsContent: true, padding: 0, gap: 0 } },
  { label: "Detail large scroll", actual: detailShell.largeCardExpanded.scroll, expected: { bodyRelativeX: 980, bodyRelativeY: 60, absoluteX: 980, absoluteY: 144, width: 12, height: 446 } },
  { label: "Detail large section stack", actual: detailShell.largeCardExpanded.sectionStack, expected: { padding: 16, gap: 12, heroHeight: 120, heroPadding: 16, heroGap: 10, expandedSectionsY: 120, expandedSectionsHeight: 1084 } },
  { label: "Detail all-states content shell", actual: detailShell.allStates.detailContent, expected: { bodyRelativeX: 20, bodyRelativeY: 62, absoluteX: 20, absoluteY: 146, width: 960, height: 1022 } },
  { label: "Detail all-states content chrome", actual: detailShell.allStates.detailContentChrome, expected: { backgroundToken: "var(--color-bg-black)", backgroundHex: "#000306", strokeColor: "rgba(255,255,255,0.10)", cornerRadius: 8, clipsContent: true, padding: 0, gap: 0 } },
  { label: "Detail all-states scroll", actual: detailShell.allStates.scroll, expected: { bodyRelativeX: 980, bodyRelativeY: 60, absoluteX: 980, absoluteY: 144, width: 12, height: 995 } },
  { label: "Detail all-states section stack", actual: detailShell.allStates.sectionStack, expected: { padding: 16, gap: 12, heroHeight: 108, heroPadding: 16, heroGap: 10, detailSectionsY: 108, detailSectionsHeight: 914 } },
  { label: "Detail large hero card", actual: detailHero.largeCardExpanded.card, expected: { component: "Layout.DescribeCard", sectionRelativeX: 16, sectionRelativeY: 16, absoluteX: 36, absoluteY: 162, width: 928, height: 88 } },
  { label: "Detail all-states hero card", actual: detailHero.allStates.card, expected: { component: "Game.ShowCard", sectionRelativeX: 16, sectionRelativeY: 16, absoluteX: 36, absoluteY: 162, width: 928, height: 76 } },
  { label: "Detail large attribute section", actual: detailAttributes.largeCardExpanded.section, expected: { parentRelativeX: 16, parentRelativeY: 16, absoluteX: 36, absoluteY: 282, width: 928, height: 154 } },
  { label: "Detail all-states attribute section", actual: detailAttributes.allStates.section, expected: { parentRelativeX: 16, parentRelativeY: 16, absoluteX: 36, absoluteY: 270, width: 928, height: 84 } },
  { label: "Detail large related section", actual: detailRelated.largeCardExpanded.section, expected: { parentRelativeX: 16, parentRelativeY: 182, absoluteX: 36, absoluteY: 448, width: 928, height: 208 } },
  { label: "Detail large related row", actual: detailRelated.largeCardExpanded.relatedRow, expected: { x: 0, y: 62, width: 928, height: 76, columns: 2, cardWidth: 458, cardHeight: 76, columnGap: 12 } },
  { label: "Detail large related detail row", actual: detailRelated.largeCardExpanded.detailsRow, expected: { x: 0, y: 150, width: 928, height: 58, itemWidth: 214, itemHeight: 42, itemXPositions: [0, 238, 476, 714] } },
  { label: "Detail all-states related section", actual: detailRelated.allStates.section, expected: { parentRelativeX: 16, parentRelativeY: 112, absoluteX: 36, absoluteY: 366, width: 928, height: 138 } },
  { label: "Detail large structured card", actual: detailCard.largeCardExpanded, expected: { component: "Layout.DetailCard", parentRelativeX: 16, parentRelativeY: 402, absoluteX: 36, absoluteY: 668, width: 928, height: 328 } },
  { label: "Detail all-states structured card", actual: detailCard.allStates, expected: { component: "Layout.DetailCard", parentRelativeX: 16, parentRelativeY: 364, absoluteX: 36, absoluteY: 618, width: 928, height: 258 } },
  { label: "DetailCard title decoration", actual: detailCard.titleRow, expected: { componentInternal: true, height: 20, gap: 6, decoration: { visualWidth: 1.5, visualHeight: 14, colorToken: "var(--color-primary-base)" } } },
  { label: "Mapping DetailCard title decoration is chrome", actual: mapping.rules.some((rule) => rule.includes("Layout.DetailCard title decoration") && rule.includes("do not require or bind any datasource field")), expected: true },
  { label: "DetailCard title is required", actual: detailCardComponent?.props?.title?.required, expected: true },
  { label: "DetailCard component composition rule", actual: detailCardComponent?.observedStructure?.compositionRule?.includes("title plus at least one optional content block"), expected: true },
  { label: "DetailCard template module composition rule", actual: detailCard.moduleCompositionRule?.includes("title plus at least one optional content block"), expected: true },
  { label: "DetailCard mapping module rule", actual: mapping.rules.some((rule) => rule.includes("Each rendered module must bind title and at least one real optional block")), expected: true },
  { label: "Detail large extended section", actual: detailExtended.largeCardExpanded, expected: { parentRelativeX: 16, parentRelativeY: 742, absoluteX: 36, absoluteY: 1008, width: 928, height: 302 } },
  { label: "Detail all-states extended section", actual: detailExtended.allStates, expected: { parentRelativeX: 16, parentRelativeY: 634, absoluteX: 36, absoluteY: 888, width: 928, height: 232 } },
  { label: "Guide document region type", actual: guideDocument.templateType, expected: "document-guide-detail" },
  { label: "Guide document allows command items", actual: guideDocument.allowedComponents.includes("Nav.CommandMenuItem"), expected: true },
  { label: "CommandMenuItem component registered", actual: commandMenuItemComponent?.observedUse?.includes("wiki:guide.document-detail"), expected: true },
  { label: "Guide layout selection rule", actual: guideDocument.layoutSelectionRule.includes("GuideDetailWithNavAndInfo"), expected: true },
  { label: "Guide breadcrumb placement text", actual: guideDocument.layout.breadcrumbs.includes("Body-relative x=32, y=16, w=188, h=26") && guideDocument.layout.breadcrumbs.includes("absolute x=32, y=100"), expected: true },
  { label: "Guide with nav and info layout", actual: guideDocumentLayouts.withNavAndInfo, expected: { pageNodeId: "304:18296", breadcrumbs: { bodyRelativeX: 32, bodyRelativeY: 16, width: 188, height: 26 }, articleLayout: { bodyRelativeX: 32, bodyRelativeY: 62, width: 936, height: 607.9389, gap: 20 }, leftNav: { width: 96, height: 607.9389 }, articleContent: { layoutRelativeX: 116, width: 540, height: 607.9389, gap: 12 }, rightInfo: { layoutRelativeX: 676, width: 260, height: 204, titleHeight: 36, titleDivider: { x: 0, y: 36, width: 260, height: 1, strokeColor: "rgba(255,255,255,0.10)", strokeToken: "var(--color-stroke-area)" }, listY: 44, listHeight: 160, listItemHeight: 34, listGap: 8 } } },
  { label: "Guide with info layout", actual: guideDocumentLayouts.withInfo, expected: { pageNodeId: "306:4332", breadcrumbs: { bodyRelativeX: 32, bodyRelativeY: 16, width: 188, height: 26 }, articleLayout: { bodyRelativeX: 32, bodyRelativeY: 62, width: 936, height: 607.9389, gap: 20 }, articleContent: { layoutRelativeX: 0, width: 656, height: 607.9389, gap: 12 }, rightInfo: { layoutRelativeX: 676, width: 260, height: 204, titleHeight: 36, titleDivider: { x: 0, y: 36, width: 260, height: 1, strokeColor: "rgba(255,255,255,0.10)", strokeToken: "var(--color-stroke-area)" }, listY: 44, listHeight: 160, listItemHeight: 34, listGap: 8 } } },
  { label: "Guide with nav layout", actual: guideDocumentLayouts.withNav, expected: { pageNodeId: "306:4716", breadcrumbs: { bodyRelativeX: 32, bodyRelativeY: 16, width: 188, height: 26 }, articleLayout: { bodyRelativeX: 32, bodyRelativeY: 62, width: 936, height: 576, gap: 20 }, leftNav: { width: 96, height: 576 }, articleContent: { layoutRelativeX: 116, width: 820, height: 576, gap: 12 } } },
  { label: "Guide article internals", actual: guideDocumentLayouts.articleContentInternals, expected: { titleRow: { y: 0, height: 20, gap: 4 }, metaRow: { y: 32, height: 20, gap: 4 }, articleBody: { y: 64, gap: 8, mainImage: { sampleWidth: 402, sampleHeight: 226, maxHeight: 230, aspectRatioRule: "preserve-source-image-ratio" } } } },
  { label: "Guide article image mapping", actual: mapping.rules.some((rule) => rule.includes("guide.document-detail article images") && rule.includes("max rendered height to 230px") && rule.includes("Do not apply card imageRatio rules")), expected: true },
  { label: "Guide mapping rule", actual: mapping.rules.some((rule) => rule.includes("Use guide.document-detail") && rule.includes("GuideDetailWithNavAndInfo")), expected: true },
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
