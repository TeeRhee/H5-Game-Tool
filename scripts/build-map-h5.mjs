import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { generateMapPage } from "./generate-map-page.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const DEFAULT_PACKAGE = path.join(repoRoot, "public", "data", "crimsondesert");

function parseArgs(argv) {
  const args = {
    adapter: "",
    source: "",
    packageDir: process.env.MAP_PACKAGE || DEFAULT_PACKAGE,
    page: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--adapter") args.adapter = argv[++index];
    else if (arg === "--source") args.source = argv[++index];
    else if (arg === "--package") args.packageDir = argv[++index];
    else if (arg === "--page") args.page = argv[++index];
    else if (arg === "--help") {
      console.log(
        "Usage: node scripts/build-map-h5.mjs [--adapter <adapter.mjs> --source <raw-dir>] --package <standard-map-package-dir> [--page <page-json>]",
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!args.page) args.page = path.join(args.packageDir, "page.h5.json");
  return args;
}

function runAdapter(adapter, source, packageDir) {
  if (!adapter) return;
  if (!source) throw new Error("--source is required when --adapter is provided");

  const adapterPath = path.isAbsolute(adapter) ? adapter : path.join(repoRoot, adapter);
  const result = spawnSync(process.execPath, [adapterPath, "--source", source, "--output", packageDir], {
    cwd: repoRoot,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Adapter failed with exit code ${result.status ?? "unknown"}`);
  }
}

function main() {
  const { adapter, source, packageDir, page } = parseArgs(process.argv.slice(2));
  runAdapter(adapter, source, packageDir);
  const generated = generateMapPage(packageDir, page);

  const publicRelativePackage = path.relative(path.join(repoRoot, "public"), packageDir).replaceAll("\\", "/");

  console.log(
    JSON.stringify(
      {
        packageDir,
        page,
        title: generated.pageMeta.title,
        status: "ready-for-renderer",
        previewUrl: `/?data=/${publicRelativePackage}/`,
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
