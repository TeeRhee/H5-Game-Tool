# Skill Pack Overview

This folder is split into shared contracts and tool-type-specific contracts.

## Shared Layer

- `DESIGN.md`: global design and contract rules.
- `SKILL.md`: execution rules for working in this repo.
- `components.json`: shared component registry.
- `OUTPUT_SCHEMA.json`: shared page-output schema.
- `design-system-pack/tokens.css`: shared design tokens.
- `schemas/`: local JSON schemas for the contract files.
- `tool-types.json`: registry of supported tool types.

## Tool-Type Layer

- `map/`: map-specific template, mapping, examples, and datasource schema.
- `wiki/`: wiki-specific template files.
- `guide-config/`: registered placeholder for the future guide-config type.

## Current Rule

Shared components live at the top level. Each tool type owns its own template and rule files under its own directory. Do not add new type-specific contracts back into the root.
