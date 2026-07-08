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
    file: "src/styles.css",
    includes: [
      "@media (max-width: 599px)",
      ".gt-wiki-navigate--horizontal",
      ".gt-wiki-describe-card--lg",
      ".gt-modal-layer",
    ],
    excludes: [".wiki-mobile-header", ".wiki-mobile-primary-menu"],
  },
  {
    file: "component-packages/h5-game-tool-components/src/style.css",
    includes: [
      "@media (max-width: 599px)",
      ".gt-wiki-navigate--horizontal",
      ".gt-wiki-describe-card--lg",
      ".gt-modal-layer",
    ],
    excludes: [".wiki-mobile-header", ".wiki-mobile-primary-menu"],
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
