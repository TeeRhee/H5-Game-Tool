---
version: alpha-desktop
name: H5 Game Wiki Tool
source:
  figmaFile: fnA9NEBTDyxU94M0fvNy8e
  pageNode: 167:628
  homeNode: 167:630
  secondaryListNode: 304:5972
  detailLargeCardExpandedNode: 304:17202
  detailAllStatesNode: 304:9319
description: A desktop Wiki utility for structured game reference pages, built from the shared H5 component registry, the Wiki page template, and the shared token export.
---

## Overview

The H5 Game Wiki Tool is an operational reference interface for browsing structured game information. It is not a marketing page, hero page, or decorative article layout.

The current Wiki contract covers desktop states only:

- Home: header, summary text, and top-level category grid.
- Secondary list: header, selected-category entry grid, and pagination.
- Detail: header, breadcrumbs, scrollable content, summary card, attributes, related cards, structured detail card, and optional extended content.

Treat these as states of one Wiki tool type. Do not split them into unrelated visual systems.

## Token Source

Use `design-system-pack/tokens.css` as the source of truth for color, radius, spacing, and typography variables. Do not create `skill-pack/wiki/tokens.css` in the current version.

Use semantic tokens first:

- Backgrounds: `--color-bg-black`, `--color-bg-soft`, `--color-bg-sub`, `--color-bg-weak`, `--color-bg-reverse`
- Text: `--color-text-strong`, `--color-text-sub`, `--color-text-soft`, `--color-text-weak`, `--color-text-disabled`
- Icons: `--color-icon-strong`, `--color-icon-sub`, `--color-icon-soft`, `--color-icon-weak`, `--color-icon-disabled`
- Stroke: `--color-stroke-sub`, `--color-stroke-soft`, `--color-stroke-active`, `--color-stroke-disabled`
- Brand and actions: `--color-primary-base`, `--color-primary-dark`, `--color-primary-darker`
- Status: `--color-status-success`, `--color-status-warning`, `--color-status-error`, `--color-status-info`
- Radius: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-xxl`, `--radius-full`
- Spacing: `--space-element-*` and `--space-layout-*`
- Type: `--type-font-family-primary`, `--type-font-family-number`, `--type-size-*`, `--type-line-height-*`, `--type-weight-*`

Only fall back to primitive tokens when no semantic token expresses the intended role.

## Desktop Layout

The desktop Wiki viewport is `1000 x 610`.

- `shell.background` covers `x=0, y=0, w=1000, h=610`.
- `shell.header` is shared by home, secondary list, and detail states.
- Home content starts with summary text, then shows top-level categories in a four-column grid.
- Secondary list content uses a three-column card grid and pagination.
- Detail content may exceed the visible canvas height. The renderer owns real scrolling; `Layout.Scroll` only reflects scroll state visually.
- Breadcrumbs render only on final detail pages. Labels and target routes must come from datasource or routing context, and every breadcrumb item should be clickable.

Do not reinterpret the Wiki canvas as a map canvas, article page, or free-form HTML surface. The page structure is defined by `skill-pack/wiki/templates/wiki.json`.

## Mobile Layout

No mobile Wiki state was captured in this contract pass.

Do not invent a mobile layout from desktop frames. Define mobile only after one of these inputs exists:

- mobile Wiki Figma nodes
- explicit implementation constraints from the host app
- a development-approved mobile adaptation contract

Until then, keep mobile fields and rules as `TODO_FROM_FIGMA_OR_IMPLEMENTATION`.

## Components

Use only the shared component registry in `skill-pack/components.json`. Wiki does not own a separate component registry.

The target region in `skill-pack/wiki/templates/wiki.json` decides which shared components may appear there. If a component is not listed in the region's `allowedComponents`, do not place it there.

Current Wiki template components include:

- `Layout.Background`
- `Nav.Header`
- `Nav.TopBar`
- `Form.SearchBar`
- `Game.CategoryCard`
- `Nav.Breadcrumbs`
- `Layout.DescribeCard`
- `Game.ShowCard`
- `Layout.Scroll`
- `Layout.DetailCard`
- `Game.ProgressBarLabel`
- `Game.ProgressBar`
- `Base.Image`
- `Base.Badge`
- `Nav.Pagination`
- `Data.TableHeaderCell`
- `Data.TableRowCell`

Text-only blocks such as `home.summary` may remain region data until a confirmed shared component exists. Do not register a new component only to fill one text block unless it is confirmed in design and code.

## Data And State Rules

The Wiki datasource is not defined yet. Do not invent field names, category structures, route shapes, image paths, badge values, counts, progress values, attribute groups, table schemas, or rich-text blocks.

Use `TODO_FROM_DATASOURCE` for unresolved data:

- Wiki title in the fixed '<game name> Wiki' format, category count, and item count
- global first-level top navigation items and active state
- category labels, descriptions, first-three secondary item icons/images, total item counts, and target routes
- global Wiki search query and result routing
- entry titles, descriptions, images, badges, and metadata
- pagination current page and backend total page values
- detail title, summary, image, attributes, badges, related entries, progress values, tables, and extended content
- breadcrumb labels and target routes

Missing optional fields should collapse the related UI element instead of showing fabricated placeholder content in final output.

Pagination state may come from datasource or renderer state. It must not come from hardcoded sample values.

Detail tables must use structured columns and rows when that data exists. Do not encode table data as plain rich text when table structure is available.

## Mode And Theme Rules

Choose light or dark mode from the original website or host product background, not from the Wiki type itself.

The observed Wiki frames use the shared H5 dark tool surface. If the host page uses a dark game-overlay shell, bind the Wiki tool under the dark token mode. If the host page is light, request or use the confirmed light token mode rather than synthesizing missing values.

Do not mix dark panels with light-page text tokens or light panels with dark-page text tokens in the same Wiki shell unless the design file explicitly defines that mixed surface.

## Generation Rules

- Do not generate arbitrary HTML or arbitrary React code.
- Do not add regions that are absent from `skill-pack/wiki/templates/wiki.json`.
- Do not place unknown or disallowed components in a region.
- Do not merge Wiki regions into the map template.
- Do not reuse map coordinate, marker, tile, or area concepts in Wiki contracts.
- Do not fabricate screenshots, icons, copy, counts, progress, categories, routes, or table rows.
- Do not render preview-only counters, debug text, or fake placeholders in generated pages.
- Keep `DESIGN.md` as the human-readable rulebook. Machine-readable contracts stay in `templates/wiki.json`, `mapping/wiki.json`, `components.json`, and `OUTPUT_SCHEMA.json`.

## Current Gaps

These items are intentionally not finalized:

- Wiki datasource schema
- concrete Wiki field names
- concrete route shape
- mobile Wiki layout
- real page output example
- Wiki-specific output schema

Add them only after the relevant design, datasource, or implementation input is available.
