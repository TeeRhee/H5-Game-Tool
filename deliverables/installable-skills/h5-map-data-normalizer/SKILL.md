---
name: h5-map-data-normalizer
description: Normalize raw game map sources into the standard H5 map package. Use when Codex needs to inspect raw crawler data, write or review a source-specific adapter, create map.meta.json and map.normalized.json, validate map tiles/icons/markers/areas, or stop for missing coordinate, tile, category, group, marker, or detail-field semantics.
---

# H5 Map Data Normalizer

Use this skill to turn raw game map data into the standard package consumed by the H5 map workflow.

```txt
raw source data -> source-specific adapter -> map.meta.json + map.normalized.json -> validation report
```

## Workflow

1. Inspect the source directory and identify candidate files for maps, tiles, categories, groups, markers, areas, icons, detail images, and logo.
2. Read `references/datasource-schema/MAP_DATASOURCE_CONTRACT.md`.
3. Map raw fields into `map.meta.json` and `map.normalized.json`.
4. Write a source-specific adapter only when the field meanings are clear.
5. Run `scripts/validate-map-package.mjs --package <standard-map-package-dir>`.
6. Report the package path, validation result, warnings, ignored raw fields, and unresolved questions.

## Stop Conditions

Stop and ask for mapping decisions instead of guessing when any of these are unclear:

- whether marker `x/y` are map pixels, percentages, tile coordinates, or another projection.
- map dimensions, tile size, zoom relationship, tile source path pattern, or tile manifest shape.
- category, group, marker, and area relationship semantics.
- which text and image fields are safe to show in the H5 detail card.
- whether area data represents center labels, polygons, or another geometry.

## Output Rules

- Do not let the renderer consume crawler-specific raw files directly.
- Do not invent field names, coordinates, category relationships, detail copy, icon paths, or image paths.
- Use `maps[].tile.urlTemplate` for stable tile patterns and `maps[].tile.manifest` for irregular tiles.
- Resolve group icons relative to `assets.iconBase`.
- Resolve detail images relative to `assets.imageBase`.
- Enforce `groups[].count` against actual marker counts.
- Preserve raw IDs only under `markers[].raw`; renderer-visible content must come from normalized fields.

## Included Resources

- `scripts/validate-map-package.mjs` validates a standard package.
- `references/datasource-schema/MAP_DATASOURCE_CONTRACT.md` defines the handoff contract.
- `references/datasource-schema/*.schema.json` defines the package and tile manifest schema.

