---
name: h5-game-map
description: Validate standardized game map data packages and generate constrained H5 map page JSON. Use when Codex needs to turn a game map data source into an H5 map tool, inspect or enforce map.meta.json/map.normalized.json contracts, write a source-specific adapter from raw map data, validate map tiles/icons/marker relationships, or produce OUTPUT_SCHEMA-compatible page JSON for a renderer.
---

# H5 Game Map

Use this skill to move a game map source through a constrained H5 generation flow:

```txt
raw source data -> source-specific adapter -> standard map package -> validated page JSON -> H5 renderer
```

Current supported tool type: `map`. Do not use this skill for `wiki` or `guide-config` page generation; those are registered only as future types.

## Workflow

1. Identify whether the user provided a standardized map package or raw source data.
2. If the input is raw source data, inspect it and write a source-specific adapter only when the field meanings are clear.
3. If coordinate system, tile path rules, category/group/marker relationships, or safe detail fields are unclear, stop and ask for those mapping decisions.
4. Validate the resulting standard package with `scripts/validate-map-package.mjs`.
5. Generate constrained page JSON with `scripts/generate-map-output.mjs`.
6. Report generated files, validation warnings, and any raw fields intentionally ignored.

## Standard Package

A standard map package must contain:

```txt
map.meta.json
map.normalized.json
maps/ or equivalent tile assets
icons/
images/
```

Read `references/datasource-schema/MAP_DATASOURCE_CONTRACT.md` when writing or reviewing adapters.

Core rules:

- Do not let the H5 renderer consume raw crawler-specific files directly.
- Do not invent field meanings, coordinates, detail copy, image paths, or category relationships.
- Resolve tiles from `maps[].tile.urlTemplate` or `maps[].tile.manifest`; do not scan directories to guess rules.
- Resolve group icons relative to `assets.iconBase`.
- Resolve detail images relative to `assets.imageBase`.
- Enforce `groups[].count` against actual marker counts.
- For one-map packages, follow `uiRules.singleMapSelect`.

## Validation

Run from the skill directory or use absolute paths:

```sh
node scripts/validate-map-package.mjs --package <standard-map-package-dir>
```

The validator checks:

- required `map.meta.json` and `map.normalized.json`
- map/category/group cross-file references
- marker and area positions
- declared group counts
- game logo, icons, detail images
- tile template sample or tile manifest presence

## Page JSON Generation

Generate `OUTPUT_SCHEMA`-compatible page JSON:

```sh
node scripts/generate-map-output.mjs --package <standard-map-package-dir> --output <standard-map-package-dir>/page.output.json
```

The generator does not create arbitrary HTML or React code. It emits structured page JSON using the registered map template, component registry, and mapping contract.

Read these references when changing generation behavior:

- `references/OUTPUT_SCHEMA.json`
- `references/templates/map.json`
- `references/components/map.json`
- `references/mapping/map.json`
- `references/examples/map.json`

## Adapter Guidance

When creating an adapter for a new game, map raw fields into:

- `map.meta.json > game`
- `map.meta.json > maps`
- `maps[].tile.urlTemplate` or `maps[].tile.manifest`
- `maps[].coordinate`
- `map.normalized.json > categories[].groups[]`
- `map.normalized.json > markers[]`
- `map.normalized.json > areas[]`
- relative asset paths under `assets.iconBase` and `assets.imageBase`

Adapters may preserve raw IDs under `markers[].raw`, but renderer-visible content must come from the normalized fields.

## Stop Conditions

Ask the user or developer for clarification instead of writing an adapter when any of these are unknown:

- whether marker `x/y` are map pixels, percentages, tile coordinates, or another projection
- map dimensions, tile size, zoom relationship, or tile source path pattern
- category, group, and marker relationship semantics
- which detail text/image fields are safe to display
- whether area data is center labels or polygons

## Renderer Boundary

This skill package does not include the React/Vite renderer demo or large game tile assets. Use this skill to validate/normalize/generate page JSON. A separate renderer project can consume the standardized package and generated JSON.
