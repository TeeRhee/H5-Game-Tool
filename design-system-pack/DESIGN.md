---
version: alpha
name: H5 Game Tool Design Token Kit
description: Shared design rules and CSS variables for all H5 game light-tool types, including tools that temporarily have no component registry.
tokenFile: tokens.css
---

## Purpose

This package is for game light-tool pages that need to apply the shared visual system before their full component contracts are ready. It provides a `DESIGN.md` rulebook and the latest `tokens.css` variable export.

Use this package for tool types such as map, wiki, guide configuration, data lookup, lightweight calculators, and other crawled-data utilities when development only has enough time to apply layout, typography, color, spacing, radius, and state styling.

## What This Package Does

- Defines the shared visual rules for all tool types.
- Provides the latest CSS variables through `tokens.css`.
- Allows pages without component registries to apply a consistent style layer.
- Keeps data-driven pages visually valid while crawled data and component contracts are still incomplete.

## What This Package Does Not Do

- It does not define map-specific components.
- It does not replace a future component registry.
- It does not allow developers to invent missing data, screenshots, icons, copy, or hierarchy.
- It does not require every tool type to use the same layout.

## Token Usage

Always import `tokens.css` once at the app or tool-shell level.

Use semantic tokens before primitive tokens:

- Page and panel backgrounds: `--color-bg-black`, `--color-bg-soft`, `--color-bg-sub`, `--color-bg-weak`, `--color-bg-reverse`
- Text: `--color-text-strong`, `--color-text-sub`, `--color-text-soft`, `--color-text-weak`, `--color-text-disabled`
- Icons: `--color-icon-strong`, `--color-icon-sub`, `--color-icon-soft`, `--color-icon-weak`, `--color-icon-disabled`
- Borders: `--color-stroke-sub`, `--color-stroke-soft`, `--color-stroke-active`, `--color-stroke-disabled`
- Brand and actions: `--color-primary-base`, `--color-primary-dark`, `--color-primary-darker`
- Status: `--color-status-success`, `--color-status-warning`, `--color-status-error`, `--color-status-info`
- Radius: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-xxl`, `--radius-full`
- Spacing: `--space-element-*` and `--space-layout-*`
- Type: `--type-font-family-primary`, `--type-font-family-number`, `--type-size-*`, `--type-line-height-*`, `--type-weight-*`

Only fall back to primitive tokens when no semantic token expresses the intended role.

## Theme Selection

Choose light or dark mode from the original website or host product background, not from the tool type.

- If the original website or host shell is black, near-black, dark gray, game-overlay-like, or uses light text on dark surfaces, use the dark token mode.
- If the original website or host shell is white, light gray, or uses dark text on light surfaces, use the light token mode.
- If the token CSS provides explicit selectors such as `[data-theme="dark"]`, `[data-theme="light"]`, `.theme-dark`, or `.theme-light`, mount the tool under the matching selector.
- If the current token export contains only one semantic mode, treat it as the available source of truth and do not synthesize missing mode values. Request the missing token export before final release for pages that require the other mode.

Do not mix dark panels with light-page text tokens or light panels with dark-page text tokens in the same tool shell unless the design file explicitly defines that mixed surface.

## Typography

Use tokenized typography. The default Chinese and mixed-language font comes from `--type-font-family-primary`. Use `--type-font-family-number` for dense numeric values when alignment matters.

Recommended defaults:

- Dense labels and metadata: `--type-size-100` with `--type-line-height-25`
- Standard controls and body text: `--type-size-200` with `--type-line-height-200`
- Section titles: `--type-size-300` with `--type-line-height-300`

Do not use hero-size typography inside operational tools unless the target tool is explicitly a presentation or landing surface.

## Layout

The default fixed tool viewport is `1160 x 800` for desktop-like tool shells. Mobile layouts should use the host viewport and responsive rules from the specific tool contract.

For the map tool, PC H5 popup is the primary scenario and mobile portrait is a compatible scenario. Other tool types should follow the same principle until their own contracts exist: keep the desktop shell stable first, then define mobile as a tap-first adaptation rather than a scaled desktop screenshot.

For tools without component contracts:

- Keep content dense, readable, and task-focused.
- Prefer full-width surfaces and tool panels over decorative cards.
- Use 8px or smaller radii for regular panels and controls unless the token role requires otherwise.
- Keep repeated rows and filters stable in height so crawled data does not cause layout jumps.
- Use skeleton or empty states when data is missing; do not invent content.

## Data Constraints

Most tools in this system are backed by crawled or normalized data. Styling work must not change data meaning.

- Preserve source labels when provided.
- Mark unresolved fields as `TODO_FROM_DATASOURCE`.
- Do not fabricate counts, item names, descriptions, thumbnails, map coordinates, item categories, or guide steps.
- If a tool type has no component registry yet, apply only style, spacing, typography, and shell layout rules.
- When a component registry is later provided, the registry becomes authoritative for component names, props, and placement.

## Interaction States

Use tokenized state styling:

- Hover: use semantic hover or nearby surface tokens.
- Pressed: use semantic pressed or deeper surface tokens.
- Focus/active: use brand or active stroke tokens.
- Disabled: use disabled text, icon, stroke, and background tokens.

Never remove focus visibility. If the host site has its own focus style, align it to the token color rather than hiding it.

## Delivery Rule

For temporary non-component tools, development may ship with `DESIGN.md` plus `tokens.css` only. The result should look aligned with the shared game light-tool system, but it should not pretend to have final component behavior until the tool-specific contract exists.
