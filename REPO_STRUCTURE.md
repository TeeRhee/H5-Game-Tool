# Repository Structure

This repository supports multiple game tool UIs, each with its own page template and rules.
Shared design assets are maintained globally. Type-specific page contracts live in type-owned folders.

## Canonical Layers

### 1. Global design and contract layer

These files are shared across all tool types:

- `README.md`
- `skill-pack/DESIGN.md`
- `skill-pack/SKILL.md`
- `skill-pack/components.json`
- `skill-pack/tool-types.json`
- `skill-pack/OUTPUT_SCHEMA.json`
- `design-system-pack/DESIGN.md`
- `design-system-pack/tokens.css`
- `skill-pack/schemas/`

This layer defines the rules, token source, output shape, and contract validation for every tool type.

### 2. Shared component layer

Reusable UI components live here:

- `src/components/game-tool/`
- `component-packages/h5-game-tool-components/src/components/game-tool/` only as a packaged mirror

The code under `src/components/game-tool/` is the source of truth for component behavior.
Type pages choose which shared components to use through their own template and mapping contracts.

### Documentation rule

Keep repository navigation in `README.md`, detailed folder ownership in `REPO_STRUCTURE.md`, and handoff/package usage in `DELIVERY_MANUAL.md`.

Do not add per-folder README files for map, wiki, schema, examples, or mapping folders unless that folder is an independently installable package. The component package keeps its own README because it is included in npm tarballs and is read by downstream consumers.

### 3. Type-specific contract layer

Each tool type owns its own page template and related contract files.

Current examples:

- Map: `skill-pack/map/templates/map.json`, `skill-pack/components.json`, `skill-pack/map/mapping/map.json`, `skill-pack/map/examples/map.json`, `skill-pack/map/datasource-schema/`
- Wiki: `skill-pack/wiki/templates/wiki.json`

Planned direction:

- Keep each type's template under `skill-pack/<type>/templates/`
- Keep type-specific mapping and examples next to that type
- Keep type-specific schemas next to that type when the contract becomes data-backed

### 4. Preview and implementation layer

These files are runtime and local preview concerns, not contract definition:

- `src/preview/ComponentPreview.tsx`
- `src/preview/ComponentGallery.tsx`
- `src/styles.css`
- `src/main.tsx`

### 5. Delivery and packaging layer

These folders contain generated packages, archives, and handoff copies:

- `deliverables/`
- `public/data/`

These are not the canonical maintenance surface. They are useful as exports, snapshots, or package artifacts.

## Current Clean Boundaries

Keep these ideas separate:

- Design rules are not page templates.
- Shared components are not type rules.
- Type rules are not global rules.
- Preview code is not the contract source.
- Generated deliverables are not canonical source files.

## Cleanup Candidates

The following are the main files and folders that do not fit the long-term maintenance model and are the first candidates for removal or archive cleanup:

- `deliverables/*.zip`
- `deliverables/*.tgz`
- `deliverables/installable-skills/`
- `deliverables/H5-Game-*`
- `deliverables/H5-Map-*`

The map-specific contract files under `skill-pack/` remain valid for now, but they are transition files. As more types are added, the long-term direction is to move each type's template, mapping, examples, and data schemas into that type's own folder.

## Practical Rule

When adding a new tool type:

1. Add or update its entry in `skill-pack/tool-types.json`.
2. Add its template under `skill-pack/<type>/templates/`.
3. Add its mappings, examples, and schemas under the same type-owned area.
4. Reuse shared components from `src/components/game-tool/`.
5. Keep shared design and token files in the global layer.
