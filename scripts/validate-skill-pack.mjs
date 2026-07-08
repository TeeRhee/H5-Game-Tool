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

function isTodoPath(value) {
  return String(value).startsWith("TODO_");
}

function validateToolTypes(errors) {
  const toolTypes = readJson("tool-types.json");

  for (const toolType of toolTypes.toolTypes ?? []) {
    if (!isTodoPath(toolType.template)) {
      assert(existsInSkill(toolType.template), `Tool type ${toolType.id} template is missing: ${toolType.template}`, errors);
    }

    if (!isTodoPath(toolType.componentRegistry)) {
      assert(
        existsInSkill(toolType.componentRegistry),
        `Tool type ${toolType.id} component registry is missing: ${toolType.componentRegistry}`,
        errors,
      );
    }

    for (const schemaPath of String(toolType.datasourceSchema).split(";").map((item) => item.trim()).filter(Boolean)) {
      if (!isTodoPath(schemaPath)) {
        assert(existsInSkill(schemaPath), `Tool type ${toolType.id} datasource schema is missing: ${schemaPath}`, errors);
      }
    }

    if (!isTodoPath(toolType.mapping)) {
      assert(existsInSkill(toolType.mapping), `Tool type ${toolType.id} mapping is missing: ${toolType.mapping}`, errors);
    }

    if (!isTodoPath(toolType.examples)) {
      assert(existsInSkill(toolType.examples), `Tool type ${toolType.id} examples are missing: ${toolType.examples}`, errors);
    }
  }
}

function validateTemplateComponentReferences(toolType, errors) {
  if (isTodoPath(toolType.template) || isTodoPath(toolType.componentRegistry)) return;

  const template = readJson(toolType.template);
  const registry = readJson(toolType.componentRegistry);
  const componentIds = new Set((registry.components ?? []).map((component) => component.id));

  for (const region of template.regions ?? []) {
    for (const componentId of region.allowedComponents ?? []) {
      assert(
        componentIds.has(componentId),
        `Tool type ${toolType.id} region ${region.id} allows unknown component ${componentId}`,
        errors,
      );
    }
  }
}

function validateMappingReferences(toolType, errors) {
  if (isTodoPath(toolType.mapping) || isTodoPath(toolType.template) || isTodoPath(toolType.componentRegistry)) return;

  const template = readJson(toolType.template);
  const registry = readJson(toolType.componentRegistry);
  const mapping = readJson(toolType.mapping);
  const regionsById = new Map((template.regions ?? []).map((region) => [region.id, region]));
  const componentIds = new Set((registry.components ?? []).map((component) => component.id));

  assert(mapping.toolType === toolType.id, `${toolType.id} mapping toolType must be ${toolType.id}`, errors);

  for (const regionMapping of mapping.regionMappings ?? []) {
    const region = regionsById.get(regionMapping.regionId);
    assert(Boolean(region), `${toolType.id} mapping references unknown region ${regionMapping.regionId}`, errors);

    for (const componentId of regionMapping.components ?? []) {
      assert(componentIds.has(componentId), `${toolType.id} mapping references unknown component ${componentId}`, errors);
      if (region) {
        assert(
          (region.allowedComponents ?? []).includes(componentId),
          `${toolType.id} mapping places ${componentId} in disallowed region ${region.id}`,
          errors,
        );
      }
    }
  }
}

function validateContracts(errors) {
  const toolTypes = readJson("tool-types.json");
  for (const toolType of toolTypes.toolTypes ?? []) {
    validateTemplateComponentReferences(toolType, errors);
    validateMappingReferences(toolType, errors);
  }
}

function validateTooltipContracts(errors) {
  const components = readJson("components.json");
  const wikiTemplate = readJson("wiki/templates/wiki.json");
  const wikiMapping = readJson("wiki/mapping/wiki.json");
  const tooltip = (components.components ?? []).find((component) => component.id === "Base.ToolTip");

  assert(Boolean(tooltip), "Base.ToolTip component definition is missing", errors);
  assert(
    tooltip?.observedStructure?.portalRule?.includes("page/body-level overlay or portal") &&
      tooltip?.observedStructure?.portalRule?.includes("never cropped by small cards or list rows") &&
      tooltip?.observedStructure?.portalRule?.includes("overflow:visible"),
    "Base.ToolTip portalRule must forbid container-local tooltip rendering and require a page/body-level portal overlay",
    errors,
  );
  assert(
    tooltip?.props?.placement?.default === "auto" &&
      tooltip?.props?.placement?.rule?.includes("best fits the current page shell and viewport") &&
      tooltip?.props?.placement?.rule?.includes("portal/overlay"),
    "Base.ToolTip placement contract must keep auto page-shell and viewport-aware placement through the portal overlay",
    errors,
  );
  assert(
    tooltip?.props?.showDelayMs?.default === 120,
    "Base.ToolTip showDelayMs default must stay 120ms",
    errors,
  );
  assert(
    (wikiTemplate.requiredRendererBehavior ?? []).some((rule) =>
      rule.includes("Base.ToolTip") &&
      rule.includes("page/body-level portal overlay") &&
      rule.includes("small hover containers"),
    ),
    "Wiki template renderer rules must require Base.ToolTip to render through a page/body-level portal overlay",
    errors,
  );
  assert(
    (wikiMapping.rules ?? []).some((rule) =>
      rule.includes("Base.ToolTip") &&
      rule.includes("page/body-level portal overlay") &&
      rule.includes("overflow:hidden, clip, or scroll containers"),
    ),
    "Wiki mapping rules must require Base.ToolTip portal rendering that escapes clipped containers",
    errors,
  );
}

function main() {
  const errors = [];

  validateToolTypes(errors);
  validateContracts(errors);
  validateTooltipContracts(errors);

  if (errors.length) {
    for (const error of errors) console.error(`ERROR ${error}`);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        skillDir: path.relative(repoRoot, skillDir),
        status: "valid",
        checks: ["tool-type references", "template component references", "mapping references", "tooltip portal contracts", "JSON without BOM"],
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
