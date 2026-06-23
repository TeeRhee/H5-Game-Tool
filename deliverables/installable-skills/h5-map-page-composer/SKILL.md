---
name: h5-map-page-composer
description: Compose H5 game map pages from standard map packages or partial data using the approved DESIGN.md, tokens, page template, component registry, mapping contract, and OUTPUT_SCHEMA. Use when Codex needs to generate page.output.json, draw a map page skeleton when data normalization is incomplete, enforce allowed components and template regions, or avoid arbitrary HTML/React page generation.
---

# H5 Map Page Composer

Use this skill to generate a constrained H5 map page configuration from the approved visual and page contracts.

```txt
standard map package or partial brief -> DESIGN.md + template + components + mapping -> page.output.json
```

## Workflow

1. Read `references/DESIGN.md` before making visual or layout decisions.
2. Read `references/templates/map.json`, `references/components/map.json`, `references/mapping/map.json`, and `references/OUTPUT_SCHEMA.json`.
3. If a standard map package exists, run `scripts/generate-map-output.mjs --package <standard-map-package-dir> --output <standard-map-package-dir>/page.output.json`.
4. If data is incomplete, generate a page skeleton that uses approved regions/components and explicit `TODO_FROM_DATASOURCE` values.
5. Run `scripts/validate-page-contracts.mjs` after changing template, component, or mapping references.
6. Report generated files, warnings, missing data, and whether the output is data-bound or skeleton-only.

## Composition Rules

- Do not generate arbitrary HTML, arbitrary React code, or arbitrary component names.
- Use only components registered in `references/components/map.json`.
- Place components only in regions allowed by `references/templates/map.json`.
- Use `references/tokens.css` and `references/DESIGN.md` for visual choices.
- Keep the map header as a logo image area. Do not invent a visible text logo.
- Keep data uncertainty visible with `TODO_FROM_DATASOURCE`; do not fabricate markers, counts, coordinates, or detail content.
- When data is incomplete, prefer a useful static shell: logo slot, disabled map select, search input, empty filter tree, map canvas, hidden detail card, and clear-filters action.

## Included Resources

- `references/DESIGN.md` describes visual identity and usage guardrails.
- `references/OUTPUT_SCHEMA.json` defines the generated page JSON shape.
- `references/templates/map.json` defines template regions and renderer behavior.
- `references/components/map.json` defines allowed components and props.
- `references/mapping/map.json` defines data-to-region/component bindings.
- `references/tokens.css` contains implementation tokens.
- `scripts/generate-map-output.mjs` emits page JSON from a standard package.
- `scripts/validate-page-contracts.mjs` checks template/component/mapping consistency.

