# Frontend Component Integration Guide

## Goal

This document is for frontend developers who need to consume the shared runtime
component package in downstream wiki projects.

Use this document for:

- installing the package
- importing components and shared CSS
- understanding the runtime integration boundary

Do not use this document as the source of truth for layout rules or mapping
rules. Those stay in the main repository's `skill-pack` files.

## Package

- Package name: `@h5-game-tool/components`
- Runtime surface: React components, shared CSS, design tokens
- Source package folder: `component-packages/h5-game-tool-components/`

## Install

If your project can access the private registry:

```sh
npm install @h5-game-tool/components@<version>
```

If your project has not configured the private registry yet, add scope config
first:

```ini
@h5-game-tool:registry=https://<your-private-registry>/
//<your-private-registry>/:_authToken=${NPM_TOKEN}
```

If you are testing from a local handoff tarball instead of the registry:

```sh
npm install ./h5-game-tool-components-<version>.tgz
```

## Peer Dependencies

The package expects the consuming project to provide:

- `react >= 18`
- `react-dom >= 18`

## Import Rules

### 1. Import shared CSS once

Import this once in the app entry, such as `main.tsx`, `main.jsx`,
`app.tsx`, or the framework root layout:

```tsx
import "@h5-game-tool/components/style.css";
```

This file brings in:

- package component styles
- shared tokens
- Remix Icon CSS used by the components

Do not import `style.css` repeatedly in many pages or leaf components.

### 2. Import components from the package root

```tsx
import {
  Header,
  TopBar,
  Breadcrumbs,
  Navigate,
  CommandMenuItem,
  CategoryCard,
  ShowCard,
  DetailCard,
  SearchBar,
  Scroll,
} from "@h5-game-tool/components";
```

Use the package root export.

Do not deep import from internal `dist/...` or `src/...` paths in consumer
projects.

### 3. Optional token-only import

If a project needs token variables without the full component stylesheet:

```tsx
import "@h5-game-tool/components/tokens.css";
```

Use this only when you intentionally do not want the full component CSS.

## Example

```tsx
import "@h5-game-tool/components/style.css";
import {
  Header,
  TopBar,
  Breadcrumbs,
  CommandMenuItem,
} from "@h5-game-tool/components";

const topBarItems = [
  { id: "event", label: "事件", state: "active" as const },
];

const breadcrumbItems = [
  { id: "home", label: "首页" },
  { id: "event", label: "事件" },
  { id: "detail", label: "活动总览", state: "active" as const },
];

export function EventPage() {
  return (
    <>
      <Header searchPlaceholder="搜索攻略">
        <TopBar items={topBarItems} activeId="event" />
      </Header>

      <Breadcrumbs items={breadcrumbItems} />

      <CommandMenuItem badge="推荐">
        活动总览
      </CommandMenuItem>
    </>
  );
}
```

## What Is Exported

The package root currently exports the shared game-tool component set, including
common surfaces such as:

- navigation: `Header`, `TopBar`, `Breadcrumbs`, `Navigate`, `Pagination`
- content cards: `CategoryCard`, `ShowCard`, `DetailCard`, `WikiDescribeCard`
- controls: `Button`, `SearchBar`, `Select`, `Checkbox`
- overlays and helpers: `ToolTip`, `Modal`, `PopupDescribeCard`, `Scroll`

If you need the exact current export list, inspect:

- `component-packages/h5-game-tool-components/src/components/game-tool/index.ts`

## Runtime Boundary

This package is only the runtime UI surface.

Use the repository rules for:

- which components are allowed in which page regions
- page structure and layout placement
- datasource-to-props mapping
- wiki-specific detail/document semantics

Primary rule files:

- `skill-pack/components.json`
- `skill-pack/wiki/templates/wiki.json`
- `skill-pack/wiki/mapping/wiki.json`
- `skill-pack/wiki/DESIGN.md`

## Consumer Rules

- Install the package by version. Do not copy component source files into your
  project.
- Import from `@h5-game-tool/components`, not from internal file paths.
- Import `style.css` once at the app entry.
- Treat this package as shared runtime UI, not as permission to invent new wiki
  layouts outside the repository rules.

## Quick Verification

After installation, the fastest smoke test is:

1. Import `@h5-game-tool/components/style.css` in app entry.
2. Render one known component such as `Header` or `CommandMenuItem`.
3. Confirm the project builds without module-resolution errors.
4. Confirm the component renders with expected styles and icons.

## When To Ask Back

Raise questions when:

- the package installs but the project cannot resolve exports
- icons or styles are missing after `style.css` import
- a required component exists visually in design but is not exported yet
- the desired page structure conflicts with `skill-pack` rules
