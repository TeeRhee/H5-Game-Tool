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
      "scrollbar-width: none",
      ".gt-scroll",
      ".gt-wiki-category-card--hover",
      ".gt-modal__close:hover",
      ".gt-tool-tip__bubble--visible",
      ".gt-wiki-navigate--horizontal",
      ".gt-wiki-navigate-item--active:hover",
      ".gt-wiki-describe-card--lg",
      ".gt-modal-layer",
    ],
    excludes: [".wiki-mobile-header", ".wiki-mobile-primary-menu", "width: 375px", "width: 351px", "width: 319px"],
  },
  {
    file: "component-packages/h5-game-tool-components/src/style.css",
    includes: [
      "@media (max-width: 599px)",
      "width: calc(100% - 24px)",
      "scrollbar-width: none",
      ".gt-scroll",
      ".gt-wiki-category-card--hover",
      ".gt-modal__close:hover",
      ".gt-tool-tip__bubble--visible",
      ".gt-wiki-navigate--horizontal",
      ".gt-wiki-navigate-item--active:hover",
      ".gt-wiki-describe-card--lg",
      ".gt-modal-layer",
    ],
    excludes: [".wiki-mobile-header", ".wiki-mobile-primary-menu", "width: 375px", "width: 351px", "width: 319px"],
  },
  {
    file: "skill-pack/wiki/DESIGN.md",
    includes: [
      "the Wiki page root/frame must fill the available host container or browser viewport width",
      "production content width is `calc(100% - 24px)`",
      "mobile Wiki pages do not show scrollbar chrome",
      "Mobile pages also do not render hover visual states",
      "internal mobile action bar at `h=68`",
      "Both icon buttons must be at least `44 x 44`",
      "panel opens below the internal action bar at `top=68`",
      "Menu rows are touch rows with `min-height=56`",
    ],
  },
  {
    file: "skill-pack/wiki/templates/wiki.json",
    includes: [
      "mobileResponsiveWidth",
      "mobileNoScrollbars",
      "mobileNoHover",
      "mobileInternalActionBar",
      "mobilePrimaryNavMenuGeometry",
      "left search icon button 44x44",
      "top=68 below the internal action bar",
      "min-height 56px touch row",
      "fill the available host container or browser viewport width",
      "do not hardcode production page, body, content, list, or card widths to 375/351/335/319px",
    ],
  },
  {
    file: "skill-pack/wiki/mapping/wiki.json",
    includes: [
      "dark Wiki shell must render its own 68px mobile action bar",
      "left 44x44 search icon button",
      "right 44x44 primary-menu icon button",
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
