---
version: alpha-desktop
name: H5 Game Wiki Tool
source:
  figmaFile: fnA9NEBTDyxU94M0fvNy8e
  pageNode: 167:628
  homeNode: 477:3685
  secondaryListNode: 304:5972
  secondaryLargeCardNode: 304:13409
  detailLargeCardExpandedNode: 304:17202
  detailAllStatesNode: 304:9319
  guideDetailWithNavAndInfoNode: 304:18296
  guideDetailWithInfoNode: 306:4332
  guideDetailWithNavNode: 306:4716
description: A desktop Wiki utility for structured game reference pages, built from the shared H5 component registry, the Wiki page template, and the shared token export.
---

## Overview

The H5 Game Wiki Tool is an operational reference interface for browsing structured game information. It is not a marketing page, hero page, or decorative article layout.

The current Wiki contract covers desktop states only:

- Home: header, top summary banner, summary text, and top-level category grid.
- Secondary list: header and selected-category entry content, using the card family and layout variant that best matches the original source page.
- Detail: header, breadcrumbs, scrollable content, summary card, attributes, related cards, structured detail card, and optional extended content.
- Document guide detail: article-like guide pages with prose, media, metadata, optional left section anchors, and optional right related-info links.

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
- Home content follows Figma node `477:3685`: a `936 x 100` summary banner at Content `x=0, y=0`, PageSummary text inside the banner at `x=20, y=22`, then top-level categories in a four-column grid at Content `x=0, y=112`. The banner image is supplied by the current tool/game config; preview or missing-data states may use the configured placeholder only.
- Secondary list content uses a three-column card grid and pagination.
- Detail content may exceed the visible canvas height. The renderer owns real scrolling; `Layout.Scroll` only reflects scroll state visually. Use the actual scrollbar instance height as `trackHeight`; do not derive thumb position from content viewport height unless the track and viewport are intentionally the same size.
- Breadcrumbs render only on final detail pages unless a future routing contract explicitly enables secondary breadcrumbs. When rendered, `Nav.Breadcrumbs` sits in the first Body row at Body-relative `x=32, y=16, h=26`; text uses `12px/18px`; structured detail pages use `w=294`, document guide detail pages use `w=188`, and the content below starts at Body-relative `y=62`.

Do not reinterpret the Wiki canvas as a map canvas, marketing article page, or free-form HTML surface. Document guide article pages are allowed only through the `guide.document-detail` contract in `skill-pack/wiki/templates/wiki.json`.

Template pages are layout references, not mandatory data structures. First inspect the original source page to decide which regions and component families are actually needed, then apply the matching Figma layout rules for those chosen components. It is valid to use only part of a template page, such as a tab row, a large-card grid, or a detail stack, without rendering unrelated template regions.

Card hover is an interaction affordance, not decoration. Use hover styling only when a card can navigate, drill down, open a detail or modal, play media, expand, or otherwise reveal new information. If a card is display-only and cannot trigger anything, keep it in the default visual state even on pointer hover.

### Observed Secondary Layout

The `SecondaryPage` design node is `304:5972` and uses the default `1000 x 610` viewport.

- Header: `x=0, y=0, w=1000, h=84`; desktop padding is `32px 32px 16px`.
- Body: `x=0, y=80, w=1000, h=530`.
- Breadcrumb reference: `x=32, y=100, w=188, h=26` absolute, but this is reserved only. Generated secondary pages do not render breadcrumbs under the current contract.
- List container: `x=32, y=144, w=936, h=408` absolute.
- Plain list with no secondary navigation and no breadcrumbs: use Body-relative `x=32, y=20, w=936` for the list region. This applies when the source page has no second-level tab row, no third-level navigation, and no breadcrumb row above the list.
- Card grid: 3 columns x 4 visible design rows, card `w=306.6667, h=96`, column gap `8`, row gap `8`.
- Card x positions inside each row: `0`, `314.6667`, `629.3334`.
- Row y positions inside the list container: `0`, `104`, `208`, `312`.
- `Layout.DescribeCard` SM default component node `177:1104`: observed compact sample is `w=328, h=106`, but implementation height is content-adaptive unless a template explicitly asks for a fixed frame. Use padding `8`, horizontal gap `12`, nested `Base.Image` at `x=8, y=8, w=90, h=90`, content starts at `x=110, y=8, w=210`, and content vertical gap is `6`.
- `Layout.DescribeCard` image/media is a nested `Base.Image` component. Bind `imageSrc` and `imageRatio` to that nested component and do not create a separate raw image layer outside the DescribeCard component.
- `Layout.DescribeCard` SM subtitle structure: title/description group `w=210`, title row `h=22`, subtitle text starts at `x=0, y=26, w=210`, Body/SM `12px/18px`. The subtitle area height follows the rendered source text by default; do not clamp it to two lines unless the selected template or host container explicitly requires truncation. Use `Base.ToolTip` only when the rendered subtitle is actually truncated or hidden.
- `Layout.DescribeCard` optional regions are controlled by `showImage`, `showTitle`, `showDescription`, `showBadge`, and `showAttributes`. Derive these flags from actual source fields and the selected presentation. When a flag is false, omit that region and collapse its spacing; if both `showTitle=false` and `showBadge=false`, omit the whole title row.
- Pagination: Body-relative `x=0, y=482, w=1000, h=64`, absolute `x=0, y=562, w=1000, h=64`.

Choose `Game.ShowCard` only when it fully represents the source entry and every entry subtitle/body in the current rendered card set fits within one visible line. If a source entry has paragraph-like content or needs more than one visible line, this is not a `Game.ShowCard` case; use `Layout.DescribeCard` so the card height can adapt to the text. The current card set is scoped to the active secondary tab plus optional active third-level group, not the whole first-level category. Choose `Game.ShowCard variant=voice` when the source entry's primary content is playable audio, such as character voice lines, pronunciation, narration, or sound clips. Choose compact `Layout.DescribeCard` when the source entry needs richer inline description, image, badge, or meta fields. Pagination total pages must come from backend data in production output.

For any Wiki card set that renders `imageSrc`, inspect the source asset dimensions or the visible content type in the current rendered page/list before choosing the image frame. Use `Base.Image` ratio `1:1` for square icons or near-square art. Use `4:5` for vertical portraits, character/card art, posters, and other portrait-like assets around width/height `0.8`. Use `3:2` or `16:9` for wide source assets such as weapons, equipment thumbnails, maps, screenshots, landscapes, and banners. Keep one ratio within the current page/list when visual consistency is needed, but re-evaluate the ratio for each sibling second-level tab or secondary page; do not reuse a wider or vertical ratio from one tab on another tab whose assets are better represented as `1:1`.

For `Game.ShowCard`, the right arrow is a drill-down affordance, not decoration. Hide it when the source entry is terminal and has no next page or next hierarchy level. The `voice` state uses the Figma node `434:3632`, size `498 x 58`, and renders a left play/pause icon, title, right time label, and bottom playback progress bar; bind `audioSrc` and `durationLabel` from source/audio metadata and bind `currentTimeLabel`, `progress`, and `isPlaying` from renderer playback state. The subtitle/description area shows at most one visible line and truncates overflow; wrap the text trigger with `Base.ToolTip` and pass the full description string as tooltip content, but show the tooltip only when the visible text is actually truncated or hidden. Tooltip bubble display must use a page/body-level portal overlay, not a child inside the card/list row, so it cannot be clipped by `overflow: hidden`, scroll containers, or small hover containers. Tooltip display should have a short delay around `120ms` and use auto placement to stay inside the viewport.

### Observed Modal Overlay

Use `Base.Modal` only when the original source page uses a modal overlay to explain a single selected item or to present video source material. Do not use it to replace normal detail pages, card descriptions, tooltip disclosure, or map popups.

- Figma component frame: `438:3663`, design name `Base / Modal / Default`; repo contract name `Base.Modal`.
- Overlay: cover the current Wiki page with `#000000` at `50%` opacity.
- Detail variant: Figma `Property=Detail` node `436:5415`, panel `w=381`, `max-height=484`, background `#11161B`, radius `12`, no outer stroke. Header content is optional centered `100 x 100` image/icon, title `16px/24px` bold `#F5F7FA`, and optional subtitle `12px/18px` `#AEB6BE`. Missing optional fields collapse their spacing. The lower explanation box is the max-visible text area, `w=357`, default `max-height=256`, padding `8`, 1px `#FFFFFF` @ `10%` stroke, radius `8`, text `14px/20px` `#AEB6BE`; bind the full explanation text and scroll only this description area if text exceeds the max height.
- Modal close button: `x=341, y=12, w=28, h=28`, radius `6`, fill `#FFFFFF` @ `12%`, close icon `#7E8994`.
- Video variant: Figma `Property=Vedio` node `438:3662`, panel `w=381, h=290`. Use code `variant="video"` for this state. It contains a `357 x 238` video area at `x=12, y=40` with a centered play icon. Bind `videoSrc`, optional `posterSrc`, and `videoTitle`; do not render title, subtitle, or description unless the source video modal explicitly has separate text outside the video.
- Template usage: `modal.item-explanation` is an overlay state above the current page. The underlying page keeps its own chosen template and component layout.

If any related card on the current generated page/list requires more than one visible line of secondary/rich text, switch the entire card set for that page/list to `Layout.DescribeCard` with `Size=SM` and allow card height to follow the rendered text. Do not mix `Game.ShowCard` and `Layout.DescribeCard` in that current card set only because one item is longer, but do not carry this choice into sibling second-level tabs or sibling secondary pages.

### Observed Secondary Large-Card Layout

The `SecondaryPageLargeCard` design node is `304:13409` and uses the default `1000 x 610` viewport. Use this layout only when the original secondary page is image-first or gallery-like and the source entries are best represented by large `Layout.DescribeCard` cards. Do not convert ordinary compact lists into this layout just because the template exists.

- Header: `x=0, y=0, w=1000, h=84`; desktop padding is `32px 32px 16px`.
- Body: `x=0, y=84, w=1000, h=526`.
- Breadcrumb reference: Body-relative `x=32, y=16, w=188, h=26`, absolute `x=32, y=100`; keep breadcrumbs reserved for final detail pages unless routing explicitly enables secondary breadcrumbs.
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

### Observed Document Guide Detail Layout

The document guide detail templates are a special Wiki detail family for article-like guides, walkthroughs, and prose documents. They are not normal structured item detail pages. Ask AI to locate them with: `document-guide-detail`, `guide.document-detail`, `文档攻略类`, `图文攻略`, `GuideDetailWithNavAndInfo`, `GuideDetailWithInfo`, or `GuideDetailWithNav`.

Choose the layout from source data:

- `GuideDetailWithNavAndInfo` (`304:18296`): use when the source has both local article section anchors and right-side related information links.
- `GuideDetailWithInfo` (`306:4332`): use when the source has related information links but no local section anchors.
- `GuideDetailWithNav` (`306:4716`): use when the source has local article section anchors but no related information links.
- If the source has neither anchors nor related links, keep the article content structure and omit both side modules rather than fabricating them.

Shared layout:

- Header: `x=0, y=0, w=1000, h=84`; uses the shared `Nav.Header`, `Nav.TopBar`, and `Form.SearchBar`.
- Body: `x=0, y=84, w=1000, h=526`.
- Breadcrumbs: Body-relative `x=32, y=16, w=188, h=26`; absolute `x=32, y=100` when Body.y is `84`; labels are clickable, item width hugs text, and text uses `12px/18px`.
- `ArticleLayout`: Body-relative `x=32, y=62, w=936`, horizontal layout `gap=20`.
- `ArticleContent`: vertical layout, `gap=12`, no padding. It contains `TitleRow`, `MetaRow`, `ArticleBody`, and optional `RelatedContentSection`.

Variant layout:

- With nav and info: `Nav.Navigate x=0, y=0, w=96, h=607.9389`; `ArticleContent x=116, y=0, w=540, h=607.9389`; `RelatedInfoSidebar x=676, y=0, w=260, h=204`.
- With info only: `ArticleContent x=0, y=0, w=656, h=607.9389`; `RelatedInfoSidebar x=676, y=0, w=260, h=204`.
- With nav only: `Nav.Navigate x=0, y=0, w=96, h=576`; `ArticleContent x=116, y=0, w=820, h=576`.

Article content:

- `TitleRow`: `x=0, y=0, h=20`, horizontal `gap=4`. Use the source guide title; the sample split of game name plus `图文攻略` is only a template example.
- `MetaRow`: `x=0, y=32, h=20`, horizontal `gap=4`. Bind source metadata such as category count, item count, date, author, or update time only when present.
- `ArticleBody`: starts at `x=0, y=64`, vertical `gap=8`. Article images keep the datasource image aspect ratio; only constrain rendered image height with `max-height: 230px`. The Figma `402 x 226` image is a sample, not a forced `16:9` rendering rule. Paragraph text spans the current `ArticleContent` width with `12px/18px` text.
- `RelatedContentSection`: optional article extension at `x=0, y=382, h=226`, background `var(--color-alpha-white-alpha-2)`. Render only when source has related prose, embedded media, or an extra article block.

Side modules:

- Left `Nav.Navigate` is for real article anchors only. It uses width `96`, vertical padding `8`, right padding `16`, and a right divider. Do not use it for related links.
- Right `RelatedInfoSidebar` has title frame `h=36` with text inset `8`; the title frame must draw a `1px` bottom divider at `y=36`, `w=260`, using `var(--color-stroke-area)` / `rgba(255,255,255,0.10)`. The related list starts at `y=44`, `w=260, h=160`, item `h=34`, list gap `8`.
- Related info list items use `Nav.CommandMenuItem`, `w=260, h=34`, optional badge, and right arrow. They must be bound to real related-info links.

### Observed Detail Layout

Detail pages use `DetailPageLargeCardExpanded` (`304:17202`) as the default `1000 x 610` viewport reference. `DetailPageAllStates` (`304:9319`) is a tall `1000 x 1166` full-stack reference and must not replace the default generated canvas size.

- Shared detail header: `x=0, y=0, w=1000, h=84`; desktop padding is `32px 32px 16px`.
- Detail breadcrumbs: Body-relative `x=32, y=16, w=294, h=26`, absolute `x=32, y=100, w=294, h=26`. Each breadcrumb item hugs its rendered label text width and uses `12px/18px`; do not keep a fixed sample width for every item.
- Detail content: Body-relative `x=20, y=62, w=960`; absolute `x=20, y=146, w=960`.
- DetailContent chrome is special and must be preserved: background `var(--color-bg-black)` / `#000306`, 1px inside stroke `var(--color-stroke-area)` / `rgba(255,255,255,0.10)`, radius `8`, and `clipsContent=true`.
- DetailContent itself has vertical layout with `padding=0` and `gap=0`. `HeroSection` uses `padding=16` and `gap=10`; `DetailSections` / `ExpandedSections` use `padding=16` and vertical `gap=12`.
- Visual scrollbar: Body-relative `x=980, y=60, w=12`; absolute `x=980, y=144, w=12`.
- Large-card hero: `HeroSection x=0, y=0, w=960, h=120`; `Layout.DescribeCard x=16, y=16, w=928, h=88`.
- Compact hero: `HeroSection x=0, y=0, w=960, h=108`; `Game.ShowCard x=16, y=16, w=928, h=76`.
- Section stack padding: `16`; vertical gap between detail sections: `12`. These section offsets are inside the clipped DetailContent shell and should not replace the shell's own border/radius rules.

For `DetailPageLargeCardExpanded`, `ExpandedSections` starts at detail-content `y=120`, `w=960, h=1084`:

- Attribute section: `x=16, y=16, w=928, h=154`.
- Related section: `x=16, y=182, w=928, h=208`; related row `x=0, y=62, w=928, h=76`; two cards `w=458, h=76`, gap `12`.
- Related detail row: `x=0, y=150, w=928, h=58`; items `w=214, h=42` at x `0`, `238`, `476`, `714`.
- Structured detail card: `x=16, y=402, w=928, h=328`.
- Extended section: `x=16, y=742, w=928, h=302`.

For `DetailPageAllStates`, `DetailSections` starts at detail-content `y=108`, `w=960, h=914`:

- Attribute section: `x=16, y=16, w=928, h=84`.
- Related section: `x=16, y=112, w=928, h=138`; first related card may be `Game.ProgressBarLabel`, second may be `Game.ShowCard`.
- Extra text-info section: `x=16, y=278, w=928, h=90`.
- Structured detail card: `x=16, y=364, w=928, h=258`.
- Extended section: `x=16, y=634, w=928, h=232`.

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
- `Nav.CommandMenuItem`
- `Layout.DescribeCard`
- `Game.ShowCard`
- `Layout.Scroll`
- `Layout.DetailCard`
- `Game.ProgressBarLabel`
- `Game.ProgressBar`
- `Base.Image`
- `Base.Modal`
- `Base.Badge`
- `Nav.Pagination`
- `Data.TableHeaderCell`
- `Data.TableRowCell`

`Layout.DetailCard` title rows include a fixed internal decoration from Figma: a `var(--color-primary-base)` marker before the title text, visual size 1.5 x 14, inside a 20px-high horizontal title row with 6px gap. Treat it as component chrome; data mapping only supplies the title string.

Detail pages can be assembled from multiple `Layout.DetailCard` modules. Each module must contain a title plus at least one real optional content block. The optional internal blocks are data-driven: render description, feature cards, key-value info, status badges, table columns and rows, media/aside, or approved child content only when the source section contains that shape. Preserve the source detail section order when stacking modules, but keep the page layout, card width, section gaps, vertical spacing, and scroll behavior aligned to the Figma detail templates.

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
- document guide article title, metadata, main media, paragraphs, local anchors, and related-info links
- breadcrumb labels and target routes

Missing optional fields should collapse the related UI element instead of showing fabricated placeholder content in final output.

Pagination state may come from datasource or renderer state. It must not come from hardcoded sample values.

Detail tables must use structured columns and rows when that data exists. `Data.TableHeaderCell` and `Data.TableRowCell` are reusable cells, not a fixed table layout: repeat one header cell per source column and one row cell per source row/column cell. The renderer sets the table grid columns from the source schema with compressible tracks such as `minmax(0, 1fr)`; do not hardcode a fixed number of rows or columns, do not set fixed `928px` table width or horizontal scrolling for character detail intimacy tables, and do not encode table data as plain rich text when table structure is available.

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
