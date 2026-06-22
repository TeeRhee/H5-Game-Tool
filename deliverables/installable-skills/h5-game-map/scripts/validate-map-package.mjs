import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const DEFAULT_PACKAGE = path.join(repoRoot, "public", "data", "crimsondesert");

function parseArgs(argv) {
  const args = {
    packageDir: process.env.MAP_PACKAGE || DEFAULT_PACKAGE,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--package") args.packageDir = argv[++index];
    else if (arg === "--help") {
      console.log("Usage: node scripts/validate-map-package.mjs --package <standard-map-package-dir>");
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function fileExists(packageDir, value) {
  if (!value || /^(https?:)?\/\//.test(value)) return true;
  return fs.existsSync(path.join(packageDir, value));
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function getById(items) {
  return new Map(items.map((item) => [item.id, item]));
}

function validateTileTemplate(packageDir, map, errors) {
  const { tile } = map;
  if (tile.sourceType === "template") {
    assert(Boolean(tile.urlTemplate), `Map ${map.id} tile.urlTemplate is required`, errors);
    assert(tile.urlTemplate.includes("{z}"), `Map ${map.id} tile.urlTemplate must include {z}`, errors);
    assert(tile.urlTemplate.includes("{x}"), `Map ${map.id} tile.urlTemplate must include {x}`, errors);
    assert(tile.urlTemplate.includes("{y}"), `Map ${map.id} tile.urlTemplate must include {y}`, errors);

    const sample = tile.urlTemplate
      .replaceAll("{z}", String(tile.minZoom))
      .replaceAll("{x}", "0")
      .replaceAll("{y}", "0");
    assert(fileExists(packageDir, sample), `Map ${map.id} sample tile is missing: ${sample}`, errors);
  }

  if (tile.sourceType === "manifest") {
    assert(Boolean(tile.manifest), `Map ${map.id} tile.manifest is required`, errors);
    assert(fileExists(packageDir, tile.manifest), `Map ${map.id} tile manifest is missing: ${tile.manifest}`, errors);
  }

  assert(tile.minZoom <= tile.maxZoom, `Map ${map.id} minZoom must be <= maxZoom`, errors);
  assert(tile.maxNativeZoom <= tile.maxZoom, `Map ${map.id} maxNativeZoom must be <= maxZoom`, errors);
  assert(map.coordinate.width > 0 && map.coordinate.height > 0, `Map ${map.id} coordinate dimensions must be positive`, errors);
}

export function validatePackage(packageDir) {
  const errors = [];
  const warnings = [];
  const metaPath = path.join(packageDir, "map.meta.json");
  const normalizedPath = path.join(packageDir, "map.normalized.json");

  assert(fs.existsSync(metaPath), `Missing map.meta.json in ${packageDir}`, errors);
  assert(fs.existsSync(normalizedPath), `Missing map.normalized.json in ${packageDir}`, errors);
  if (errors.length) return { errors, warnings };

  const meta = readJson(metaPath);
  const data = readJson(normalizedPath);
  const mapsById = getById(meta.maps ?? []);
  const categoriesById = getById(data.categories ?? []);
  const groups = (data.categories ?? []).flatMap((category) =>
    (category.groups ?? []).map((group) => ({ ...group, categoryId: category.id })),
  );
  const groupsById = getById(groups);

  assert(meta.version === 1, "map.meta.json version must be 1", errors);
  assert(data.version === 1, "map.normalized.json version must be 1", errors);
  assert((meta.maps ?? []).length > 0, "map.meta.json must include at least one map", errors);
  assert((data.categories ?? []).length > 0, "map.normalized.json must include categories", errors);

  for (const map of meta.maps ?? []) validateTileTemplate(packageDir, map, errors);

  if (meta.game?.logo) {
    assert(fileExists(packageDir, meta.game.logo), `Game logo is missing: ${meta.game.logo}`, errors);
  }

  for (const group of groups) {
    if (group.icon) {
      const iconPath = path.join(meta.assets?.iconBase ?? "", group.icon).replaceAll("\\", "/");
      assert(fileExists(packageDir, iconPath), `Group icon is missing: ${iconPath}`, errors);
    }

    const actualCount = (data.markers ?? []).filter((marker) => marker.groupId === group.id).length;
    assert(actualCount === group.count, `Group ${group.id} count mismatch: declared ${group.count}, actual ${actualCount}`, errors);
  }

  for (const marker of data.markers ?? []) {
    assert(mapsById.has(marker.mapId), `Marker ${marker.id} references unknown mapId ${marker.mapId}`, errors);
    assert(categoriesById.has(marker.categoryId), `Marker ${marker.id} references unknown categoryId ${marker.categoryId}`, errors);
    assert(groupsById.has(marker.groupId), `Marker ${marker.id} references unknown groupId ${marker.groupId}`, errors);
    assert(Number.isFinite(marker.position?.x), `Marker ${marker.id} position.x must be a number`, errors);
    assert(Number.isFinite(marker.position?.y), `Marker ${marker.id} position.y must be a number`, errors);

    if (marker.detail?.image) {
      const imagePath = path.join(meta.assets?.imageBase ?? "", marker.detail.image).replaceAll("\\", "/");
      assert(fileExists(packageDir, imagePath), `Marker ${marker.id} detail image is missing: ${imagePath}`, errors);
    }
  }

  for (const area of data.areas ?? []) {
    assert(mapsById.has(area.mapId), `Area ${area.id} references unknown mapId ${area.mapId}`, errors);
    if (area.type === "center-label") {
      assert(area.position, `Area ${area.id} center-label requires position`, errors);
    }
    if (area.type === "polygon") {
      assert(Array.isArray(area.polygon) && area.polygon.length >= 3, `Area ${area.id} polygon requires at least 3 points`, errors);
    }
  }

  if ((meta.maps ?? []).length === 1 && meta.uiRules?.singleMapSelect === "disabled") {
    warnings.push("Single map package: map select should be disabled by renderer.");
  }

  return { errors, warnings, meta, data, groups };
}

function main() {
  const { packageDir } = parseArgs(process.argv.slice(2));
  const result = validatePackage(packageDir);

  if (result.warnings?.length) {
    for (const warning of result.warnings) console.warn(`WARN ${warning}`);
  }

  if (result.errors.length) {
    for (const error of result.errors) console.error(`ERROR ${error}`);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        packageDir,
        game: result.meta.game.name,
        maps: result.meta.maps.length,
        categories: result.data.categories.length,
        groups: result.groups.length,
        markers: result.data.markers.length,
        areas: result.data.areas?.length ?? 0,
        status: "valid",
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
