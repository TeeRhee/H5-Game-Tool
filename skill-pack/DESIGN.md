---
version: alpha-mobile
name: H5 Game Map Tool
source:
  figmaFile: fnA9NEBTDyxU94M0fvNy8e
  desktopNode: 58:1896
  mobileNode: 214:3308
description: A compact game map utility with desktop and mobile layout rules, built from the approved H5 component registry and the latest token export.
---

## Overview

The H5 Game Map Tool is an operational interface for exploring dense game-world data. It is not a marketing page, hero page, or decorative card layout. The map experience is driven by a standardized map package, fixed component contracts, and design tokens.

The desktop layout keeps the map canvas full-window under overlay controls. The mobile layout uses the same data model and component registry, but replaces the left desktop sidebar with a bottom sheet over the map.

## Token Source

Use `design-system-pack/tokens.css` as the source of truth for color, radius, spacing, and typography variables. Do not hardcode local color values when a semantic token exists.

Use semantic tokens first:

- Backgrounds: `--color-bg-black`, `--color-bg-soft`, `--color-bg-sub`, `--color-bg-alpha-weak`, `--color-bg-reverse`
- Text: `--color-text-strong`, `--color-text-sub`, `--color-text-soft`, `--color-text-disabled`
- Icons: `--color-icon-strong`, `--color-icon-sub`, `--color-icon-soft`, `--color-icon-disabled`
- Stroke: `--color-stroke-sub`, `--color-stroke-active`, `--color-stroke-soft`
- Brand/action: `--color-primary-base`, `--color-primary-dark`
- Type: `--type-font-family-primary`, `--type-size-100`, `--type-size-200`, `--type-size-300`, `--type-line-height-25`, `--type-line-height-200`, `--type-line-height-300`

If a mobile-specific type token is present in a future token export, mobile renderers should prefer it for mobile shell and bottom-sheet text. If the token is absent, fall back to `--type-font-family-primary`, `--type-size-200`, and `--type-line-height-200`.

## Desktop Layout

The desktop tool viewport is `1160 x 800`.

- `map.canvas` is `x=0, y=0, w=1160, h=800` and sits behind all overlays.
- The left panel is `x=12, y=12, w=264, h=776`, radius `8px`.
- The map image/content area observed in the latest contract is `x=421, y=46, w=529, h=708`.
- Zoom controls sit at `x=1112, y=12, w=36, h=64`.
- The detail card is fixed to the lower-right at `x=868, y=522, w=280, h=266`.
- The bottom action area clears search text and all active filters.

Do not reinterpret `map.canvas` as only the visible right-side area. It is the full map layer under the sidebar and footer overlays.

## Mobile Layout

The mobile reference node is `MobileMapDefaultScreen`, `375 x 812`.

- `MobileHeader` is `x=0, y=0, w=375, h=92`. It is shell chrome and should be rendered by the host app when available.
- `MapCollectionModal` is `x=0, y=92, w=375, h=720`.
- `MapImage` is `x=37, y=88, w=307, h=410` within the modal.
- Mobile marker tooltip instances remain `32 x 38` and keep constant visual size during zoom.
- `BottomSheet` is `x=0, y=400, w=375, h=320`, with top radius `12px`.
- `DragHandle` is `x=16, y=12, w=343, h=4`; the visible handle bar is centered, `44 x 4`, radius `999px`.
- Mobile `Form.Select` is `x=16, y=28, w=343, h=42`.
- Mobile `Form.SearchBar` is `x=16, y=52, w=343, h=36`; it is a `MapCollectionModal` overlay, not a child of `BottomSheet`.
- `SheetItemList` is `x=16, y=82, w=343`; rows are `36px` high.
- `SheetFooter` is `x=0, y=628, w=375, h=92`; the primary button is `x=16, y=12, w=343, h=48`.

Mobile uses a bottom-sheet control model for sheet-owned select/list/footer content. Do not place the desktop left sidebar on mobile. Do not nest `Form.SearchBar` inside `BottomSheet`; keep it as an overlay at `x=16, y=52, w=343, h=36` across default, collapsed, marker selected, expanded, and search focused states. Keep map gestures available behind the sheet, and let the sheet scroll its list content independently.

The same Figma page defines five mobile states:

- Default: `MobileMapDefaultScreen`, bottom sheet collapsed at `x=0, y=400, w=375, h=320`; search remains a modal overlay at `x=16, y=52, w=343, h=36`.
- Bottom sheet collapsed: `MobileMapBottomSheetCollapsedScreen`, bottom sheet is minimized at `x=0, y=620, w=375, h=100`; keep the drag handle and map select visible, keep search as the modal overlay at `x=16, y=52, w=343, h=36`, clip the list content, and do not render the footer action in this state.
- Marker selected: `MobileMapMarkerSelectedScreen`, selected marker may use the active marker size `40 x 46`; search remains a modal overlay at `x=16, y=52, w=343, h=36`; mobile detail card appears at `x=16, y=602, w=343, h=86`; the bottom sheet is hidden while the detail card is open. Closing the detail card returns to the previous sheet state.
- Bottom sheet expanded: `MobileMapBottomSheetExpandedScreen`, bottom sheet moves to `x=0, y=68, w=375, h=652`; select, list, and footer follow sheet layout, while search remains the modal overlay at `x=16, y=52, w=343, h=36`.
- Search focused: `MobileMapSearchFocusedScreen`, bottom sheet is expanded at `x=0, y=68, w=375, h=652`; search remains the modal overlay at `x=16, y=52, w=343, h=36`; footer is omitted in the observed state.

Mobile interactions should degrade from desktop hover/wheel behavior to tap-first behavior. Tap a row or marker to select and highlight the corresponding point. Tap clear/reset to clear search text and all active filters. Drag or tap the sheet handle may switch between collapsed, default, and expanded sheet states. Do not invent mobile-only actions that are not represented in the data or component contract.

## Components

Use only the approved component registry:

- `Layout.PictureTitle`
- `Form.Select`
- `Form.SearchBar`
- `Base.DropdownCard`
- `Base.DropdownOption`
- `Base.DropdownItem`
- `Base.Divider`
- `Base.Badge`
- `Form.Checkbox`
- `Layout.Scroll`
- `Map.MapTip`
- `Map.PopupDescribeCard`
- `Base.Button`

Component display names must match the current Figma naming style, including capitalization: `Base / DropdownCard / Default`, `Base / DropdownOption / Default`, `Layout / Scroll / Default`.

`Layout.PictureTitle` is a reserved game-logo image area. It may use title text for alt/accessibility data, but it must not render a normal visible text title in the map header.

`Map.MapTip` is a marker icon container, not a text bubble. Its visual size stays fixed during zoom while its screen position is recalculated from map coordinates.

`Map.PopupDescribeCard` must collapse gracefully when media or description data is absent. When both are absent, align the title and close button on the same visual row.

## Data And State Rules

- Only consume the standardized map package.
- Do not consume raw crawled source data directly in this layer.
- Do not invent marker data, coordinates, group counts, icon paths, tile paths, detail copy, or category hierarchy.
- Use `TODO_FROM_DATASOURCE` for unresolved data.
- Keep empty and skeleton states visually valid.
- Disable or hide the map select for single-map packages according to `uiRules.singleMapSelect`.
- Desktop and mobile must share filter/search selection state.
- The clear action clears search text and all active filter selections.
- Do not render preview-only counters or debug status text in generated pages.

## Mode And Theme Rules

The map design is dark by default. Use the dark semantic token set for map pages unless the host product explicitly requests a light map shell. When a token export includes both light and dark modes, bind the map container to the host-selected mode instead of duplicating token values.

## Do Not

- Do not add unregistered components to template regions.
- Do not generate arbitrary HTML or arbitrary React code in the skill output.
- Do not convert mobile into a scaled desktop layout.
- Do not use marketing copy, decorative gradients, hero sections, or unrelated explanatory text inside the tool UI.
