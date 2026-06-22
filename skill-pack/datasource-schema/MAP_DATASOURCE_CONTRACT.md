# 地图工具数据源接入契约

本文档用于约定开发侧如何交付新的游戏地图数据源，让 AI Skill 和 H5 地图渲染器可以稳定生成页面。

核心原则：不同网站、不同游戏的原始爬虫数据可以不一样，但不能直接交给 H5 页面渲染。开发侧需要先把原始数据预处理成本文档定义的标准地图数据包。

## 交付目标

每个游戏交付一个标准地图数据包。AI Skill 只读取标准包，不读取各平台原始爬虫结构。

推荐目录结构：

```txt
game-map-source/
  map.meta.json
  map.normalized.json
  map-tiles/
    ...
  icons/
  images/
```

说明：

- `map.meta.json`：地图元信息，描述地图、瓦片、坐标、资源路径等渲染规则。
- `map.normalized.json`：标准化后的地图数据，包含分类、分组、点位、区域、详情。
- `map-tiles/`：地图瓦片资源。目录名、层级目录、文件命名、图片格式都不要求固定，但必须在 `map.meta.json` 中用 `tile.urlTemplate` 或 `tile.manifest` 明确声明。
- `icons/`：点位图标资源。
- `images/`：可选，点位详情图片资源。

## 职责边界

- 开发负责：爬取原始数据、清洗数据、补齐资源路径、写 adapter，把原始数据转换成标准包。
- Skill 负责：读取标准包，匹配地图工具模板，生成结构化 H5 页面配置。
- H5 渲染器负责：根据标准包渲染地图、筛选、搜索、标记、区域和详情。
- 设计侧负责：定义页面展示规则和验收标准，不负责长期手动整理每个游戏的数据。

## map.meta.json

`map.meta.json` 用于告诉渲染器“地图怎么画”。

示例：

```json
{
  "version": 1,
  "game": {
    "id": "crimsondesert",
    "name": "红色沙漠",
    "logo": "images/logo.png"
  },
  "maps": [
    {
      "id": "world",
      "name": "世界地图",
      "default": true,
      "tile": {
        "sourceType": "template",
        "urlTemplate": "map-tiles/world/{z}/{x}/{y}.png",
        "tileSize": 256,
        "imageType": "png",
        "minZoom": 0,
        "maxZoom": 8,
        "maxNativeZoom": 6,
        "tileOrigin": "top-left",
        "indexOrder": "z-x-y"
      },
      "coordinate": {
        "origin": "top-left",
        "axis": "x-right-y-down",
        "width": 8192,
        "height": 8192,
        "projectZoom": 5
      }
    }
  ],
  "assets": {
    "iconBase": "icons/",
    "imageBase": "images/"
  },
  "uiRules": {
    "singleMapSelect": "disabled",
    "detailFallback": "show-title-only",
    "areaDisplay": "center-label"
  }
}
```

字段说明：

- `game.id`：游戏唯一标识。
- `game.name`：页面展示的游戏名称。
- `game.logo`：游戏 Logo。没有则为空或不传。
- `maps`：地图列表。只有一张地图也必须放在数组里。
- `maps[].id`：地图唯一 id。
- `maps[].name`：地图展示名称。
- `maps[].default`：是否默认打开。
- `tile.sourceType`：瓦片来源类型。推荐 `template`；极不规则瓦片可用 `manifest`。
- `tile.urlTemplate`：瓦片路径模板，推荐包含 `{z}`、`{x}`、`{y}`。模板不限制目录结构和后缀，例如 `map-tiles/world/{z}/{x}/{y}.png` 或 `map-tiles/gta/{z}/{x}_{y}.jpg` 都可以。
- `tile.tileSize`：单张瓦片尺寸，例如 `256`。
- `tile.imageType`：瓦片图片格式，例如 `png`、`jpg`、`webp`。
- `tile.minZoom`：最小缩放层级。
- `tile.maxZoom`：页面允许的最大缩放层级。
- `tile.maxNativeZoom`：真实瓦片最大层级。
- `tile.tileOrigin`：瓦片索引原点，目前默认 `top-left`。
- `tile.indexOrder`：瓦片索引语义，默认 `z-x-y`，表示 `{z}` 是缩放层级，`{x}` 是横向瓦片索引，`{y}` 是纵向瓦片索引。
- `coordinate.origin`：坐标原点，目前使用 `top-left`。
- `coordinate.axis`：坐标轴方向，目前使用 `x-right-y-down`。
- `coordinate.width` / `height`：点位坐标所在逻辑地图尺寸。
- `coordinate.projectZoom`：坐标转换使用的投影层级。如果使用 Leaflet，可按 `map.unproject([x, y], projectZoom)` 理解。
- `assets.iconBase`：图标资源基准目录。
- `assets.imageBase`：详情图片资源基准目录。
- `uiRules.singleMapSelect`：单地图时 Select 行为，建议 `disabled` 或 `hidden`。
- `uiRules.detailFallback`：详情缺字段时的兜底规则。
- `uiRules.areaDisplay`：区域数据展示方式。

注意：瓦片层级、地图尺寸、坐标层级、瓦片目录结构、文件名格式和图片后缀都不能写死为某个游戏的规则。每个游戏都必须在 `map.meta.json` 中显式声明。

## 瓦片资源规则

瓦片格式不是全局固定的。不同来源可能使用不同目录和文件命名。

标准 `{z}/{x}/{y}.png`：

```json
{
  "tile": {
    "sourceType": "template",
    "urlTemplate": "map-tiles/world/{z}/{x}/{y}.png",
    "tileSize": 256,
    "imageType": "png",
    "minZoom": 0,
    "maxZoom": 8,
    "maxNativeZoom": 6,
    "tileOrigin": "top-left",
    "indexOrder": "z-x-y"
  }
}
```

截图中类似 `gta_map_render/{z}/{x}_{y}.jpg` 的非标准命名：

```json
{
  "tile": {
    "sourceType": "template",
    "urlTemplate": "map-tiles/gta_map_render/{z}/{x}_{y}.jpg",
    "tileSize": 256,
    "imageType": "jpg",
    "minZoom": 0,
    "maxZoom": 6,
    "maxNativeZoom": 6,
    "tileOrigin": "top-left",
    "indexOrder": "z-x-y"
  }
}
```

如果瓦片没有稳定模板，必须提供瓦片清单：

```json
{
  "tile": {
    "sourceType": "manifest",
    "manifest": "tile-manifest.json",
    "tileSize": 256,
    "imageType": "jpg",
    "minZoom": 0,
    "maxZoom": 6,
    "maxNativeZoom": 6,
    "tileOrigin": "top-left",
    "indexOrder": "z-x-y"
  }
}
```

`tile-manifest.json` 示例：

```json
{
  "version": 1,
  "tiles": [
    { "z": 0, "x": 0, "y": 0, "src": "map-tiles/gta_map_render/0/0_0.jpg" },
    { "z": 1, "x": 0, "y": 0, "src": "map-tiles/gta_map_render/1/0_0.jpg" },
    { "z": 1, "x": 0, "y": 1, "src": "map-tiles/gta_map_render/1/0_1.jpg" }
  ]
}
```

如果某个层级的瓦片不是完整矩形，或者文件名不能通过 `{z}`、`{x}`、`{y}` 推导，必须使用 `manifest`。渲染器不允许扫描目录猜瓦片规则。

## map.normalized.json

`map.normalized.json` 用于告诉渲染器“地图上有什么”。

示例：

```json
{
  "version": 1,
  "categories": [
    {
      "id": "location",
      "name": "地点",
      "groups": [
        {
          "id": "stronghold",
          "name": "据点",
          "icon": "1.png",
          "count": 491
        }
      ]
    }
  ],
  "markers": [
    {
      "id": "point-1",
      "mapId": "world",
      "categoryId": "location",
      "groupId": "stronghold",
      "title": "海雾残骸",
      "position": {
        "x": 3331.93,
        "y": 5220.54
      },
      "detail": {
        "description": "",
        "image": ""
      },
      "raw": {
        "sourceId": 1
      }
    }
  ],
  "areas": [
    {
      "id": "area-1",
      "mapId": "world",
      "name": "帕卫尔",
      "position": {
        "x": 4144.7,
        "y": 3130.18
      },
      "type": "center-label"
    }
  ]
}
```

字段说明：

- `categories`：左侧筛选一级分类。
- `categories[].groups`：分类下的筛选分组。
- `groups[].icon`：相对 `assets.iconBase` 的图标路径。
- `groups[].count`：该分组点位数量，必须等于实际 marker 数。
- `markers`：地图点位列表。
- `markers[].mapId`：点位属于哪张地图。
- `markers[].categoryId`：点位所属一级分类。
- `markers[].groupId`：点位所属分组。
- `markers[].title`：点位名称，必填。
- `markers[].position.x/y`：点位坐标，必须与 `map.meta.json` 的坐标配置一致。
- `markers[].detail`：可选详情字段。
- `markers[].raw`：可选，保留原始 id 或调试信息，不用于页面直接展示。
- `areas`：可选区域数据。
- `areas[].type = center-label`：表示区域中心文字标记。

## 详情字段规则

详情字段采用“有则显示，没有则隐藏”的规则。

推荐字段：

```json
{
  "detail": {
    "description": "说明文本",
    "image": "point-detail.png",
    "tips": "玩法提示",
    "reward": "奖励信息"
  }
}
```

渲染规则：

- 有 `image`：显示图片区域。
- 无 `image`：不保留图片占位高度。
- 有 `description`：显示描述。
- 无 `description`：不显示描述区域。
- 只有 `title`：详情卡只显示标题。
- 新增字段必须先在数据契约或 mapping 中声明，不能让页面猜字段含义。

## 单地图和多地图规则

- 只有一张地图：Select 禁用或隐藏，按 `uiRules.singleMapSelect` 执行。
- 多张地图：Select 启用，选项来自 `map.meta.json > maps`。
- 每个 marker 和 area 必须通过 `mapId` 指明属于哪张地图。
- 每张地图可以有独立的瓦片路径、缩放层级、坐标尺寸和投影层级。

## 区域数据规则

区域数据不是必填。

如果只有区域中心点：

```json
{
  "id": "area-1",
  "mapId": "world",
  "name": "帕卫尔",
  "position": {
    "x": 4144.7,
    "y": 3130.18
  },
  "type": "center-label"
}
```

渲染器只显示区域文字。

如果未来有区域边界，可以扩展：

```json
{
  "id": "area-1",
  "mapId": "world",
  "name": "帕卫尔",
  "type": "polygon",
  "polygon": [
    { "x": 1, "y": 1 },
    { "x": 2, "y": 1 },
    { "x": 2, "y": 2 }
  ]
}
```

未声明 `polygon` 时，不允许前端猜区域边界。

## 资源路径规则

- `tile.urlTemplate` 或 `tile.manifest` 中声明的瓦片路径必须能在数据包内或 CDN 上访问。
- 瓦片目录结构和文件名不固定，但必须能通过 `tile.urlTemplate` 或 `tile.manifest` 唯一定位。
- `groups[].icon` 使用相对路径时，相对 `assets.iconBase` 解析。
- `detail.image` 使用相对路径时，相对 `assets.imageBase` 解析。
- 不要把本地绝对路径写进数据包。
- 不要把 `__MACOSX`、`.DS_Store`、`._*` 等系统文件放进正式资源包。

## 原始数据适配规则

每个游戏可以保留自己的原始数据，但必须提供 adapter 转换成标准格式。

例如红色沙漠原始数据：

```txt
categories[].title
categories[].data[].title / num / icon / id
categories[].data[].data[].id / title / x / y
areas[].title / x / y
```

应转换为：

```txt
categories[].name
categories[].groups[].name / count / icon / id
markers[].id / title / position.x / position.y / categoryId / groupId / mapId
areas[].name / position.x / position.y / mapId / type
```

注意：红色沙漠的 `points.json` 不是通用格式，不能作为其他游戏必须遵守的原始格式。通用的是本文档定义的标准化结果。

## 验收标准

开发交付新的地图数据源时，至少需要满足：

- 有 `map.meta.json`。
- 有 `map.normalized.json`。
- 每个地图都有可访问的瓦片资源或明确的图片资源。
- 每个 marker 有 `id`、`mapId`、`title`、`position.x`、`position.y`、`categoryId`、`groupId`。
- 每个 group 的 `count` 等于实际 marker 数。
- 所有 `mapId` 都能在 `map.meta.json > maps` 中找到。
- 所有图标路径都能解析到真实文件或 URL。
- 没有系统垃圾文件进入正式资源包。
- 通过 schema 校验后，Skill 才允许生成 H5 页面。

## 给开发的结论

后续不要只交付原始爬虫文件。请交付“原始数据 + adapter + 标准地图数据包”，其中 H5 工具实际消费的是标准地图数据包。

这样可以保证：

- 不同游戏的数据源可以不同。
- 前端渲染器不用为每个游戏写特殊逻辑。
- 设计侧不用长期手动整理数据。
- AI Skill 可以稳定把标准数据包渲染成 H5 地图页面。
