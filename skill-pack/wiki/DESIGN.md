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
- `Layout.DescribeCard` sizing: the component default must hug its own rendered content. If the selected page template, card grid, fixed viewport, or explicit host layout provides a card width/height/grid track, that page-level sizing takes priority over the component's natural size.
- `Layout.DescribeCard` SM default: use padding `8`, horizontal gap `12`, default content column `w=186`, and content vertical gap `6`. The nested `Base.Image` keeps its aspect ratio with a `100px` natural image box by default. A page may explicitly override the image size for larger SM item art, but the image must not stretch just because the card row becomes taller.
- `Base.Image` owns the image placement area. Its outer frame follows the selected ratio and the caller/page size, but the actual image slot is inset by `4px` on every side to match Figma: `1:1` default outer `80x80` -> image slot `72x72`, `3:2` outer `120x80` -> `112x72`, `16:9` outer `142x80` -> `134x72`, `4:5` outer `64x80` -> `56x72`. Do not let the source image cover the full background frame unless a future design update removes this inset.
- `Layout.DescribeCard` image/media is a nested `Base.Image` component. Bind `imageSrc`, `imageRatio`, and `imageFit` to that nested component and do not create a separate raw image layer outside the DescribeCard component. For `Size=SM`, preserve aspect ratio using the component's natural image box unless the page explicitly overrides the image size; for `Size=LG`, preserve aspect ratio and horizontally fill the card/image width. Use `imageFit="contain"` for weapons, attachments, commodity thumbnails, and other item art that must remain fully visible.
- `Layout.DescribeCard` SM subtitle structure: title/description group default `w=186`, title row `h=22`, subtitle text starts at `x=0, y=26`, Body/SM `12px/18px`. The subtitle area height follows the rendered source text by default; do not clamp it to two lines unless the selected template or host container explicitly requires truncation. Use `Base.ToolTip` only when the rendered subtitle is actually truncated or hidden.
- `Layout.DescribeCard` optional regions are controlled by `showImage`, `showTitle`, `showDescription`, `showBadge`, `showBadgeGroup`, and `showAttributes`. Derive these flags from actual source fields and the selected presentation. When a flag is false, omit that region and collapse its spacing; if both `showTitle=false` and `showBadge=false`, omit the whole title row.
- Pagination: Body-relative `x=0, y=482, w=1000, h=64`, absolute `x=0, y=562, w=1000, h=64`.

Choose `Game.ShowCard` only when it fully represents the source entry and every entry subtitle/body in the current rendered card set fits within one visible line. If a source entry has paragraph-like content or needs more than one visible line, this is not a `Game.ShowCard` case; use `Layout.DescribeCard` so the card height can adapt to the text. The current card set is scoped to the active secondary tab plus optional active third-level group, not the whole first-level category. Choose `Game.ShowCard variant=voice` when the source entry's primary content is playable audio, such as character voice lines, pronunciation, narration, or sound clips. Choose compact `Layout.DescribeCard` when the source entry needs richer inline description, image, badge, or meta fields. Pagination total pages must come from backend data in production output.

For any Wiki card set that renders `imageSrc`, inspect the source asset dimensions or the visible content type in the current rendered page/list before choosing the image frame. Use `Base.Image` ratio `1:1` for square icons or near-square art. Use `4:5` for vertical portraits, character/card art, posters, and other portrait-like assets around width/height `0.8`. Use `3:2` or `16:9` for wide source assets such as weapons, equipment thumbnails, maps, screenshots, landscapes, and banners. Keep one ratio within the current page/list when visual consistency is needed, but re-evaluate the ratio for each sibling second-level tab or secondary page; do not reuse a wider or vertical ratio from one tab on another tab whose assets are better represented as `1:1`.

For `Game.ShowCard`, the right arrow is a drill-down affordance, not decoration. Hide it when the source entry is terminal and has no next page or next hierarchy level. The `voice` state uses the Figma node `434:3632`, size `498 x 58`, and renders a left play/pause icon, title, right time label, and bottom playback progress bar; bind `audioSrc` and `durationLabel` from source/audio metadata and bind `currentTimeLabel`, `progress`, and `isPlaying` from renderer playback state. The subtitle/description area shows at most one visible line and truncates overflow; wrap the text trigger with `Base.ToolTip` and pass the full description string as tooltip content, but show the tooltip only when the visible text is actually truncated or hidden. Tooltip bubble display must use a page/body-level portal overlay, not a child inside the card/list row, so it cannot be clipped by `overflow: hidden`, scroll containers, or small hover containers. Tooltip visual style follows Figma node `385:6113`: `12px/18px` text, `12px` horizontal padding, `8px` vertical padding, `12x6` tail, and 8 Type values whose names describe the tail edge/anchor. Tooltip display should have a short delay around `120ms` and use auto placement to stay inside the current wiki page shell and viewport.

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
- Card grid without third-level navigation: default `grid-template-columns: repeat(4, 214px)`, card natural width `214` for the current `LG` 3:2 image-first structure, column gap `20`, row gap `20`. If the page template explicitly requires a different grid track or fixed card size, that page-level requirement overrides the component's natural hug size. If the available content width cannot fit four columns plus gaps, downgrade to three columns. Do not reduce to three columns just because there are fewer than four items.
- Card x positions inside each row for the default 214px natural card width: `0`, `234`, `468`, `702`.
- Row y positions inside the list container for the default 286px natural card height: `0`, `306`.
- Single-row large-card alignment: when the selected `Layout.DescribeCard` LG/image-first card set renders only one row, vertically center the row inside the `h=588` list container. Use row `y=(588 - 286) / 2 = 151` instead of `y=0`; this alignment happens after column count selection and must not change the chosen column template.
- `Layout.DescribeCard` image-first internals: card padding top/left/right `8`, bottom `12`; default content/media width is `198`; media keeps its source ratio and fills horizontally, so a wide `3:2` item image renders as `198 x 132`. Content starts after an `8px` vertical gap, title height `22`, description starts at `y=26` with `18px` line height.

Use this template as the layout for chosen large `Layout.DescribeCard` entries only. If the original page has richer text rows, compact cards, tables, filters, or tabs, keep the relevant placement reference from the matching template and choose the component family that fits the source content.

### Observed Secondary Multi-Nav Layout

The `SecondaryPageMultiNav` design node is `375:4979` and uses the default `1000 x 610` viewport. It is a modular placement reference for original source pages that need second-level tabs or third-level local navigation under the global first-level `Nav.TopBar`; it is not a required full-page data structure.

- Header: `x=0, y=0, w=1000, h=84`; desktop padding is `32px 32px 16px`.
- Body: `x=0, y=84, w=1000, h=526`.
- Secondary tab row: Body-relative `x=32, y=16, w=390, h=26`, absolute `x=32, y=100`.
- `Nav.SecondaryTab`: each tab is `w=60, h=26`, gap `6`, x positions `0`, `66`, `132`, `198`, `264`, `330`.
- Active tab: `State=Active`, text uses `var(--color-primary-base)`. Default tabs use `var(--color-text-weak)`.
- Content shell: Body-relative `x=32, y=62, w=936, h=480`, absolute `x=32, y=146`.
- `Nav.Navigate`: Figma component set is `Nav / Navigate / Default`, with `Orientation=Vertical` and `Orientation=Horizontal` variants. Desktop uses `orientation="vertical"` at shell-relative `x=0, y=0, w=96, h=480`; right divider; internal list width `80`; padding right `16`, vertical padding `8`.
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

- With nav and info: `Nav.Navigate x=0, y=0, w=96, h=607.9389`; `ArticleContent x=116, y=0, w=540, h=607.9389`; `RelatedInfoSidebar x=676, y=0, w=260`. The current Figma sample happens to be `h=204`, but that is not a fixed maximum when more related links exist.
- With info only: `ArticleContent x=0, y=0, w=656, h=607.9389`; `RelatedInfoSidebar x=676, y=0, w=260`. The current Figma sample happens to be `h=204`, but that is not a fixed maximum when more related links exist.
- With nav only: `Nav.Navigate x=0, y=0, w=96, h=576`; `ArticleContent x=116, y=0, w=820, h=576`.

Article content:

- `TitleRow`: `x=0, y=0, h=20`, horizontal `gap=4`. Use the source guide title; the sample split of game name plus `图文攻略` is only a template example.
- `MetaRow`: `x=0, y=32, h=20`, horizontal `gap=4`. Bind source metadata such as category count, item count, date, author, or update time only when present.
- `ArticleBody`: starts at `x=0, y=64`, vertical `gap=8`. Article images keep the datasource image aspect ratio; only constrain rendered image height with `max-height: 230px`. The Figma `402 x 226` image is a sample, not a forced `16:9` rendering rule. Paragraph text spans the current `ArticleContent` width with `12px/18px` text.
- `RelatedContentSection`: optional article extension at `x=0, y=382, h=226`, background `var(--color-alpha-white-alpha-2)`. Render only when source has related prose, embedded media, or an extra article block.

Side modules:

- Left `Nav.Navigate` is for real article anchors only. It uses width `96`, vertical padding `8`, right padding `16`, and a right divider. Do not use it for related links.
- Right `RelatedInfoSidebar` has title frame `h=36` with text inset `8`; the title frame must draw a `1px` bottom divider at `y=36`, `w=260`, using `var(--color-stroke-area)` / `rgba(255,255,255,0.10)`. The related list starts at `y=44`, `w=260`, item `h=34`, list gap `8`. The observed sample shows `h=160` for four visible rows, but that is only an example; if the datasource has more related-info links, continue stacking rows downward and grow the sidebar instead of truncating at four.
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

Use the mobile Wiki layout when the rendered page width is `<600px`. Use the desktop Wiki layout when the rendered page width is `>=600px`. Do not use the old `767px` breakpoint for Wiki pages unless a host product explicitly overrides the Wiki contract.

The observed mobile Wiki frames use a `375 x 812` reference viewport, but implementation must adapt to the actual viewport. Treat `375 x 812` as the design reference, not a hardcoded production size. Below `600px`, the Wiki page root/frame must fill the available host container or browser viewport width (`width: 100%`, bounded by the actual screen/container), and reference widths such as `351`, `335`, or `319` are derived from the 375px sample by its insets. They must become `calc(100% - inset)` or `width: 100%` inside the actual mobile container rather than fixed production widths. The root/frame must not lock the mobile page root/frame to the 812px Figma sample height; use `min-height: 100vh` with `height: auto` so long content can extend and scroll.

Mobile template pages are adaptation references, not replacement pages. If a host Wiki page has already made product-specific adjustments on top of the desktop template, preserve its source-driven structure, component choices, field order, hidden or added details, and real data. Below `600px`, adapt that existing page with the mobile template's layout methods: mobile shell behavior, `12px` side insets, single-column stacking, horizontal-scrolling tabs/nav, mobile typography, mobile card widths, image behavior, and mobile visibility rules. Do not discard the customized page and do not inject, reorder, or remove business details solely because the observed mobile reference shows a different sample structure.

Below `600px`, mobile Wiki pages do not show scrollbar chrome. Keep real vertical or horizontal scrolling where content overflows, but hide native scrollbars and do not render `Layout.Scroll` visual scrollbar instances. Mobile pages also do not render hover visual states: ignore `:hover`, `state=hover`, `--hover`, and `--state-hover` presentation for cards, navigation, command items, pagination, breadcrumbs, modal close buttons, tooltips, and similar UI. Keep selected, active, focus-visible, pressed, and open states because those represent actual interaction state, not hover. Do not rely on hover-only `Base.ToolTip` disclosure for required mobile information; expose important text in visible layout, tap/open state, or the destination page instead.

Observed mobile source nodes:

- `WikiHome-mobile`: `577:8639`
- `WikiHome-mobile` with primary-nav menu panel: `590:9117`, menu panel node `590:9324`
- `SecondaryPageSimpleInfo-mobile`: `590:10341`
- `SecondaryPage-mobile`: `590:10708`
- `SecondaryPageLargeCard-mobile`: `590:9357`
- `SecondaryPageMultiNav-mobile`: `590:10996`
- `DetailPageAllStates-mobile`: `624:4277`
- Document/article detail mobile: `624:6596`
- Mobile detail modal: `624:7298`

### Mobile Shell

- Mobile pages use `MobileHeader x=0, y=0, w=375, h=92` only as reference chrome. In production, the mobile header and page frame fill the actual container/viewport width, not a fixed 375px width. This is not a new shared component in the current package; treat it as Wiki mobile shell structure until a formal component is approved.
- When the host/product titlebar is outside the Wiki surface, do not recreate that white titlebar inside the Wiki page. The dark Wiki content shell owns an internal mobile action bar at `h=68`, but the visible action row starts `12px` from the page top and follows Figma node `694:3658`: reference row `w=351, h=36`, left title text at `x=12, y=4, h=28`, and a right-aligned primary-menu icon button at `x=315, y=0, w=36, h=36`. On non-home pages, the left title is the active first-level page name, such as `角色` after entering from the home page role card. On the mobile home page, do not render a left title in this action row. Do not render a left search icon button. The desktop `Nav.TopBar` strip and desktop `Form.SearchBar` input are hidden in this mobile shell.
- When the full Figma mobile header is owned by the Wiki surface, main content starts at reference `y=104` with a `12px` left/right inset. When the host/product titlebar is outside the Wiki surface, the embedded dark Wiki shell content starts below the internal action bar at `y=68`; do not add another page-level top inset before the first secondary tab row. The 375px reference content width is `351px`, but production content width is `calc(100% - 24px)` inside the actual mobile page width.
- Use `PingFang SC, Microsoft YaHei UI, sans-serif` for mobile Wiki typography. The primary observed mobile font is `PingFang SC`.
- The right header menu opens the first-level navigation menu shown by node `590:9324`. In the embedded dark Wiki shell, the panel opens below the internal action bar at `top=68` and covers the remaining Wiki shell with a dark overlay. It carries the same datasource and active state as desktop `Nav.TopBar`; do not invent separate mobile menu items.
- The mobile primary menu list uses the mobile content column (`12px` side inset; reference `w=351`). Menu rows are touch rows with `min-height=56`, large left-aligned labels, and the active row uses the brand gradient/underline treatment from the reference instead of the desktop TopBar active pill.
- Mobile document/article detail does not render the desktop left anchor navigation or right related-info sidebar. Do not show those side modules on mobile unless a future mobile design explicitly defines their placement.
- Mobile scroll containers should set scrollbar chrome to hidden while preserving touch scroll; horizontal mobile nav rows still scroll when content overflows, but no scrollbar is visible.

### Mobile Typography

- Mobile page summary title: `20px/28px`, `PingFang SC Bold`.
- Mobile header/titlebar title: `16px/22px`, `PingFang SC Semibold`.
- Mobile secondary tabs and top nav labels: `14px/20px`, active/default weight from the Figma instance, commonly `PingFang SC Bold` for tab labels.
- Mobile category card title: `16px/24px`, `PingFang SC Bold`; category description: `14px/20px`, `PingFang SC Regular`; count badge: `12px/14px`.
- Mobile `Game.ShowCard` title: `16px/24px`, `PingFang SC Bold`; description: `14px/20px`, `PingFang SC Regular`; badge: `12px/14px`.
- Mobile `Layout.DescribeCard` SM title: `14px/20px`, `PingFang SC Regular`; description: `12px/18px`, `PingFang SC Regular`; badges/meta: `12px/14px`.
- Mobile `Layout.DescribeCard` LG title: `16px/24px`, `PingFang SC Bold`; description: `14px/20px`, `PingFang SC Regular`; badges: `12px/14px`.
- Mobile structured detail and document paragraphs use `14px/20px`, `PingFang SC Regular`, unless a nested component has a more specific text rule.

### Mobile Home

- Home content uses a single-column vertical layout inside `x=12, y=104, w=351` on the 375px reference; production width fills the mobile page content area (`calc(100% - 24px)`).
- In the generated embedded Wiki home, the content scroll area starts below the internal `68px` action bar when the external host/titlebar is not part of the Wiki surface. Keep the home banner and category cards aligned to the same `12px` side inset as the action bar buttons.
- Page summary sits at `x=34, y=174, w=166, h=56` in the observed state.
- `Game.CategoryCard` cards render as a single column at reference `w=351, h=114`, with `12px` vertical row gap and a `1px` border using `var(--color-stroke-area)` in the observed layout. In production, each card uses `width: 100%` of the mobile content column.
- Mobile home keeps the top image frame inside the content column, but uses a mobile-specific summary/banner image asset rather than reusing the desktop/global top background image. The image fills the banner frame with `background-size: cover` and stays scoped to the home page below `600px`.
- Do not use the desktop four-column category grid on mobile.

For non-home Wiki pages below `600px`, do not render the global top/bottom background image pseudo-element. Other pages keep the dark shell and their own content, but the desktop/global `wiki-global-top-bg` artwork is disabled on mobile only.

### Mobile Secondary Pages

- Secondary tabs are horizontal-scroll rows. Use `x=12, y=152, h=36` on the 375px reference viewport. Node `590:11004` shows the row as reference `w=351, h=36`, horizontal gap `6`, no wrapping. Each `Nav.SecondaryTab` is hug-content with `h=36`, padding `8px 12px`, radius `4`, and a `1px` border using `var(--color-stroke-area)` in both default and active states; active tabs use `var(--color-primary-base)` for text only, not for the border. Typical observed widths are `52px`, `80px`, and `136px` depending on label length. Do not wrap tabs to multiple lines.
- `SecondaryPageSimpleInfo-mobile` uses single-column `Game.ShowCard` rows at reference `w=351, h=76`, row gap `12px`; production rows fill the mobile content column.
- `SecondaryPage-mobile` uses single-column `Layout.DescribeCard Size=SM` rows at reference `w=351, h=106`, row gap `12px`; production rows fill the mobile content column.
- `SecondaryPageLargeCard-mobile` uses single-column `Layout.DescribeCard Size=LG` rows at reference `w=351`; the observed `16:9` image frame is `335 x 188.44`, while square image-first items may use `335 x 335`. In production, the card and media width fill the mobile content column after its internal padding. Mobile changes stacking and responsive width only; preserve the `imageRatio` / `imageFit` already selected for the same current PC page/list. If the PC list uses `imageRatio="1:1"`, the mobile image must stay square and must not be forced to the `16:9` reference sample.
- `SecondaryPageMultiNav-mobile` keeps second-level tabs horizontal-scroll and replaces the desktop left sidebar with a horizontal mobile `Nav` row. The observed local nav row is `x=12, y=200, w=448, h=32` and may overflow horizontally; allow horizontal scroll and do not wrap.

### Mobile Detail And Article Pages

- Mobile structured detail content uses `x=12, y=152, w=351` for the main detail content shell on the 375px reference; production shell width is `calc(100% - 24px)`. Do not render desktop breadcrumbs on mobile; use the mobile header back/title pattern instead.
- Mobile `DetailContent` stacks vertically. The observed hero card is `Game.ShowCard w=319, h=76` inside `x=28, y=168`; detail modules use reference `Layout.DetailCard w=319` with content-driven height. In production, these inner cards fill the actual detail content width after the observed inset.
- Detail tables must fit the mobile detail card width. Use compressible column tracks and repeat `Data.TableHeaderCell` / `Data.TableRowCell` from structured table data. Do not preserve desktop fixed table width such as `928px`.
- Mobile document/article detail uses reference `ArticleContent x=12, y=152, w=351`; article body blocks use reference `x=24, w=327`. Production article content fills `calc(100% - 24px)`, and article body blocks fill the article content after their internal inset. Paragraph text is `14px/20px`. Desktop left anchors and right related-info links are not rendered on mobile.

### Mobile Modal

- Mobile `Base.Modal` detail state is observed in node `624:7298`: overlay over `375 x 812`, panel `x=20, y=210, w=335, h=464`.
- Mobile detail modal image uses `Base.Image Ratio=1:1` at `80 x 80`.
- Mobile modal keeps the lower description area scrollable for internal overflow, but scrollbar chrome remains hidden and `Layout.Scroll` is not rendered below `600px`.
- Mobile video modal is not defined yet. Keep `variant=video` mobile placement as `TODO_FROM_FIGMA_OR_IMPLEMENTATION` until the video mobile Figma state is added.

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
- mobile video modal layout
- real page output example
- Wiki-specific output schema

Add them only after the relevant design, datasource, or implementation input is available.
