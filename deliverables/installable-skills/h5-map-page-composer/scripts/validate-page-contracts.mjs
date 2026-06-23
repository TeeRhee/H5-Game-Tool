import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, "..");
const referencesDir = path.join(skillRoot, "references");

function readJson(relativePath) {
  const absolutePath = path.join(referencesDir, relativePath);
  const text = fs.readFileSync(absolutePath, "utf8");
  if (text.charCodeAt(0) === 0xfeff) {
    throw new Error(`${relativePath} starts with a UTF-8 BOM`);
  }
  return JSON.parse(text);
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function validateTemplateReferences(errors) {
  const template = readJson("templates/map.json");
  const registry = readJson("components/map.json");
  const componentIds = new Set((registry.components ?? []).map((component) => component.id));

  for (const region of template.regions ?? []) {
    for (const componentId of region.allowedComponents ?? []) {
      assert(componentIds.has(componentId), `Template region ${region.id} allows unknown component ${componentId}`, errors);
    }
  }
}

function validateMappingReferences(errors) {
  const template = readJson("templates/map.json");
  const registry = readJson("components/map.json");
  const mapping = readJson("mapping/map.json");
  const regionsById = new Map((template.regions ?? []).map((region) => [region.id, region]));
  const componentIds = new Set((registry.components ?? []).map((component) => component.id));

  assert(mapping.toolType === "map", "Map mapping toolType must be map", errors);

  for (const regionMapping of mapping.regionMappings ?? []) {
    const region = regionsById.get(regionMapping.regionId);
    assert(Boolean(region), `Map mapping references unknown region ${regionMapping.regionId}`, errors);

    for (const componentId of regionMapping.components ?? []) {
      assert(componentIds.has(componentId), `Map mapping references unknown component ${componentId}`, errors);
      if (region) {
        assert(
          (region.allowedComponents ?? []).includes(componentId),
          `Map mapping places ${componentId} in disallowed region ${region.id}`,
          errors,
        );
      }
    }
  }
}

function main() {
  const errors = [];
  validateTemplateReferences(errors);
  validateMappingReferences(errors);

  if (errors.length) {
    for (const error of errors) console.error(`ERROR ${error}`);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        skillDir: path.basename(skillRoot),
        status: "valid",
        checks: ["template component references", "mapping region/component references", "JSON without BOM"],
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
