# H5 Game Tool Components

Reusable React components, tokens, and styles for H5 game tool UIs.

The canonical design-token source lives in `design-system-pack/tokens.css`.
This package mirrors that source into `src/tokens.css` for package builds.

## Install

```sh
npm install @h5-game-tool/components
```

For local handoff packages, install from the generated tarball or zip-extracted folder.

## Use

```tsx
import { Button, SearchBar, Select } from "@h5-game-tool/components";
import "@h5-game-tool/components/style.css";
```

Import `style.css` once in the app entry. It imports Remix Icon CSS and package tokens.

## Exports

- `@h5-game-tool/components`
- `@h5-game-tool/components/style.css`
- `@h5-game-tool/components/tokens.css`

