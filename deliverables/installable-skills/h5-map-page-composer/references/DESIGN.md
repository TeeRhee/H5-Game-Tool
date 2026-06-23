---
version: alpha
name: H5 Game Map Tool
description: A restrained desktop-like game map tool for dense marker exploration, built from approved H5 components.
colors:
  window-background: "#1F2224"
  panel-background: "#2C3134"
  search-background: "#353A3D"
  field-stroke: "#43484B"
  text-primary: "#ECEEF0"
  text-secondary: "#AEB4B8"
  accent: "#DCB325"
  marker-surface: "#FFFFFF"
typography:
  body-md:
    fontFamily: Microsoft YaHei UI
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  body-sm:
    fontFamily: Microsoft YaHei UI
    fontSize: 12px
    fontWeight: 400
    lineHeight: 18px
  label-md:
    fontFamily: Microsoft YaHei UI
    fontSize: 12px
    fontWeight: 400
    lineHeight: 14px
rounded:
  panel: 8px
  control: 6px
  marker: 6px
  pill: 999px
spacing:
  sidebar-x: 12px
  sidebar-y: 12px
  sidebar-width: 264px
  sidebar-height: 776px
  control-gap: 8px
  panel-padding: 12px
components:
  sidebar-panel:
    backgroundColor: "{colors.panel-background}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.panel}"
  search:
    backgroundColor: "{colors.search-background}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.control}"
    height: 36px
  select:
    backgroundColor: "{colors.panel-background}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.control}"
    height: 42px
  marker-tooltip:
    backgroundColor: "{colors.marker-surface}"
    rounded: "{rounded.marker}"
    size: 32px
---

## Overview

The H5 Game Map Tool is a focused utility interface for exploring dense game-world data. It should feel like a dark in-game companion panel: compact, legible, and operational. The design is not a marketing page and not a decorative landing page. It is a map workspace with a fixed left control surface, a full-window map canvas, and lightweight overlays.

## Colors

Use a dark neutral stack. The window background is `#1F2224`; panels, detail cards, and zoom controls use `#2C3134`; search and active field surfaces use `#353A3D`; field strokes use `#43484B`. Text should stay high-contrast with `#ECEEF0` for primary labels and `#AEB4B8` for placeholders or secondary metadata. Use `#DCB325` only for focused or active control strokes and selected states.

## Typography

Use Microsoft YaHei UI for Chinese and mixed-language game data. Keep control text at 14px/20px and metadata counts at 12px/14px. Do not use hero-sized typography inside the map UI. The page should support scanning hundreds or thousands of markers, so compact labels are correct.

## Layout

The default tool viewport is 1160 x 800 for map, wiki, and future game light-tool types. The map canvas occupies the full 1160 x 800 viewport and sits beneath overlays. The left sidebar is fixed at x=12, y=12, w=264, h=776 with 8px radius. The bottom action area clears filters. Zoom controls sit at the top-right. Do not reinterpret `map.canvas` as only the visible area to the right of the sidebar.

## Elevation & Depth

Depth comes from layer order and dark tonal separation, not heavy shadows. The detail card renders above marker tooltips. Tooltip markers remain visually constant during zoom while their positions are recalculated from map coordinates.

## Shapes

Use small, practical radii: 8px for panels, 6px for controls and tooltip bodies, and full radius only for scroll thumbs or pill-like indicators. Avoid overly rounded card-heavy styling.

## Components

Use only the approved component registry: `Layout.PictureTitle`, `Form.Select`, `Form.SearchBar`, `Base.DropdownCard`, `Base.DropdownOption`, `Base.DropdownItem`, `Base.Divider`, `Form.Checkbox`, `Layout.Scroll`, `Feedback.Tooltip`, `Layout.DescribeCard`, and `Base.Button`.

`Layout.PictureTitle` is a reserved game-logo image area. It may use title text for alt/accessibility data, but it must not render a normal visible text title in the map header.

`Feedback.Tooltip` is a marker icon container, not a text bubble. Its visual size stays fixed during zoom.

`Layout.DescribeCard` must collapse gracefully when image or description data is absent. When both are absent, align the title and close button on one row.

## Do's and Don'ts

- Do use `TODO_FROM_DATASOURCE` for unresolved data.
- Do keep empty or skeleton pages visually valid when data normalization is incomplete.
- Do disable or hide the map select for single-map packages according to `uiRules.singleMapSelect`.
- Do keep filters, search, and clear action visible as the stable control model.
- Don't invent marker data, coordinates, group counts, icon paths, or detail copy.
- Don't add marketing hero sections, decorative cards, gradients, or unrelated explanatory text.
- Don't place unregistered components in template regions.
- Don't render development-only counters or debug status text in final generated pages.
