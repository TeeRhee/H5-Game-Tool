# Data Source Schemas

This folder defines the standard data contracts that the H5 map tool consumes.

Raw crawled data is not a stable contract. Different games and source websites may use different field names, category structures, coordinate systems, tile layouts, file names, and detail fields. Development should normalize each raw source into the standard package described here before the Skill or renderer consumes it.

## Map Contracts

- `MAP_DATASOURCE_CONTRACT.md`: human-readable handoff document for development.
- `map.meta.schema.json`: validates `map.meta.json`, including game info, map list, tile config, coordinate config, asset base paths, and UI fallback rules.
- `map.normalized.schema.json`: validates `map.normalized.json`, including categories, groups, markers, areas, and optional detail fields.
- `tile-manifest.schema.json`: validates `tile-manifest.json` when a map's tiles cannot be addressed by a stable `{z}/{x}/{y}` style template.

## Expected Map Package

```txt
game-map-source/
  map.meta.json
  map.normalized.json
  tile-manifest.json        # optional, only when tile.sourceType is manifest
  map-tiles/                # name and internal structure are source-specific
  icons/
  images/
```

## Rules

- Do not treat a game's raw `points.json` as a universal schema.
- Do not infer tile layout by scanning folders. Use `tile.urlTemplate` or `tile.manifest`.
- Do not hard-code one game's coordinate size, zoom level, tile extension, or directory structure.
- Do not invent missing detail fields. Render only fields present in normalized data.
- Create game-specific adapters outside the renderer when raw fields differ.
