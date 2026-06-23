---
name: h5-map-renderer-integrator
description: Integrate generated H5 map page.output.json and standard map packages into an existing front-end renderer project. Use when Codex needs to wire the approved H5 map contracts into a React/Vite or similar engineering project, connect renderer state to registered components, or preserve the boundary between generated page JSON, standard data package, and runtime implementation.
---

# H5 Map Renderer Integrator

Use this skill only after page composition exists and the user wants engineering integration.

```txt
page.output.json + standard map package + existing front-end project -> wired H5 map renderer
```

## Workflow

1. Read `references/component-package.json`.
2. Install the component package into the target front-end project with `scripts/install-components.mjs --target <front-end-project>`.
3. Read `references/renderer-contract.md`.
4. Read `references/page-output-to-react.md` if the target project is React or Vite.
5. Inspect the target project before editing.
6. Connect renderer state to the generated page JSON and standard map package.
7. Import `@h5-game-tool/map-components/style.css` once in the app entry or equivalent.
8. Keep component names, region ids, and token values aligned with the page-composer contracts.
9. Run the target project's build or dev validation command.

## Rules

- Do not make the renderer consume raw crawler files directly.
- Do not treat `page.output.json` as a standalone HTML page.
- Do not invent new components when the approved component registry already covers the behavior.
- Do not copy component source into every project by hand when the component package can be installed.
- Keep pan, drag, wheel zoom, marker projection, selected marker state, filter state, and search state in the renderer layer.
- Keep generated JSON declarative; runtime interaction belongs to code.

## Included Resources

- `scripts/install-components.mjs` installs the external component package into a target project.
- `references/component-package.json` records the package source, version, and import paths.
- `references/renderer-contract.md` defines runtime responsibilities.
- `references/page-output-to-react.md` maps generated page output to React integration.
