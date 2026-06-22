import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const DEFAULT_SOURCE =
  "C:\\Users\\月球背面是星火巷\\Documents\\WXWork\\1688854293700063\\Cache\\File\\2026-06\\crimsondesert";
const DEFAULT_OUTPUT = path.join(repoRoot, "public", "data", "crimsondesert");

function parseArgs(argv) {
  const args = {
    source: process.env.CRIMSONDESERT_SOURCE || DEFAULT_SOURCE,
    output: process.env.CRIMSONDESERT_OUTPUT || DEFAULT_OUTPUT,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--source") args.source = argv[++index];
    else if (arg === "--output") args.output = argv[++index];
    else if (arg === "--help") {
      console.log("Usage: node scripts/adapt-crimsondesert.mjs --source <raw-dir> --output <standard-dir>");
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function copyDirectory(source, output, filter = () => true) {
  ensureDir(output);

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.name === ".DS_Store" || entry.name === "__MACOSX" || entry.name.startsWith("._")) continue;

    const sourcePath = path.join(source, entry.name);
    const outputPath = path.join(output, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, outputPath, filter);
    } else if (entry.isFile() && filter(sourcePath)) {
      fs.copyFileSync(sourcePath, outputPath);
    }
  }
}

function copyFiles(source, output, filter) {
  ensureDir(output);

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (!entry.isFile() || entry.name === ".DS_Store" || entry.name.startsWith("._")) continue;
    const sourcePath = path.join(source, entry.name);
    if (filter(sourcePath)) fs.copyFileSync(sourcePath, path.join(output, entry.name));
  }
}

function slugFromText(text) {
  return `cat-${encodeURIComponent(text).toLowerCase()}`;
}

function buildStandardPackage(points) {
  const meta = {
    $schema: "../../../skill-pack/datasource-schema/map.meta.schema.json",
    version: 1,
    game: {
      id: "crimsondesert",
      name: "红色沙漠",
      logo: "images/logo.png",
    },
    maps: [
      {
        id: "world",
        name: "世界地图",
        default: true,
        tile: {
          sourceType: "template",
          urlTemplate: "maps/world/{z}/{x}/{y}.png",
          tileSize: 256,
          imageType: "png",
          minZoom: 0,
          maxZoom: 8,
          maxNativeZoom: 6,
          tileOrigin: "top-left",
          indexOrder: "z-x-y",
        },
        coordinate: {
          origin: "top-left",
          axis: "x-right-y-down",
          width: 8192,
          height: 8192,
          projectZoom: 5,
        },
      },
    ],
    assets: {
      iconBase: "icons/",
      imageBase: "images/",
    },
    uiRules: {
      singleMapSelect: "disabled",
      detailFallback: "show-title-only",
      areaDisplay: "center-label",
    },
  };

  const categories = [];
  const markers = [];

  for (const category of points.categories ?? []) {
    const categoryId = slugFromText(category.title);
    const groups = [];

    for (const group of category.data ?? []) {
      const groupId = `group-${group.id}`;
      const icon = String(group.icon ?? "").replace(/^\/?icons\//, "");

      groups.push({
        id: groupId,
        name: group.title,
        icon,
        count: Number(group.num ?? 0),
      });

      for (const point of group.data ?? []) {
        markers.push({
          id: `point-${point.id}`,
          mapId: "world",
          categoryId,
          groupId,
          title: point.title,
          position: {
            x: Number(point.x),
            y: Number(point.y),
          },
          detail: {},
          raw: {
            sourceId: point.id,
            sourceGroupId: group.id,
          },
        });
      }
    }

    categories.push({
      id: categoryId,
      name: category.title,
      groups,
    });
  }

  const areas = (points.areas ?? []).map((area, index) => ({
    id: `area-${index + 1}`,
    mapId: "world",
    name: area.title,
    position: {
      x: Number(area.x),
      y: Number(area.y),
    },
    type: "center-label",
  }));

  return {
    meta,
    normalized: {
      $schema: "../../../skill-pack/datasource-schema/map.normalized.schema.json",
      version: 1,
      categories,
      markers,
      areas,
    },
  };
}

function main() {
  const { source, output } = parseArgs(process.argv.slice(2));
  const pointsPath = path.join(source, "points.json");
  const mapsPath = path.join(source, "maps");
  const iconsPath = path.join(source, "tools", "icons");
  const logoPath = path.join(source, "tools", "maplogo", "hssm.png");

  for (const requiredPath of [pointsPath, mapsPath, iconsPath, logoPath]) {
    if (!fs.existsSync(requiredPath)) throw new Error(`Missing required source path: ${requiredPath}`);
  }

  fs.rmSync(output, { recursive: true, force: true });
  ensureDir(output);
  ensureDir(path.join(output, "maps"));
  ensureDir(path.join(output, "icons"));
  ensureDir(path.join(output, "images"));

  const points = readJson(pointsPath);
  const { meta, normalized } = buildStandardPackage(points);

  copyDirectory(mapsPath, path.join(output, "maps", "world"), (file) => file.toLowerCase().endsWith(".png"));
  copyFiles(iconsPath, path.join(output, "icons"), (file) => file.toLowerCase().endsWith(".png"));
  fs.copyFileSync(logoPath, path.join(output, "images", "logo.png"));

  writeJson(path.join(output, "map.meta.json"), meta);
  writeJson(path.join(output, "map.normalized.json"), normalized);

  const tileCount = fs
    .readdirSync(path.join(output, "maps", "world"), { recursive: true })
    .filter((item) => String(item).toLowerCase().endsWith(".png")).length;
  const iconCount = fs.readdirSync(path.join(output, "icons")).filter((item) => item.endsWith(".png")).length;

  console.log(
    JSON.stringify(
      {
        output,
        categories: normalized.categories.length,
        groups: normalized.categories.reduce((count, category) => count + category.groups.length, 0),
        markers: normalized.markers.length,
        areas: normalized.areas.length,
        tiles: tileCount,
        icons: iconCount,
      },
      null,
      2,
    ),
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
