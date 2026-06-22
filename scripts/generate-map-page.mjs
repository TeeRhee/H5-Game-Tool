import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validatePackage } from "./validate-map-package.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const DEFAULT_PACKAGE = path.join(repoRoot, "public", "data", "crimsondesert");

function parseArgs(argv) {
  const args = {
    packageDir: process.env.MAP_PACKAGE || DEFAULT_PACKAGE,
    output: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--package") args.packageDir = argv[++index];
    else if (arg === "--output") args.output = argv[++index];
    else if (arg === "--help") {
      console.log("Usage: node scripts/generate-map-page.mjs --package <standard-map-package-dir> --output <page-json>");
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!args.output) args.output = path.join(args.packageDir, "page.h5.json");
  return args;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function loadSkillContract(relativePath) {
  return readJson(path.join(repoRoot, "skill-pack", relativePath));
}

function assertAllowed(template, componentId, regionId, errors) {
  const region = template.regions.find((item) => item.id === regionId);
  if (!region) {
    errors.push(`Unknown template region: ${regionId}`);
    return;
  }
  if (!region.allowedComponents.includes(componentId)) {
    errors.push(`Component ${componentId} is not allowed in region ${regionId}`);
  }
}

export function generateMapPage(packageDir, output) {
  const validation = validatePackage(packageDir);
  if (validation.errors.length) {
    throw new Error(validation.errors.map((error) => `ERROR ${error}`).join("\n"));
  }

  const template = loadSkillContract("templates/map.json");
  const registry = loadSkillContract("components/map.json");
  const componentIds = new Set(registry.components.map((component) => component.id));
  const meta = validation.meta;
  const data = validation.data;
  const defaultMap = meta.maps.find((item) => item.default) ?? meta.maps[0];
  const regions = [
    {
      id: "left-panel.header",
      components: [
        {
          id: "game-logo",
          componentId: "Layout.PictureTitle",
          props: {
            logoSrc: meta.game.logo ?? "",
            title: meta.game.name,
          },
          dataBinding: {
            logoSrc: "map.meta.json > game.logo",
            title: "map.meta.json > game.name",
          },
        },
      ],
    },
    {
      id: "left-panel.controls",
      components: [
        {
          id: "map-select",
          componentId: "Form.Select",
          props: {
            options: meta.maps.map((map) => ({ id: map.id, label: map.name })),
            value: defaultMap.id,
            disabled: meta.maps.length === 1 && meta.uiRules.singleMapSelect === "disabled",
          },
          dataBinding: {
            options: "map.meta.json > maps",
            value: "renderer selectedMapId",
          },
        },
        {
          id: "map-search",
          componentId: "Form.SearchBar",
          props: {
            value: "",
            placeholder: "搜索点位或筛选项",
          },
          dataBinding: {
            value: "renderer query state",
          },
        },
        {
          id: "filter-tree",
          componentId: "Base.DropdownItem",
          props: {
            categoryCount: data.categories.length,
            groupCount: validation.groups.length,
          },
          dataBinding: {
            categories: "map.normalized.json > categories",
            markerCounts: "map.normalized.json > categories[].groups[].count",
          },
        },
        {
          id: "filter-scrollbar",
          componentId: "Layout.Scroll",
          props: {},
          dataBinding: {
            scrollTop: "renderer filter list scrollTop",
            scrollHeight: "renderer filter list scrollHeight",
            viewportHeight: "renderer filter list viewportHeight",
          },
        },
      ],
    },
    {
      id: "map.canvas",
      components: [
        {
          id: "marker-layer",
          componentId: "Feedback.Tooltip",
          props: {
            markerCount: data.markers.length,
            visualSize: "constant-during-zoom",
          },
          dataBinding: {
            markers: "map.normalized.json > markers",
            icons: "map.normalized.json > categories[].groups[].icon",
            coordinates: "map.normalized.json > markers[].position",
          },
        },
        {
          id: "zoom-in",
          componentId: "Base.Button",
          props: {
            iconOnly: true,
            action: "zoomIn",
          },
        },
        {
          id: "zoom-out",
          componentId: "Base.Button",
          props: {
            iconOnly: true,
            action: "zoomOut",
          },
        },
      ],
    },
    {
      id: "map.detail",
      components: [
        {
          id: "marker-detail",
          componentId: "Layout.DescribeCard",
          props: {
            open: false,
          },
          dataBinding: {
            title: "selected marker > title",
            description: "selected marker > detail.description | detail.tips | detail.reward",
            imageSrc: "selected marker > detail.image",
          },
        },
      ],
    },
    {
      id: "bottom-action",
      components: [
        {
          id: "clear-filters",
          componentId: "Base.Button",
          props: {
            action: "resetFilters",
            label: "取消所有筛选",
          },
        },
      ],
    },
  ];

  const errors = [];
  for (const region of regions) {
    for (const component of region.components) {
      if (!componentIds.has(component.componentId)) errors.push(`Unknown component: ${component.componentId}`);
      assertAllowed(template, component.componentId, region.id, errors);
    }
  }
  if (errors.length) throw new Error(errors.map((error) => `ERROR ${error}`).join("\n"));

  const page = {
    version: 1,
    toolType: "map",
    templateId: template.id,
    pageMeta: {
      title: `${meta.game.name}地图工具`,
      description: `${data.markers.length} markers, ${validation.groups.length} groups, ${data.categories.length} categories`,
      sourceStatus: "bound-to-datasource",
    },
    regions,
    assets: [
      {
        id: "game-logo",
        type: "image",
        source: meta.game.logo ?? "",
      },
      {
        id: "map-package",
        type: "standard-map-package",
        source: ".",
      },
      {
        id: "tile-template",
        type: "tile-template",
        source: defaultMap.tile.urlTemplate ?? defaultMap.tile.manifest ?? "TODO_FROM_DATASOURCE",
      },
      {
        id: "icons",
        type: "asset-base",
        source: meta.assets.iconBase,
      },
      {
        id: "detail-images",
        type: "asset-base",
        source: meta.assets.imageBase,
      },
    ],
    warnings: validation.warnings,
  };

  writeJson(output, page);
  return page;
}

function main() {
  const { packageDir, output } = parseArgs(process.argv.slice(2));
  const page = generateMapPage(packageDir, output);
  console.log(
    JSON.stringify(
      {
        output,
        title: page.pageMeta.title,
        regions: page.regions.length,
        assets: page.assets.length,
        status: "generated",
      },
      null,
      2,
    ),
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
