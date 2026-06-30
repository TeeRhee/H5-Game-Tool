# 当前交付文件清单

本文档列出当前仍建议使用和交付的文件。`deliverables/` 现在只保留打包、安装、交付、归档相关内容；计划表和实施清单放在 `docs/`。

当前完整生成链路仍以 `map` 类型为主。`wiki` 已有 design/template/mapping 草案，但还没有数据源 schema、example 和生成链路，因此暂不进入当前交付包。

## 推荐使用顺序

1. 安装数据清洗 skill：`H5-Map-Data-Normalizer-Skill-2026-06-23.zip`
2. 安装页面生成 skill：`H5-Map-Page-Composer-Skill-2026-06-23.zip`
3. 如需接入现有前端工程，安装 renderer 接入 skill：`H5-Map-Renderer-Integrator-Skill-2026-06-23.zip`
4. 在目标前端工程安装组件包：`h5-game-tool-components-0.1.1.tgz`

## 当前应该使用的文件

| 文件 | 作用 | 使用方式 |
| --- | --- | --- |
| `H5-Map-Data-Normalizer-Skill-2026-06-23.zip` | 数据清洗 skill。负责把原始地图数据转换成标准地图包，并校验 `map.meta.json`、`map.normalized.json`、瓦片、图标、点位、区域等关系。 | 安装到 Codex skills 目录。提供原始数据后，让 AI 使用这个 skill 写 adapter、生成标准包、跑校验。 |
| `H5-Map-Page-Composer-Skill-2026-06-23.zip` | 页面生成 skill。负责读取 `DESIGN.md`、token、页面 template、组件注册表、mapping 和 `OUTPUT_SCHEMA.json`，生成 `page.output.json`。 | 安装到 Codex skills 目录。标准数据包完整时生成页面 JSON；数据不完整时生成页面骨架，并用 `TODO_FROM_DATASOURCE` 标出缺失数据。 |
| `H5-Map-Renderer-Integrator-Skill-2026-06-23.zip` | 工程接入 skill。负责把 `page.output.json`、标准地图包和组件包接入已有前端工程。 | 需要落地到工程时安装。该 skill 会指导 AI 先安装组件包，再把 renderer 状态、页面区域和组件绑定起来。 |
| `h5-game-tool-components-0.1.1.tgz` | 本地 npm 组件包。包含代码化 React 组件、类型声明、`style.css` 和 `tokens.css`。 | 在目标前端工程中执行 `npm install <path-to>/h5-game-tool-components-0.1.1.tgz`。 |
| `H5-Game-Tool-Components-Package-0.1.1.zip` | 组件库源码包。包含源码、dist、构建配置和 README，用于后续维护组件库。 | 需要改组件、改 token、改样式、重新打包新版本时使用。普通页面接入通常不需要这个 zip。 |
| `H5-Game-Tool-Current-Deliverables-2026-06-23.zip` | 当前交付聚合包。包含本清单、设计侧说明、三个 map skill、组件 tarball 和组件源码包。 | 对外发一份完整当前交付时使用。 |
| `DESIGN_SIDE_DELIVERABLES_FOR_DEV.md` | 开发实现侧说明。解释哪些设计侧交付物不能忽略，哪些只在改布局、改视觉或改组件时需要看。 | 给接入方或工程 AI 阅读。 |

## 组件包安装方式

在目标前端工程根目录执行：

```sh
npm install <path-to>/h5-game-tool-components-0.1.1.tgz
```

安装后在工程入口或全局样式入口引入一次样式：

```ts
import "@h5-game-tool/components/style.css";
```

在页面或 renderer 中引入组件：

```ts
import { Button, SearchBar, Select } from "@h5-game-tool/components";
```

使用 `h5-map-renderer-integrator` skill 时，也可以让 AI 运行：

```sh
node scripts/install-components.mjs --target <front-end-project> --package-spec <path-to>/h5-game-tool-components-0.1.1.tgz
```

## 三个 Skill 分别什么时候用

### 1. 数据清洗：h5-map-data-normalizer

用于这些情况：

- 只有原始爬虫数据。
- 原始数据字段、坐标、分类、点位、瓦片路径需要转换。
- 需要生成标准地图包。
- 需要校验标准地图包是否能被 H5 工具消费。

输出目标是：

```txt
map.meta.json
map.normalized.json
tiles / icons / images
validation report
```

如果坐标含义、瓦片规则、分类关系、详情字段不清楚，这个 skill 应该停下来问问题，不能猜。

### 2. 页面生成：h5-map-page-composer

用于这些情况：

- 已经有标准地图包，需要生成 `page.output.json`。
- 数据还没完全洗好，但需要先按项目组件、token、template 生成页面骨架。
- 需要保证 AI 不乱写页面代码、不乱加组件、不乱改页面区域。

核心参考文件包括：

```txt
references/DESIGN.md
design-system-pack/tokens.css
references/templates/map.json
references/components.json
references/mapping/map.json
references/OUTPUT_SCHEMA.json
```

输出目标是：

```txt
page.output.json
```

数据不完整时，应输出 `TODO_FROM_DATASOURCE`，而不是编造点位、坐标、文案、图片或分类数量。

### 3. 工程接入：h5-map-renderer-integrator

用于这些情况：

- 已经有前端工程。
- 需要把组件包安装进去。
- 需要把 `page.output.json` 和标准地图包接入 renderer。
- 需要绑定搜索、筛选、地图缩放、点位点击、详情卡等运行时状态。

该 skill 不会重新洗数据，也不会重新设计页面，只负责工程接入。

## 当前源码目录

| 路径 | 作用 |
| --- | --- |
| `deliverables/installable-skills/h5-map-data-normalizer/` | 数据清洗 skill 的源码目录。 |
| `deliverables/installable-skills/h5-map-page-composer/` | 页面生成 skill 的源码目录。 |
| `deliverables/installable-skills/h5-map-renderer-integrator/` | 工程接入 skill 的源码目录。 |
| `component-packages/h5-game-tool-components/` | 独立维护的 React 组件库目录。 |
| `skill-pack/` | 仓库内的原始规范来源，包含各工具类型契约、template、schema、token 等。 |
| `docs/` | 计划、实施清单和非打包工作文档。 |
| `src/` | 当前 renderer preview 的源码目录。 |

## 当前规范默认值

- map 默认工具视口：`1160 x 800`
- wiki 默认工具视口：`1000 x 610`
- 地图画布：覆盖整个 `1160 x 800` 工具窗口，Sidebar 和底部操作区叠在其上方
- 组件包版本：`0.1.1`
- token 来源：`design-system-pack/tokens.css`
- 页面生成方式：结构化 JSON，不生成任意 HTML 或任意 React 代码

## 最简交付建议

如果只交付最少文件，建议提供这四个：

```txt
H5-Map-Data-Normalizer-Skill-2026-06-23.zip
H5-Map-Page-Composer-Skill-2026-06-23.zip
H5-Map-Renderer-Integrator-Skill-2026-06-23.zip
h5-game-tool-components-0.1.1.tgz
```

如果需要一份完整当前交付包，提供：

```txt
H5-Game-Tool-Current-Deliverables-2026-06-23.zip
```
