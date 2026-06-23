# Renderer Contract

The renderer consumes a standard map package and generated page JSON. It does not consume raw crawler files.

## Inputs

- `map.meta.json`
- `map.normalized.json`
- map tiles through `maps[].tile.urlTemplate` or `maps[].tile.manifest`
- icons through `assets.iconBase`
- detail images through `assets.imageBase`
- optional `page.output.json`

## Runtime Responsibilities

- load maps, categories, groups, markers, and areas from the standard package.
- maintain selected map, visible group ids, search query, selected marker, pan state, and zoom state.
- project marker positions from normalized map coordinates into current screen positions.
- keep marker visual size constant while map background content scales.
- bind the left filter tree, search input, select state, detail card, zoom controls, and clear action.

## Boundaries

- `page.output.json` is a declarative configuration, not a standalone deployed page.
- `TODO_FROM_DATASOURCE` means the page composer did not have enough data; the renderer should not invent replacement content.
- Single-map select behavior follows `map.meta.json > uiRules.singleMapSelect`.

