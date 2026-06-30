# Data Mappings

Mappings and adapters convert game-specific raw source data into the standardized map package consumed by the Skill and H5 renderer.

The renderer contract is not a raw crawled file. The stable handoff format is:

- `map.meta.json`, validated by `datasource-schema/map.meta.schema.json`
- `map.normalized.json`, validated by `datasource-schema/map.normalized.schema.json`
- optional `tile-manifest.json`, validated by `datasource-schema/tile-manifest.schema.json`

## Adapter Responsibility

For each game or source platform, development should provide or maintain an adapter that maps raw data into the standardized package.

The adapter must decide:

- raw map list -> `map.meta.json > maps`
- raw tile location -> `tile.urlTemplate` or `tile.manifest`
- raw coordinate system -> `coordinate.origin`, `coordinate.axis`, `coordinate.width`, `coordinate.height`, `coordinate.projectZoom`
- raw category/filter fields -> `categories[].groups[]`
- raw point fields -> `markers[]`
- raw area fields -> `areas[]`
- raw detail fields -> `markers[].detail`
- raw icon and image paths -> normalized relative asset paths

## Rules

- Do not create a global raw-source `map.json` that assumes one platform's field structure.
- Do not hard-code Crimson Desert's `points.json` structure as the universal mapping.
- Do not make the renderer scan directories to guess tile names.
- Do not invent detail copy, image paths, or coordinates when raw data does not provide them.
- Use detail fallback rules instead: if only a title exists, render title only.

Per-game mapping examples can be added here after each real game source package is available.
