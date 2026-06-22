import fs from "node:fs";
import path from "node:path";
import { validatePackage } from "./validate-map-package.mjs";

function parseArgs(argv) {
  const args = {
    packageDir: path.join(process.cwd(), "public", "data", "crimsondesert"),
    outputFile: "",
    pretty: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--package") args.packageDir = argv[++index];
    else if (arg === "--output") args.outputFile = argv[++index];
    else if (arg === "--compact") args.pretty = false;
    else if (arg === "--help") {
      console.log("Usage: node scripts/generate-map-output.mjs --package <standard-map-package-dir> [--output <file>]");
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function uniqueBy(items, getKey) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = getKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function buildOutput({ meta, data, warnings }) {
  const defaultMap = meta.maps.find((item) => item.default) ?? meta.maps[0];
  const singleMap = meta.maps.length === 1;
  const selectHidden = singleMap && meta.uiRules.singleMapSelect === "hidden";

  const controls = [];
  if (!selectHidden) {
    controls.push({
      id: "map-select",
      componentId: "Form.Select",
      props: {
        options: meta.maps.map((map) => ({ id: map.id, label: map.name })),
        value: defaultMap.id,
        disabled: singleMap && meta.uiRules.singleMapSelect === "disabled",
      },
      dataBinding: {
        source: "map.meta.json > maps",
      },
    });
  }

  controls.push(
    {
      id: "map-search",
      componentId: "Form.SearchBar",
      props: {
        value: "",
        placeholder: "Search markers or filters",
      },
      dataBinding: {
        source: "renderer state > query",
      },
    },
    {
      id: "filter-tree",
      componentId: "Base.DropdownItem",
      props: {
        childComponent: "Form.Checkbox",
        countVisible: true,
      },
      dataBinding: {
        source: "map.normalized.json > categories[].groups[]",
        state: "renderer state > visibleGroupIds",
      },
    },
    {
      id: "filter-scroll",
      componentId: "Layout.Scroll",
      props: {
        visible: true,
      },
      dataBinding: {
        source: "renderer state > filterScroll",
      },
    },
  );

  const assets = [];
  if (meta.game.logo) {
    assets.push({
      id: "game-logo",
      type: "image",
      source: meta.game.logo,
    });
  }

  for (const map of meta.maps) {
    if (map.tile.sourceType === "template") {
      assets.push({
        id: `tile-${map.id}`,
        type: "tile-template",
        source: map.tile.urlTemplate,
      });
    } else {
      assets.push({
        id: `tile-${map.id}`,
        type: "tile-manifest",
        source: map.tile.manifest,
      });
    }
  }

  for (const category of data.categories) {
    for (const group of category.groups) {
      if (!group.icon) continue;
      assets.push({
        id: `icon-${group.id}`,
        type: "icon",
        source: `${meta.assets.iconBase}${group.icon}`,
      });
    }
  }

  for (const marker of data.markers) {
    if (!marker.detail?.image) continue;
    assets.push({
      id: `detail-image-${marker.id}`,
      type: "image",
      source: `${meta.assets.imageBase}${marker.detail.image}`,
    });
  }

  const outputWarnings = [...warnings];
  if (singleMap && meta.uiRules.singleMapSelect === "disabled") {
    outputWarnings.push("Single map package: Form.Select disabled by uiRules.singleMapSelect.");
  }
  if (singleMap && meta.uiRules.singleMapSelect === "hidden") {
    outputWarnings.push("Single map package: Form.Select omitted by uiRules.singleMapSelect.");
  }

  return {
    version: 1,
    toolType: "map",
    templateId: "map",
    pageMeta: {
      title: `${meta.game.name} Map Tool`,
      description: `${meta.game.name} standardized map H5 page configuration.`,
      sourceStatus: "bound-to-datasource",
    },
    regions: [
      {
        id: "left-panel.header",
        components: [
          {
            id: "map-logo",
            componentId: "Layout.PictureTitle",
            props: {
              logoSrc: meta.game.logo ?? "",
              title: meta.game.name,
            },
            dataBinding: {
              source: "map.meta.json > game",
            },
          },
        ],
      },
      {
        id: "left-panel.controls",
        components: controls,
      },
      {
        id: "map.canvas",
        components: [
          {
            id: "marker-layer",
            componentId: "Feedback.Tooltip",
            props: {
              visible: true,
              content: "TODO_FROM_DATASOURCE",
            },
            dataBinding: {
              source: "map.normalized.json > markers",
              position: "markers[].position",
              icon: "categories[].groups[].icon resolved through assets.iconBase",
            },
          },
          {
            id: "zoom-in",
            componentId: "Base.Button",
            props: {
              variant: "neutral",
              appearance: "filled",
              size: "small",
              iconOnly: true,
              action: "zoomIn",
            },
          },
          {
            id: "zoom-out",
            componentId: "Base.Button",
            props: {
              variant: "neutral",
              appearance: "filled",
              size: "small",
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
              title: "TODO_FROM_DATASOURCE",
            },
            dataBinding: {
              source: "renderer state > selectedMarker",
              fields: "markers[].title, markers[].detail.description, markers[].detail.image, markers[].detail.tips, markers[].detail.reward",
              fallback: meta.uiRules.detailFallback,
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
              variant: "primary",
              appearance: "filled",
              size: "small",
              action: "resetFilters",
            },
            dataBinding: {
              source: "renderer state > query and visibleGroupIds",
            },
          },
        ],
      },
    ],
    assets: uniqueBy(assets, (asset) => `${asset.type}:${asset.source}`),
    warnings: uniqueBy(outputWarnings.map((message) => ({ message })), (item) => item.message).map((item) => item.message),
  };
}

function validateGeneratedOutput(output) {
  const errors = [];
  const requiredTopLevel = ["version", "toolType", "templateId", "pageMeta", "regions", "assets", "warnings"];
  for (const key of requiredTopLevel) {
    if (!(key in output)) errors.push(`Generated output missing ${key}`);
  }

  if (output.version !== 1) errors.push("Generated output version must be 1");
  if (output.toolType !== "map") errors.push("Generated output toolType must be map");
  if (!Array.isArray(output.regions)) errors.push("Generated output regions must be an array");
  if (!Array.isArray(output.assets)) errors.push("Generated output assets must be an array");
  if (!Array.isArray(output.warnings)) errors.push("Generated output warnings must be an array");

  const regionIds = new Set(["left-panel.header", "left-panel.controls", "map.canvas", "map.detail", "bottom-action"]);
  for (const region of output.regions ?? []) {
    if (!regionIds.has(region.id)) errors.push(`Generated output includes unknown region ${region.id}`);
    if (!Array.isArray(region.components)) errors.push(`Generated output region ${region.id} components must be an array`);
    for (const component of region.components ?? []) {
      if (!component.id || !component.componentId || !("props" in component)) {
        errors.push(`Generated output has invalid component in region ${region.id}`);
      }
    }
  }

  return errors;
}

function main() {
  const { packageDir, outputFile, pretty } = parseArgs(process.argv.slice(2));
  const validation = validatePackage(packageDir);

  if (validation.errors.length) {
    for (const error of validation.errors) console.error(`ERROR ${error}`);
    process.exit(1);
  }

  const output = buildOutput(validation);
  const outputErrors = validateGeneratedOutput(output);
  if (outputErrors.length) {
    for (const error of outputErrors) console.error(`ERROR ${error}`);
    process.exit(1);
  }

  const text = JSON.stringify(output, null, pretty ? 2 : 0);
  if (outputFile) {
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, `${text}\n`, "utf8");
  } else {
    console.log(text);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
