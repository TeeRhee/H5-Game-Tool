# H5 Game Tool Components

Reusable React components, tokens, and styles for H5 game tool UIs.

The canonical design-token source lives in `design-system-pack/tokens.css`.
This package mirrors that source into `src/tokens.css` for package builds.

This package is the runtime distribution surface for downstream wiki tools.
The source-of-truth rules and contracts stay in the main repository under:

- `skill-pack/components.json`
- `skill-pack/wiki/templates/wiki.json`
- `skill-pack/wiki/mapping/wiki.json`
- `skill-pack/wiki/DESIGN.md`

Frontend developers who only need install/import instructions should start with:

- `docs/FRONTEND_COMPONENT_GUIDE.md`

## Install

```sh
npm install @h5-game-tool/components
```

For local handoff packages, install from the generated tarball:

```sh
npm install ./h5-game-tool-components-<version>.tgz
```

For private registry installs, configure the registry in the consuming project first:

```ini
@h5-game-tool:registry=https://<your-private-registry>/
//<your-private-registry>/:_authToken=${NPM_TOKEN}
```

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

## Publish Workflow

Run these commands from the repo root:

```sh
npm run build:components
npm run pack:components:dry-run
```

Or run the package-level publish check directly:

```sh
npm --prefix component-packages/h5-game-tool-components run publish:check
```

After the dry run looks correct:

```sh
cd component-packages/h5-game-tool-components
npm publish
```

## Consumer Boundary

Downstream wiki tools should:

- install `@h5-game-tool/components` by version
- import components and `style.css`
- treat this package as runtime UI only
- read the main repository docs for layout rules, allowed component usage, and mapping semantics

They should not copy component source files out of this repository unless they are intentionally forking the design system.

