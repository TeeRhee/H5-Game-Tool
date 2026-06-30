# Developer Handoff: Map H5 Skill

This handoff is for development teams adding a new game map source.

## What Developers Must Provide

The renderer and skill consume a standardized map package, not raw crawled data.

Required package shape:

```txt
game-map-package/
  map.meta.json
  map.normalized.json
  maps/
  icons/
  images/
```

`maps/`, `icons/`, and `images/` can use different names if `map.meta.json` points to them correctly.

## Required Workflow

1. Write or provide an adapter for the raw source.
2. The adapter outputs `map.meta.json` and `map.normalized.json`.
3. Validate the package:

```sh
npm run validate:map -- --package <standard-map-package-dir>
```

4. Generate the constrained page JSON:

```sh
npm run generate:map-output -- --package <standard-map-package-dir> --output <standard-map-package-dir>/page.output.json
```

5. Preview in the H5 renderer by serving the package from `public/data/<game-id>/` and opening:

```txt
/?data=/data/<game-id>/
```

## Adapter Contract

The adapter is responsible for mapping raw fields into the standard package:

- raw game identity -> `map.meta.json > game`
- raw map list -> `map.meta.json > maps`
- raw tile source -> `maps[].tile.urlTemplate` or `maps[].tile.manifest`
- raw coordinate system -> `maps[].coordinate`
- raw category/filter fields -> `map.normalized.json > categories[].groups[]`
- raw points -> `map.normalized.json > markers[]`
- raw area labels or polygons -> `map.normalized.json > areas[]`
- raw icon/image references -> relative paths under `assets.iconBase` and `assets.imageBase`

## Supported Tile Modes

Template tiles:

```json
{
  "sourceType": "template",
  "urlTemplate": "maps/world/{z}/{x}/{y}.png"
}
```

Manifest tiles:

```json
{
  "sourceType": "manifest",
  "manifest": "tile-manifest.json"
}
```

Use manifest tiles when the source does not have a stable `{z}/{x}/{y}` path pattern.

## Current Scope

Supported now:

- Standard map package validation.
- Map package to constrained `OUTPUT_SCHEMA.json` page JSON.
- H5 map preview for template and manifest tile packages.
- Search, category/group filtering, marker layer, area labels, marker detail, pan, and zoom.

Not supported yet:

- Raw crawler data directly into H5 without an adapter.
- Wiki or guide-config page generation.
- Storybook.
- A packaged standalone Codex skill installer.
