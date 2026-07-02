---
version: alpha-desktop
name: H5 Game Wiki Tool
source:
  figmaFile: fnA9NEBTDyxU94M0fvNy8e
  pageNode: 167:628
  homeNode: 167:630
  secondaryListNode: 304:5972
  secondaryLargeCardNode: 304:13409
  detailLargeCardExpandedNode: 304:17202
  detailAllStatesNode: 304:9319
description: A desktop Wiki utility for structured game reference pages, built from the shared H5 component registry, the Wiki page template, and the shared token export.
---

## Overview

The H5 Game Wiki Tool is an operational reference interface for browsing structured game information. It is not a marketing page, hero page, or decorative article layout.

The current Wiki contract covers desktop states only:

- Home: header, summary text, and top-level category grid.
- Secondary list: header and selected-category entry content, using the card family and layout variant that best matches the original source page.
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

Template pages are layout references, not mandatory data structures. First inspect the original source page to decide which regions and component families are actually needed, then apply the matching Figma layout rules for those chosen components. It is valid to use only part of a template page, such as a tab row, a large-card grid, or a detail stack, without rendering unrelated template regions.

### Observed Secondary Layout

The `SecondaryPage` design node is `304:5972` and uses the default `1000 x 610` viewport.

- Header: `x=0, y=0, w=1000, h=84`; desktop padding is `32px 32px 16px`.
- Body: `x=0, y=80, w=1000, h=530`.
- Breadcrumb reference: `x=20, y=96, w=216, h=28` absolute, but this is reserved only. Generated secondary pages do not render breadcrumbs under the current contract.
- List container: `x=32, y=144, w=936, h=408` absolute.
- Plain list with no secondary navigation and no breadcrumbs: use Body-relative `x=32, y=20, w=936` for the list region. This applies when the source page has no second-level tab row, no third-level navigation, and no breadcrumb row above the list.
- Card grid: 3 columns x 4 visible design rows, card `w=306.6667, h=96`, column gap `8`, row gap `8`.
- Card x positions inside each row: `0`, `314.6667`, `629.3334`.
- Row y positions inside the list container: `0`, `104`, `208`, `312`.
- `Layout.DescribeCard` SM default component node `177:1104`: root `w=328, h=106`, padding `8`, horizontal gap `12`, image `x=8, y=8, w=90, h=90`, content `x=110, y=8, w=210, h=90`, content vertical gap `6`.
- `Layout.DescribeCard` SM subtitle structure: title/description group `w=210, h=62`, title row `h=22`, subtitle text `x=0, y=26, w=210, h=36`, Body/SM `12px/18px`, two visible lines. Clamp overflow to two lines and expose the full text through `Base.ToolTip` only when the rendered subtitle is actually truncated or hidden.
- Pagination: Body-relative `x=0, y=482, w=1000, h=64`, absolute `x=0, y=562, w=1000, h=64`.

Choose `Game.ShowCard` only when it fully represents the source entry and every entry subtitle/body in the current rendered card set fits within one visible line. The current card set is scoped to the active secondary tab plus optional active third-level group, not the whole first-level category. Choose compact `Layout.DescribeCard` when the source entry needs richer inline description, image, badge, or meta fields. Pagination total pages must come from backend data in production output.

For any Wiki card set that renders `imageSrc`, inspect the source asset dimensions or the visible content type in the current rendered page/list before choosing the image frame. Use `Base.Image` ratio `1:1` for square icons, portraits, or near-square art. Use `3:2` or `16:9` for wide source assets such as weapons, equipment thumbnails, maps, screenshots, landscapes, and banners. Keep one ratio within the current page/list when visual consistency is needed, but re-evaluate the ratio for each sibling second-level tab or secondary page; do not reuse a wider ratio from one tab on another tab whose assets are better represented as `1:1`.

For `Game.ShowCard`, the right arrow is a drill-down affordance, not decoration. Hide it when the source entry is terminal and has no next page or next hierarchy level. The subtitle/description area shows at most one visible line and truncates overflow; wrap the text with `Base.ToolTip` and pass the full description string as tooltip content, but show the tooltip only when the visible text is actually truncated or hidden. Tooltip display should have a short delay around `120ms` and use auto placement to stay inside the viewport and nearest scroll/clipping container.

If any related card on the current generated page/list requires more than one visible line of secondary/rich text, switch the entire card set for that page/list to `Layout.DescribeCard` with `Size=SM`. Do not mix `Game.ShowCard` and `Layout.DescribeCard` in that current card set only because one item is longer, but do not carry this choice into sibling second-level tabs or sibling secondary pages.

### Observed Secondary Large-Card Layout

The `SecondaryPageLargeCard` design node is `304:13409` and uses the default `1000 x 610` viewport. Use this layout only when the original secondary page is image-first or gallery-like and the source entries are best represented by large `Layout.DescribeCard` cards. Do not convert ordinary compact lists into this layout just because the template exists.

- Header: `x=0, y=0, w=1000, h=84`; desktop padding is `32px 32px 16px`.
- Body: `x=0, y=84, w=1000, h=526`.
- Breadcrumb reference: Body-relative `x=20, y=16, w=216, h=28`, absolute `x=20, y=100`; keep breadcrumbs reserved for final detail pages unless routing explicitly enables secondary breadcrumbs.
- Large-card list container: Body-relative `x=50, y=64, w=900, h=588`, absolute `x=50, y=148`.
- Plain large-card list with no secondary navigation and no breadcrumbs: use Body-relative `x=50, y=20, w=900` for the list region. Do not keep the `y=64` offset unless a breadcrumb row, secondary tab row, or other real top structure is rendered above it.
- Card grid without third-level navigation: default `grid-template-columns: repeat(4, 210px)`, card `w=210, h=284`, column gap `20`, row gap `20`. If the available content width cannot fit four 210px columns plus three 20px gaps, downgrade to `repeat(3, 210px)`. Do not reduce to three columns just because there are fewer than four items.
- Card x positions inside each row: `0`, `230`, `460`, `690`.
- Row y positions inside the list container: `0`, `304`.
- Single-row large-card alignment: when the selected `Layout.DescribeCard` LG/image-first card set renders only one row, vertically center the row inside the `h=588` list container. Use row `y=(588 - 284) / 2 = 152` instead of `y=0`; this alignment happens after column count selection and must not change the chosen `repeat(4, 210px)` or `repeat(3, 210px)` column template.
- `Layout.DescribeCard` image-first internals: card padding top/left/right `8`, bottom `12`; media area `w=200, h=200` with image content around `194 x 194`; content starts around `x=14, y=216`, title height `22`, description starts at `y=26` with `18px` line height.

Use this template as the layout for chosen large `Layout.DescribeCard` entries only. If the original page has richer text rows, compact cards, tables, filters, or tabs, keep the relevant placement reference from the matching template and choose the component family that fits the source content.

### Observed Secondary Multi-Nav Layout

The `SecondaryPageMultiNav` design node is `375:4979` and uses the default `1000 x 610` viewport. It is a modular placement reference for original source pages that need second-level tabs or third-level local navigation under the global first-level `Nav.TopBar`; it is not a required full-page data structure.

- Header: `x=0, y=0, w=1000, h=84`; desktop padding is `32px 32px 16px`.
- Body: `x=0, y=84, w=1000, h=526`.
- Secondary tab row: Body-relative `x=32, y=16, w=390, h=26`, absolute `x=32, y=100`.
- `Nav.SecondaryTab`: each tab is `w=60, h=26`, gap `6`, x positions `0`, `66`, `132`, `198`, `264`, `330`.
- Active tab: `State=Active`, text uses `var(--color-primary-base)`. Default tabs use `var(--color-text-weak)`.
- Content shell: Body-relative `x=32, y=62, w=936, h=480`, absolute `x=32, y=146`.
- `Nav.Navigate`: shell-relative `x=0, y=0, w=96, h=480`; right divider; internal list width `80`; padding right `16`, vertical padding `8`.
- Right card list: shell-relative `x=116, y=0, w=820, h=480`, leaving a `20px` gap after the navigation column.
- `Game.ShowCard` grid: 2 columns, card `w=406, h=76`, column gap `8`, row gap `8`.
- Row y positions: `0`, `84`, `168`, `252`, `336`, `420`. The sixth row overflows the 480px shell by `16px`; renderer should scroll or clip by host behavior rather than shrinking cards.

Use this template in parts:

- If the source page has second-level navigation only, use the `Nav.SecondaryTab` row placement and omit the `Nav.Navigate` sidebar.
- If the source page has second-level navigation plus real third-level groups or local anchors, use both the tab row and sidebar placement.
- If the source page content is best represented by the observed two-column `Game.ShowCard` list and every card subtitle/body fits within one visible line, use the right card-list coordinates.
- If the source page content is richer or structurally different, keep the matched navigation placement but choose the most suitable existing component family, such as `Layout.DescribeCard` or `Game.ShowCard`, according to the source page information density.
- Never fabricate third-level navigation, cards, badges, counts, or pagination just because they appear in the reference frame.

For a plain selected-category entry list with no second-level navigation, continue using the normal `SecondaryPage` rules above.

### Observed Detail Layout

Detail pages use `DetailPageLargeCardExpanded` (`304:17202`) as the default `1000 x 610` viewport reference. `DetailPageAllStates` (`304:9319`) is a tall `1000 x 1166` full-stack reference and must not replace the default generated canvas size.

- Shared detail header: `x=0, y=0, w=1000, h=84`; desktop padding is `32px 32px 16px`.
- Detail breadcrumbs: Body-relative `x=20, y=16, w=338, h=28`, absolute `x=20, y=96, w=338, h=28`. Each breadcrumb item hugs its rendered label text width; do not keep a fixed sample width for every item.
- Detail content: Body-relative `x=20, y=64, w=960`; absolute `x=20, y=144, w=960`.
- Visual scrollbar: Body-relative `x=980, y=60, w=12`; absolute `x=980, y=140, w=12`.
- Large-card hero: `HeroSection x=0, y=0, w=960, h=128`; `Layout.DescribeCard x=16, y=16, w=928, h=96`.
- Compact hero: `HeroSection x=0, y=0, w=960, h=108`; `Game.ShowCard x=16, y=16, w=928, h=76`.
- Section stack padding: `16`; vertical gap between detail sections: `20`.

For `DetailPageLargeCardExpanded`, `ExpandedSections` starts at detail-content `y=128`, `w=960, h=1084`:

- Attribute section: `x=16, y=16, w=928, h=154`.
- Related section: `x=16, y=190, w=928, h=208`; related row `x=0, y=62, w=928, h=76`; two cards `w=458, h=76`, gap `12`.
- Related detail row: `x=0, y=150, w=928, h=58`; items `w=214, h=42` at x `0`, `238`, `476`, `714`.
- Structured detail card: `x=16, y=418, w=928, h=328`.
- Extended section: `x=16, y=766, w=928, h=302`.

For `DetailPageAllStates`, `DetailSections` starts at detail-content `y=108`, `w=960, h=914`:

- Attribute section: `x=16, y=16, w=928, h=84`.
- Related section: `x=16, y=120, w=928, h=138`; first related card may be `Game.ProgressBarLabel`, second may be `Game.ShowCard`.
- Extra text-info section: `x=16, y=278, w=928, h=90`.
- Structured detail card: `x=16, y=388, w=928, h=258`.
- Extended section: `x=16, y=666, w=928, h=232`.

The detail hero card family follows the previous page card family. Attribute badge colors should preserve source tag classes; if the source has no colors, use one stable tone per tag class and different tones for different classes. Extended content renders only when the source has a matching rich text, media, canvas, table, or grouped extension block.

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

`Layout.DetailCard` title rows include a fixed internal decoration from Figma: a `var(--color-primary-base)` marker before the title text, visual size 1.5 x 14, inside a 20px-high horizontal title row with 6px gap. Treat it as component chrome; data mapping only supplies the title string.

Detail pages can be assembled from multiple `Layout.DetailCard` modules. Each module must contain a title plus at least one real optional content block. The optional internal blocks are data-driven: render description, feature cards, key-value info, status badges, table rows, media/aside, or approved child content only when the source section contains that shape. Preserve the source detail section order when stacking modules, but keep the page layout, card width, section gaps, vertical spacing, and scroll behavior aligned to the Figma detail templates.

Text-only blocks such as `home.summary` may remain region data until a confirmed shared component exists. Do not register a new component only to fill one text block unless it is confirmed in design and code.

## Data And State Rules

The Wiki datasource is not defined yet. Do not invent field names, category structures, route shapes, image paths, badge values, counts, progress values, attribute groups, table schemas, or rich-text blocks.

Use `TODO_FROM_DATASOURCE` for unresolved data:

- Wiki title in the two-segment '<game name>' + 'Wiki攻略' format, category count, and item count
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
- Do not treat a template page name as a command to reproduce every component in that page.
- Choose required regions and components from the original source page first; use Figma templates only to place the chosen components consistently.
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
