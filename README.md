# H5 Game Tool

This repository maintains the design contracts, shared React components, and generated handoff packages for H5 game tool UIs.

## Current Structure

- `design-system-pack/`: canonical visual foundation. `tokens.css` is the source of truth for color, typography, spacing, radius, and related UI variables. `DESIGN.md` records human-readable design rules.
- `component-packages/h5-game-tool-components/`: shared React component package. Tool types such as map and wiki should consume this as one component library.
- `skill-pack/`: AI and renderer contracts. Shared files live at the root, while each tool type owns its templates, mappings, examples, and datasource rules in its own folder.
- `skill-pack/schemas/`: JSON schemas for validating contract files.
- `docs/`: planning notes, implementation checklists, and non-packaged working documents.
- `deliverables/`: generated zip and tarball handoff files. Treat source folders as canonical, then regenerate deliverables when source changes.
- `src/`: local preview and renderer demo source.
- `scripts/`: validation, token sync, packaging, and data adapter scripts.

## Contract Boundary

Shared components are maintained once in `component-packages/h5-game-tool-components/` and registered through `skill-pack/components.json`.

Tool types do not own separate component libraries. A tool type decides which shared components it can use through its template and rule files:

- Map templates: `skill-pack/map/templates/`
- Wiki templates: `skill-pack/wiki/templates/`

This keeps map, wiki, and future tool types visually consistent while allowing each type to maintain its own page structure.

## Important Files

- `REPO_STRUCTURE.md`: detailed folder-by-folder maintenance map.
- `DELIVERY_MANUAL.md`: what each source and handoff file is for.
- `design-system-pack/DESIGN.md`: global design rules.
- `skill-pack/SKILL.md`: execution rules for AI-assisted generation.
- `skill-pack/components.json`: shared component registry.
- `skill-pack/OUTPUT_SCHEMA.json`: page output contract.
- `skill-pack/wiki/DESIGN.md`: Wiki-specific human-readable design rules.
- `docs/wiki/WIKI_FILE_PLAN.md`: Wiki implementation plan and status checklist.
- `component-packages/h5-game-tool-components/README.md`: install and import instructions for the component package.

## Validation

```sh
npm run validate:skill-pack
npm run build
npm --prefix component-packages/h5-game-tool-components run build
```

Regenerate component handoff packages after component source changes:

```sh
npm --prefix component-packages/h5-game-tool-components run build
```

Then pack from `component-packages/h5-game-tool-components/` into `deliverables/`.
