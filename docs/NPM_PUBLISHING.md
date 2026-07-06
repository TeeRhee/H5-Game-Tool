# NPM Publishing For Wiki Tool Consumers

## Goal

Use this repository as the source of truth for rules and contracts, and use
`@h5-game-tool/components` as the runtime dependency that downstream wiki tools
install.

This split is intentional:

- Repository: design rules, component semantics, template layout rules, mapping rules, previews, validation scripts
- NPM package: reusable React components, tokens, and shared CSS used by runtime projects

## Package Location

- Package source: `component-packages/h5-game-tool-components/`
- Package name: `@h5-game-tool/components`

## Before Publishing

1. Update component source in `src/components/game-tool/` and package mirror if needed.
2. Update rule files when behavior changed:
   - `skill-pack/components.json`
   - `skill-pack/wiki/templates/wiki.json`
   - `skill-pack/wiki/mapping/wiki.json`
   - `skill-pack/wiki/DESIGN.md`
3. Bump the version in `component-packages/h5-game-tool-components/package.json`.

## Local Verification

Run from repo root:

```sh
npm run build
npm run validate:skill-pack
npm run build:components
npm run pack:components:dry-run
```

Or package-only:

```sh
npm --prefix component-packages/h5-game-tool-components run publish:check
```

## Publish

Configure the private registry for the `@h5-game-tool` scope in your npm user
config or project config.

Example:

```ini
@h5-game-tool:registry=https://<your-private-registry>/
//<your-private-registry>/:_authToken=${NPM_TOKEN}
```

Then publish:

```sh
cd component-packages/h5-game-tool-components
npm publish
```

## What To Send To Downstream Wiki Teams

Every wiki tool team should receive both:

1. The rules repository URL
2. The npm package name and version to install

Recommended handoff format:

```txt
Rules repo:
https://github.com/TeeRhee/H5-Game-Tool

Runtime package:
@h5-game-tool/components@<version>
```

## Consumer Instructions

In downstream wiki projects:

```sh
npm install @h5-game-tool/components
```

Then:

```tsx
import "@h5-game-tool/components/style.css";
import { Button, Header, TopBar } from "@h5-game-tool/components";
```

Consumer projects should not treat the runtime package as the source of truth
for usage rules. Layout, mapping, and allowed-component semantics remain defined
by this repository's `skill-pack` files.
