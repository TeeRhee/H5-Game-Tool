# Page Output To React

Use generated `regions[]` as a declarative layout map.

## Region Mapping

- `left-panel.header` -> logo component.
- `left-panel.controls` -> map select, search, filter tree, visual scroll.
- `map.canvas` -> tile/background layer, marker layer, zoom controls.
- `map.detail` -> selected marker detail card.
- `bottom-action` -> clear-filters button.

## State Mapping

- `renderer state > query` -> search input value.
- `renderer state > visibleGroupIds` -> checked filter groups.
- `renderer state > selectedMarker` -> detail card data.
- `renderer state > filterScroll` -> visual scroll thumb.

## Implementation Notes

- Use existing project component patterns first.
- Use approved token values from the page-composer skill when styling gaps exist.
- Reject unknown `componentId` and unknown region ids during development.
- Keep image dragging and page scrolling disabled while the pointer is inside the map canvas during pan or wheel zoom.
