import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const absentFiles = ["src/preview/MobileWikiChrome.tsx"];

const checks = [
  {
    file: "src/components/game-tool/Navigate.tsx",
    includes: [
      'export type NavigateOrientation = "vertical" | "horizontal";',
      "orientation?: NavigateOrientation;",
      '`gt-wiki-navigate--${orientation}`',
    ],
  },
  {
    file: "component-packages/h5-game-tool-components/src/components/game-tool/Navigate.tsx",
    includes: [
      'export type NavigateOrientation = "vertical" | "horizontal";',
      "orientation?: NavigateOrientation;",
      '`gt-wiki-navigate--${orientation}`',
    ],
  },
  {
    file: "skill-pack/components.json",
    includes: [
      '"id": "Nav.Navigate"',
      '"figmaName": "Nav / Navigate / Default"',
      "Orientation=Vertical",
      "Orientation=Horizontal",
      '"orientation"',
      '"vertical"',
      '"horizontal"',
    ],
  },
  {
    file: "src/styles.css",
    includes: [
      "@media (max-width: 599px)",
      "width: calc(100% - 24px)",
      "min-height: 100vh",
      "height: auto",
      "scrollbar-width: none",
      ".gt-scroll",
      ".gt-wiki-category-card--hover",
      ".gt-modal__close:hover",
      ".gt-tool-tip__bubble--visible",
      "padding: 8px 12px",
      ".gt-wiki-navigate--horizontal",
      ".gt-wiki-navigate-item--active:hover",
      ".gt-wiki-describe-card--lg",
      ".gt-modal-layer",
    ],
    excludes: [".wiki-mobile-header", ".wiki-mobile-primary-menu", "padding: 8px 10px", "width: 375px", "width: 351px", "width: 319px", "height: max(812px, 100vh)"],
  },
  {
    file: "component-packages/h5-game-tool-components/src/style.css",
    includes: [
      "@media (max-width: 599px)",
      "width: calc(100% - 24px)",
      "min-height: 100vh",
      "height: auto",
      "scrollbar-width: none",
      ".gt-scroll",
      ".gt-wiki-category-card--hover",
      ".gt-modal__close:hover",
      ".gt-tool-tip__bubble--visible",
      "padding: 8px 12px",
      ".gt-wiki-navigate--horizontal",
      ".gt-wiki-navigate-item--active:hover",
      ".gt-wiki-describe-card--lg",
      ".gt-modal-layer",
    ],
    excludes: [".wiki-mobile-header", ".wiki-mobile-primary-menu", "padding: 8px 10px", "width: 375px", "width: 351px", "width: 319px", "height: max(812px, 100vh)"],
  },
  {
    file: "skill-pack/wiki/DESIGN.md",
    includes: [
      "the Wiki page root/frame must fill the available host container or browser viewport width",
      "production content width is `calc(100% - 24px)`",
      "mobile Wiki pages do not show scrollbar chrome",
      "must not lock the mobile page root/frame to the 812px Figma sample height",
      "Mobile pages also do not render hover visual states",
      "Mobile home keeps the top image frame inside the content column",
      "For non-home Wiki pages below `600px`, do not render the global top/bottom background image pseudo-element",
      "with `12px` vertical row gap and a `1px` border using `var(--color-stroke-area)`",
      "Node `590:11004` shows the row as reference `w=351, h=36`, horizontal gap `6`, no wrapping",
      "padding `8px 12px`",
      "a `1px` border using `var(--color-stroke-area)`",
      "active tabs use `var(--color-primary-base)` for text only",
      "not for the border",
      "preserve the `imageRatio` / `imageFit` already selected for the same current PC page/list",
      "If the PC list uses `imageRatio=\"1:1\"`, the mobile image must stay square",
      "internal mobile action bar at `h=68`",
      "visible action row starts `12px` from the page top",
      "Figma node `694:3658`",
      "embedded dark Wiki shell content starts below the internal action bar at `y=68`",
      "do not add another page-level top inset before the first secondary tab row",
      "active first-level page name",
      "On the mobile home page, do not render a left title",
      "Do not render a left search icon button",
      "panel opens below the internal action bar at `top=68`",
      "Menu rows are touch rows with `min-height=56`",
    ],
  },
  {
    file: "skill-pack/wiki/templates/wiki.json",
    includes: [
      "mobileResponsiveWidth",
      "mobileNoScrollbars",
      "mobileScrollHeightPolicy",
      "mobileNoHover",
      "mobileHomeBannerImage",
      "mobileNoGlobalBackgroundImage",
      "mobileInternalActionBar",
      "mobilePrimaryNavMenuGeometry",
      "mobilePreserveImageRatio",
      "Mobile card layouts must preserve the imageRatio/imageFit selected for the same current PC page/list",
      "each Game.CategoryCard is width:100% with reference h=114, 12px row gap, and a 1px border using var(--color-stroke-area)",
      "590:11004",
      "padding 8px 12px",
      "1px border using var(--color-stroke-area)",
      "active tabs use var(--color-primary-base) for text only",
      "not for the border",
      "node 694:3658",
      "non-home pages show the active first-level page name on the left",
      "the mobile home page renders no left title",
      "right-aligned 36x36 primary-menu icon button",
      "no left search icon button",
      "Content in this embedded shell starts below the action bar at y=68",
      "must not add another top inset before that row",
      "top=68 below the internal action bar",
      "min-height 56px touch row",
      "fill the available host container or browser viewport width",
      "use min-height:100vh plus height:auto instead of a fixed 812px-height shell",
      "do not hardcode production page, body, content, list, or card widths to 375/351/335/319px",
      "mobile-specific summary/banner image asset",
      "disable the wiki-global-top-bg artwork on mobile only",
    ],
  },
  {
    file: "skill-pack/wiki/mapping/wiki.json",
    includes: [
      "dark Wiki shell must render its own 68px mobile action bar",
      "must not lock page height to the 812px Figma sample",
      "mobile-specific summary/banner image asset",
      "must not show wiki-global-top-bg on mobile",
      "production list/cards fill the actual mobile content column and keep a 1px border using var(--color-stroke-area)",
      "Node 590:11004 defines the tab row as reference w=351, h=36, gap=6",
      "padding 8px 12px",
      "1px border using var(--color-stroke-area)",
      "Active tabs use var(--color-primary-base) for text only",
      "not for the border",
      "preserve the imageRatio/imageFit already selected for the same current PC page/list",
      "PC 1:1 card set remains 1:1 on mobile",
      "Figma node 694:3658",
      "active first-level page name",
      "render no left title on the mobile home page",
      "right-aligned 36x36 primary-menu icon button",
      "do not render a left search icon button",
      "Embedded dark-shell content starts below the action bar at y=68",
      "must not add another page-level top inset before that row",
      "min-height 56px touch row",
    ],
  },
  {
    file: "src/preview/WikiHomeTemplatePreview.tsx",
    includes: ["wiki-home-template-mobile"],
    excludes: ["MobileWikiHeader", "wiki-mobile-header", "wiki-mobile-primary-menu"],
  },
  {
    file: "src/preview/WikiDocumentTemplatePreview.tsx",
    includes: ["wiki-document-template-mobile"],
    excludes: ["MobileWikiHeader", "wiki-mobile-header", "wiki-mobile-primary-menu"],
  },
];

const failures = [];

for (const file of absentFiles) {
  if (fs.existsSync(path.join(root, file))) {
    failures.push(`${file} should not exist`);
  }
}

for (const check of checks) {
  const absolutePath = path.join(root, check.file);
  const content = fs.readFileSync(absolutePath, "utf8");

  for (const expected of check.includes) {
    if (!content.includes(expected)) {
      failures.push(`${check.file} missing: ${expected}`);
    }
  }

  for (const unexpected of check.excludes ?? []) {
    if (content.includes(unexpected)) {
      failures.push(`${check.file} contains temporary preview chrome: ${unexpected}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Wiki mobile validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Wiki mobile validation passed.");
