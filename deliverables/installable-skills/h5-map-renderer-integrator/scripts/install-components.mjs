import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, "..");
const configPath = path.join(skillRoot, "references", "component-package.json");

function parseArgs(argv) {
  const args = {
    target: "",
    packageSpec: "",
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--target") args.target = argv[++index];
    else if (arg === "--package-spec") args.packageSpec = argv[++index];
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--help") {
      console.log("Usage: node scripts/install-components.mjs --target <front-end-project> [--package-spec <npm|path|tgz|url>] [--dry-run]");
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!args.target) throw new Error("--target is required");
  return args;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function detectPackageManager(targetDir) {
  if (fs.existsSync(path.join(targetDir, "pnpm-lock.yaml"))) return { name: "pnpm", args: ["add"] };
  if (fs.existsSync(path.join(targetDir, "yarn.lock"))) return { name: "yarn", args: ["add"] };
  return { name: "npm", args: ["install"] };
}

function resolvePackageSpec(packageSpec, targetDir) {
  if (!packageSpec) return packageSpec;
  if (/^(https?:|git\+|file:)/.test(packageSpec)) return packageSpec;

  const absolute = path.resolve(targetDir, packageSpec);
  if (fs.existsSync(absolute)) return absolute;
  return packageSpec;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const targetDir = path.resolve(args.target);
  const targetPackageJson = path.join(targetDir, "package.json");
  if (!fs.existsSync(targetPackageJson)) {
    throw new Error(`Target project package.json not found: ${targetPackageJson}`);
  }

  const config = readJson(configPath);
  const packageSpec = resolvePackageSpec(args.packageSpec || config.defaultPackageSpec, targetDir);
  const manager = detectPackageManager(targetDir);
  const commandArgs = [...manager.args, packageSpec];

  const report = {
    targetDir,
    packageManager: manager.name,
    packageSpec,
    command: `${manager.name} ${commandArgs.join(" ")}`,
    imports: {
      components: `import { Button, SearchBar, Select } from "${config.exports.components}";`,
      styles: `import "${config.exports.styles}";`,
    },
  };

  if (args.dryRun) {
    console.log(JSON.stringify({ ...report, status: "dry-run" }, null, 2));
    return;
  }

  const result = spawnSync(manager.name, commandArgs, {
    cwd: targetDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    throw new Error(`Install command failed with exit code ${result.status}`);
  }

  console.log(JSON.stringify({ ...report, status: "installed" }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
