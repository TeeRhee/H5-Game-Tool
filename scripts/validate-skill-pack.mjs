import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const skillDir = path.join(repoRoot, "skill-pack");

function readJson(relativePath) {
  const absolutePath = path.join(skillDir, relativePath);
  const text = fs.readFileSync(absolutePath, "utf8");
  if (text.charCodeAt(0) === 0xfeff) {
    throw new Error(`${relativePath} starts with a UTF-8 BOM`);
  }
  return JSON.parse(text);
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function existsInSkill(relativePath) {
  return fs.existsSync(path.join(skillDir, relativePath));
}

function validateToolTypes(errors) {
  const toolTypes = readJson("tool-types.json");

  for (const toolType of toolTypes.toolTypes ?? []) {
    if (!toolType.template.startsWith("TODO_")) {
      assert(existsInSkill(toolType.template), `Tool type ${toolType.id} template is missing: ${toolType.template}`, errors);
    }

    if (!toolType.componentRegistry.startsWith("TODO_")) {
      assert(
        existsInSkill(toolType.componentRegistry),
        `Tool type ${toolType.id} component registry is missing: ${toolType.componentRegistry}`,
        errors,
      );
    }

    for (const schemaPath of String(toolType.datasourceSchema).split(";").map((item) => item.trim()).filter(Boolean)) {
      if (!schemaPath.startsWith("TODO_")) {
        assert(existsInSkill(schemaPath), `Tool type ${toolType.id} datasource schema is missing: ${schemaPath}`, errors);
      }
    }

    if (!String(toolType.mapping).startsWith("TODO_")) {
      assert(existsInSkill(toolType.mapping), `Tool type ${toolType.id} mapping is missing: ${toolType.mapping}`, errors);
    }

    if (!String(toolType.examples).startsWith("TODO_")) {
      assert(existsInSkill(toolType.examples), `Tool type ${toolType.id} examples are missing: ${toolType.examples}`, errors);
    }
  }
}

function validateMapTemplateReferences(errors) {
  const template = readJson("templates/map.json");
  const registry = readJson("components/map.json");
  const componentIds = new Set((registry.components ?? []).map((component) => component.id));

  for (const region of template.regions ?? []) {
    for (const componentId of region.allowedComponents ?? []) {
      assert(
        componentIds.has(componentId),
        `Template region ${region.id} allows unknown component ${componentId}`,
        errors,
      );
    }
  }
}

function validateMapMappingReferences(errors) {
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

  validateToolTypes(errors);
  validateMapTemplateReferences(errors);
  validateMapMappingReferences(errors);

  if (errors.length) {
    for (const error of errors) console.error(`ERROR ${error}`);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        skillDir: path.relative(repoRoot, skillDir),
        status: "valid",
        checks: ["tool-type references", "map template component references", "map mapping references", "JSON without BOM"],
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
