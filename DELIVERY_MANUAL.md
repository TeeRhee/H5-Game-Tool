# H5 Game Tool Map Skill 交付说明书

## 交付包用途

这份交付包用于把“游戏地图数据源”接入到受约束的 H5 地图工具生成链路。

当前已支持完整生成链路的是 `map` 地图工具类型。`wiki` 已有设计规则、页面 template 和 mapping 草案，但数据源 schema、example 和生成链路尚未补齐，暂不属于可交付生成范围；`guide-config` 仍只在类型表中预留。

## 开发接入流程

开发接入新游戏地图时，不要把原始爬虫数据直接交给 H5 renderer。必须先提供或编写 adapter，把原始数据转成标准地图数据包：

```txt
game-map-package/
  map.meta.json
  map.normalized.json
  maps/
  icons/
  images/
```

然后执行：

```sh
npm install
npm run validate:map -- --package <standard-map-package-dir>
npm run generate:map-output -- --package <standard-map-package-dir> --output <standard-map-package-dir>/page.output.json
npm run build
```

如果数据包放在 `public/data/<game-id>/` 下，可以用本地预览打开：

```txt
/?data=/data/<game-id>/
```

## 根目录文件

### `package.json`

定义项目命令和依赖。

常用命令：

- `npm run dev`：启动本地 Vite 预览。
- `npm run build`：TypeScript 检查并构建 H5 页面。
- `npm run validate:skill-pack`：校验 skill-pack 内部引用是否一致。
- `npm run validate:map -- --package <dir>`：校验任意标准地图数据包。
- `npm run validate:crimsondesert`：校验内置 Crimson Desert 样例数据包。
- `npm run generate:map-output -- --package <dir> --output <file>`：把标准地图包生成受约束页面 JSON。
- `npm run generate:crimsondesert-output`：为 Crimson Desert 样例生成 `page.output.json`。
- `npm run build:crimsondesert-h5`：生成 Crimson Desert 的 `page.h5.json` 并输出预览 URL。

### `package-lock.json`

锁定 npm 依赖版本，开发和部署应保留。

### `index.html`

Vite 入口 HTML。

### `tsconfig.json`

TypeScript 编译配置。

### `.gitignore`

忽略本地依赖、构建产物、日志等不应提交的内容。

### `crimsondesert-h5-screenshot.png`

当前 Crimson Desert H5 预览截图，用于交付验收参考，不参与运行。

## `skill-pack/`

这是 AI Skill 的核心契约目录，交给 AI 和开发共同遵守。

### `skill-pack/SKILL.md`

AI 执行手册。说明 AI 如何读取工具类型、验证标准包、生成页面 JSON，以及什么时候必须停止询问缺失字段。

### `skill-pack/map/DEVELOPER_HANDOFF.md`

给开发的接入说明。新游戏地图接入时优先读这个文件。

### `skill-pack/tool-types.json`

工具类型注册表。当前包含：

- `map`：已进入可交付链路。
- `wiki`：已有 template/mapping 草案，数据源 schema 和 example 待补齐。
- `guide-config`：仅预留。

### `skill-pack/OUTPUT_SCHEMA.json`

AI 最终页面 JSON 的输出格式约束。生成器输出的 `page.output.json` 必须符合这个结构。

### `skill-pack/wiki/DESIGN.md`

Wiki 类页面的人读设计规则。记录 1000 x 610 默认画布、桌面状态、组件使用边界、token 使用和禁止编造数据的规则。

### `skill-pack/MAP_V0_STATUS.md`

地图 v0 的布局、交互、占位资产和待补事项记录。用于对齐当前实现状态。

## `skill-pack/templates/`

### `skill-pack/map/templates/map.json`

地图页面模板。定义页面区域、每个区域允许出现哪些组件、画布和侧栏布局规则。

重点区域：

- `left-panel.header`
- `left-panel.controls`
- `map.canvas`
- `map.detail`
- `bottom-action`

### `skill-pack/wiki/templates/wiki.json`

Wiki 页面模板草案。定义 home、secondary list、detail 等桌面状态的区域和允许组件。当前不包含移动端规则。

## `skill-pack/components/`

### `skill-pack/components.json`

共享组件注册表。AI 和生成器只能引用这里登记过的组件，不能自由发明组件；具体页面能用哪些组件由对应 template 决定。

包含组件示例：

- `Layout.PictureTitle`
- `Form.Select`
- `Form.SearchBar`
- `Base.DropdownItem`
- `Form.Checkbox`
- `Feedback.Tooltip`
- `Layout.DescribeCard`
- `Base.Button`

## `skill-pack/map/datasource-schema/`

标准地图数据包的数据契约。

### `MAP_DATASOURCE_CONTRACT.md`

给开发看的完整地图数据源接入契约，解释 `map.meta.json`、`map.normalized.json`、tiles、icons、images 的职责。

### `map.meta.schema.json`

校验 `map.meta.json`。定义游戏信息、地图列表、瓦片规则、坐标系、资源路径和 UI 规则。

### `map.normalized.schema.json`

校验 `map.normalized.json`。定义分类、分组、点位、区域、详情字段。

### `tile-manifest.schema.json`

校验不规则瓦片清单。适用于无法用 `{z}/{x}/{y}` 路径模板表达的地图瓦片。

## `skill-pack/mapping/`

### `mapping/map.json`

标准地图字段到页面区域、组件 props、renderer state 的映射表。AI 和生成器按它把数据绑定到页面。

### `skill-pack/wiki/mapping/wiki.json`

Wiki 字段映射草案。当前只固化 region 到共享组件的映射和数据绑定语义，真实字段路径仍保留为 `TODO_FROM_DATASOURCE`。

## `skill-pack/examples/`

### `examples/map.json`

地图类型的输入到输出样例。使用 Crimson Desert 的真实标准包抽样，避免 AI 学到虚构字段。

## `skill-pack/schemas/`

校验 skill-pack 契约文件自身的 schema。

- `tool-types.schema.json`：校验工具类型注册表。
- `template.schema.json`：校验模板文件。
- `components.schema.json`：校验组件注册表。
- `mapping.schema.json`：校验字段映射表。

## `skill-pack/tokens/`

### `design-system-pack/tokens.css`

设计 token。React 组件和样式应优先使用这里定义的颜色、字体、间距、圆角等变量。

## `scripts/`

### `validate-skill-pack.mjs`

校验 skill-pack 内部引用：

- tool type 指向的模板、组件、schema、mapping、example 是否存在。
- template 允许的组件是否都在组件注册表中。
- map mapping 引用的 region 和 component 是否合法。

运行：

```sh
npm run validate:skill-pack
```

### `validate-map-package.mjs`

校验任意标准地图数据包：

- 必须有 `map.meta.json` 和 `map.normalized.json`。
- marker、area 的 `mapId` 必须存在。
- marker 的 `categoryId`、`groupId` 必须存在。
- group 的 `count` 必须等于实际 marker 数。
- 图标、详情图片、瓦片样例或 manifest 必须能找到。

运行：

```sh
npm run validate:map -- --package <standard-map-package-dir>
```

### `generate-map-output.mjs`

把已校验的标准地图包生成符合 `OUTPUT_SCHEMA.json` 的受约束页面 JSON。

运行：

```sh
npm run generate:map-output -- --package <standard-map-package-dir> --output <file>
```

### `generate-map-page.mjs`

生成当前 renderer 使用的 `page.h5.json`。这是现有 H5 链路的页面配置文件。

运行：

```sh
npm run generate:map-page -- --package <standard-map-package-dir> --output <standard-map-package-dir>/page.h5.json
```

### `build-map-h5.mjs`

一键流程：可选运行 adapter，然后校验标准包并生成 `page.h5.json`，最后输出 renderer 预览 URL。

运行：

```sh
npm run build:map-h5 -- --package <standard-map-package-dir>
```

### `adapt-crimsondesert.mjs`

Crimson Desert 原始数据到标准地图包的示例 adapter。新游戏可以参考它写自己的 adapter，但不要把 Crimson Desert 的原始字段当成通用格式。

## `src/`

React + TypeScript H5 预览和组件实现。

### `src/main.tsx`

React 应用入口。

### `src/preview/ComponentPreview.tsx`

当前地图 H5 renderer/preview。读取 `?data=/data/<game-id>/` 指向的标准地图包，支持：

- 地图瓦片渲染。
- template tiles。
- manifest tiles。
- 拖拽平移。
- 滚轮缩放。
- 分类/分组筛选。
- 搜索。
- marker tooltip。
- 区域中心标签。
- marker 详情卡。

### `src/components/game-tool/`

地图工具使用的 React 组件实现。

主要组件：

- `Button.tsx`
- `SearchBar.tsx`
- `Select.tsx`
- `Checkbox.tsx`
- `DropdownItem.tsx`
- `DropdownOption.tsx`
- `DropdownCard.tsx`
- `Divider.tsx`
- `PictureTitle.tsx`
- `Tooltip.tsx`
- `DescribeCard.tsx`
- `RemixIcon.tsx`
- `Scroll.tsx`
- `index.ts`

### `src/styles.css`

全局样式和地图页面样式。

## `public/`

公开静态资源和可运行样例数据。

### `public/assets/preview/`

本地预览占位图，不是通用默认数据源。

### `public/data/crimsondesert/`

Crimson Desert 标准地图数据包，可用于验证和预览。

核心文件：

- `map.meta.json`：地图元信息、瓦片规则、坐标系、资源路径。
- `map.normalized.json`：分类、分组、点位、区域。
- `page.output.json`：由 `generate-map-output.mjs` 生成的受约束页面 JSON。
- `page.h5.json`：由现有 H5 链路生成的页面配置。
- `maps/`：地图瓦片。
- `icons/`：点位图标。
- `images/`：Logo 和详情图片资源。

## 当前限制

- 新游戏原始数据不能直接进入 renderer，必须先写 adapter 转成标准包。
- `wiki` 目前只有 design/template/mapping 草案，还不能生成完整页面。
- `guide-config` 还不能生成页面。
- Storybook 尚未配置。
- 还没有打成可安装的 Codex skill 包；当前交付是源码和契约包。
