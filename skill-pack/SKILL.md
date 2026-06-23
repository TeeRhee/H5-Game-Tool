---
name: game-h5-map-tool
description: Generate and validate map-type game H5 tool pages from standardized map packages, or from uploaded raw game map sources by authoring a source-specific adapter when field meanings are clear. Use when Codex needs to inspect raw map data, normalize it, validate map metadata, produce structured H5 page JSON, and hand it to the map H5 renderer without inventing fields or arbitrary page code.
---

# Game H5 Map Tool

Use this skill to turn a game map data source into a constrained H5 map tool page.

The v1 runnable target is the `map` tool type. `wiki` and `guide-config` are registered as future tool types, but they are outside this skill's first packaged scope.

## Current Inputs

- A standardized map data package from development.
- Optional raw crawled data for reference only.
- The design contracts in this folder.
- The design tokens in `tokens/tokens.css`.
- The map layout and components from Figma file `fnA9NEBTDyxU94M0fvNy8e`, node `58:1896`.

## Execution Flow

1. Read `tool-types.json`.
2. If the input is raw crawled data, inspect the uploaded source and create a source-specific adapter when the required field meanings are clear. Run the adapter to create a standardized map package. If key meanings are unclear, stop and request the missing mapping decisions.
3. If the input is already a standardized map package, use it directly.
4. Read `templates/map.json`, `components/map.json`, and `datasource-schema/MAP_DATASOURCE_CONTRACT.md`.
5. Validate `map.meta.json` against `datasource-schema/map.meta.schema.json`.
6. Validate `map.normalized.json` against `datasource-schema/map.normalized.schema.json`.
7. If `map.meta.json` uses `tile.sourceType = "manifest"`, validate the referenced tile manifest against `datasource-schema/tile-manifest.schema.json`.
8. Validate cross-file references: marker `mapId`, area `mapId`, marker `categoryId`, marker `groupId`, group counts, icon paths, image paths, tile template or manifest paths.
9. Generate the structured H5 page JSON from the standardized package and `OUTPUT_SCHEMA.json`.
10. Validate that every referenced component exists in the map component registry.
11. Validate that every rendered component is placed in an allowed template region.
12. Pass the standardized package directory to the H5 renderer. The local renderer accepts `?data=/data/<package>/`.

## Non-Negotiable Rules

- Do not invent data-source field names.
- Do not invent coordinate formats.
- Do not invent example content.
- Do not treat any game's raw crawled data as the renderer contract.
- Do not let the renderer depend directly on a raw source such as a platform-specific `points.json`.
- Require raw source data to be normalized into `map.meta.json` and `map.normalized.json` before final rendering.
- Require a source-specific adapter for every raw source shape. If the user uploads raw data without an adapter, author one from the actual source files when the required semantics are clear. Do not infer missing fields, coordinates, tile paths, icons, or detail copy.
- Do not hard-code one game's tile path pattern, tile extension, coordinate size, projection zoom, or category shape as a global rule.
- If tiles follow a stable pattern, require `tile.sourceType = "template"` and a `tile.urlTemplate` that includes `{z}`, `{x}`, and `{y}`.
- If tiles do not follow a stable pattern, require `tile.sourceType = "manifest"` and a validated tile manifest.
- For details, render only fields present in normalized data. If a marker has only `title`, render a title-only detail state.
- For single-map packages, disable or hide the map Select according to `map.meta.json > uiRules.singleMapSelect`.
- For multi-map packages, enable map Select from `map.meta.json > maps`, and require every marker and area to declare `mapId`.
- Do not generate arbitrary page code when a template and component registry exist.
- Use `TODO_FROM_DATASOURCE` for any item that depends on development-provided data.
- Keep AI output as structured JSON that conforms to `OUTPUT_SCHEMA.json`.
- The renderer should call registered components from the component registry instead of accepting arbitrary component names.
- For any component-related change, synchronize implementation, styles, preview usage, component registry JSON, Figma documentation cards, and validation results together.
- The map left header is a reserved game-logo image area. Use a user-provided logo asset; do not invent a logo and do not render a normal text title there.
- `map.canvas` is the full-window background canvas (`1160 x 800`) under the Sidebar and Footer overlays. Do not treat it as only the right-side visible map area.
- The map Sidebar is `x=12, y=12, w=264, h=776` with radius `8`.
- The left filter list uses `Layout.Scroll` as a visual scrollbar. In the current template it is `x=252, y=102, w=12, h=586` inside Panel Content; the renderer may bind it to the real list scroll state.
- `Layout.DescribeCard` is fixed to the lower-right of the map template at `x=868, y=522, w=280, h=266`.
- Do not render development-only status text in final generated pages. The local preview may show debug counters such as "shown markers / total markers", but this is not part of the Figma map template and must not be emitted by the skill output.
- For map canvas rendering, pan/drag and wheel zoom belong to the layout/renderer layer. Background content may scale, but Tooltip marker visual size must remain constant while marker screen positions are recalculated from map coordinates and zoom.
- Tooltip markers must render below `Layout.DescribeCard` when overlapping, because `Layout.DescribeCard` is the active detail surface.
- For `Layout.DescribeCard`, when there is no image and no description, align the title and close button on the same visual row.
- While the pointer is inside the map canvas, canvas drag and wheel zoom should capture the interaction: prevent native image dragging and prevent the surrounding preview/page from scrolling.
- The bottom action button clears all filters: clear search input and set every active filter selection to unchecked.
- Use the map template colors from Figma node `58:11293`: `#1F2224` for the window background, `#2C3134` for panels/detail/zoom controls, `#353A3D` for search, and `#43484B` for field strokes.

## Map Type Status

The map type has design-side contracts:

- Tool type registration exists in `tool-types.json`.
- Layout contract exists in `templates/map.json`.
- Component registry exists in `components/map.json`.
- Current v0 preview/layout status is recorded in `MAP_V0_STATUS.md`.
- Design tokens exist in `tokens/tokens.css`.
- Standardized map package contract exists in `datasource-schema/MAP_DATASOURCE_CONTRACT.md`.
- Standardized map package schemas exist in `datasource-schema/map.meta.schema.json`, `datasource-schema/map.normalized.schema.json`, and `datasource-schema/tile-manifest.schema.json`.

## Pending Per-Game Adapters

These files are still game-specific and should only be created after a real game source package exists:

- adapter or mapping from raw crawled source to `map.meta.json`
- adapter or mapping from raw crawled source to `map.normalized.json`
- real input/output examples for each game package

## Current Automation Commands

The current real example is Crimson Desert.

Regenerate the standardized package:

```sh
npm run adapt:crimsondesert -- --source <raw-crimsondesert-dir> --output public/data/crimsondesert
```

Run the full map H5 chain from an existing standardized package:

```sh
npm run build:map-h5 -- --package <standard-map-package-dir>
```

Run the full map H5 chain from raw data with an adapter:

```sh
npm run build:map-h5 -- --adapter <adapter.mjs> --source <raw-source-dir> --package <standard-map-package-dir>
```

Generate only the H5 page JSON:

```sh
npm run generate:map-page -- --package <standard-map-package-dir> --output <standard-map-package-dir>/page.h5.json
```

## Raw Source Adapter Workflow

When the user provides a new raw map data source and does not provide an adapter:

1. Inspect the source directory and list candidate files for points, categories, areas, map images or tiles, icons, and logo/images.
2. Identify explicit source fields for the required normalized fields:
   - map metadata: game id/name, map id/name, tile path rule or manifest, tile size, min/max zoom, coordinate width/height, coordinate origin and axis.
   - categories/groups: id, name, icon, count.
   - markers: id, title, x/y position, category id, group id, map id, optional detail fields.
   - areas: id/name, x/y position or polygon, map id, type.
3. If these required meanings are clear from the actual files, create a source-specific adapter script under `scripts/adapt-<source-id>.mjs`.
4. The adapter must output a standard package with `map.meta.json`, `map.normalized.json`, and copied or referenced assets.
5. Run `npm run validate:map -- --package <standard-map-package-dir>`.
6. Run `npm run generate:map-page -- --package <standard-map-package-dir>`.
7. Report the output package path, generated `page.h5.json`, renderer URL, warnings, and any source fields intentionally ignored.

Stop and ask for clarification instead of writing an adapter when any of these are unknown:

- coordinate system or whether x/y are map pixels, percentages, tile coordinates, or another projection.
- tile/image path pattern, manifest, map dimensions, tile size, or zoom relationship.
- category/group/marker relationships.
- which text/image fields are safe to show in the H5 detail card.

Never make a universal adapter from one game's raw format. Every adapter is source-specific.

Validate the standardized package:

```sh
npm run validate:crimsondesert
```

Validate the skill pack contracts before packaging:

```sh
npm run validate:skill-pack
```

Validate any map package:

```sh
npm run validate:map -- --package <standard-map-package-dir>
```

Generate constrained page JSON for any validated map package:

```sh
npm run generate:map-output -- --package <standard-map-package-dir> --output <standard-map-package-dir>/page.output.json
```

Use `DEVELOPER_HANDOFF.md` when handing the map package contract to developers.

## Map H5 V1 Packaging

For the first standalone skill, scope the package to the full map H5 chain:

1. Accept either a standardized map package directory or raw source data plus a source-specific adapter.
2. Normalize raw source data into the standard map package when an adapter is provided.
3. Validate `map.meta.json`, `map.normalized.json`, optional tile manifest, asset paths, group counts, and cross-file references.
4. Generate `page.h5.json` that conforms to `OUTPUT_SCHEMA.json`.
5. Report validation errors and warnings.
6. Hand the package directory to the H5 renderer with `?data=/data/<package>/`.

Do not include Crimson Desert data assets in the skill package. Keep real game data packages and per-game adapters outside the reusable skill unless an adapter is intentionally bundled as an example.
