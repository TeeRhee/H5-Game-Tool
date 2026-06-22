# Examples

Examples must use real data or a mock data source explicitly approved by development.

Do not invent map points, coordinates, filters, labels, assets, or descriptions.

## Current Real Example

The current real map example is generated into:

```txt
public/data/crimsondesert/
  map.meta.json
  map.normalized.json
  maps/world/
  icons/
  images/logo.png
```

Regenerate it from the raw Crimson Desert source package:

```sh
npm run adapt:crimsondesert -- --source <raw-crimsondesert-dir> --output public/data/crimsondesert
```

Validate it:

```sh
npm run validate:crimsondesert
```

The checked-in preview page currently reads this package from `/data/crimsondesert/`.
