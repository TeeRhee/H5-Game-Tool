# 游戏轻工具 Skill Pack 交接说明

这个项目的目标是建立一套受约束的 AI 生成流程：开发提供游戏相关数据源后，AI 不自由发挥页面，而是按固定规则完成“匹配工具类型 -> 调用页面模板 -> 选择已注册组件 -> 填入数据 -> 输出结构化 JSON -> 渲染 H5 页面”。

当前优先跑通 `map` 地图工具类型。`wiki` 和 `guide-config` 已注册为未来类型，但还没有进入完整设计契约和渲染链路。

## 项目目标

- 用少量稳定工具类型限制 AI 生成范围，先覆盖地图工具、Wiki、攻略配置。
- 为每个工具类型预设页面信息结构，让不同数据源生成出来的页面保持一致。
- 让 AI 只在模板、组件注册表、数据映射和输出 schema 允许的范围内工作。
- 将 Figma 设计组件逐步代码化，形成可被 H5 渲染器调用的真实组件库。
- 最终让新数据源进入后，可以自动生成可校验、可渲染、结构稳定的 H5 工具页面。

## 当前总体规划

第一阶段只做地图类型闭环：

1. 确认地图类型的 Figma 页面框架、组件和 token。
2. 建立设计契约文件：工具类型、地图模板、组件注册表、输出 schema。
3. 建立 React + TypeScript 组件壳，把 Figma 组件转成可运行 H5 组件。
4. 等开发提供真实地图数据源。
5. 基于真实数据源补齐 `datasource-schema/map.json`。
6. 基于真实字段补齐 `mapping/map.json`。
7. 用真实或开发确认的 mock 数据补齐 `examples/map.json`。
8. 做校验脚本和 renderer，完成 source data -> output JSON -> H5 page 的完整流程。

第二阶段再复制方法到 `wiki` 和 `guide-config`，不要在地图链路跑通前同时展开三类完整实现。

## 当前已经完成

设计契约层：

- `SKILL.md`: AI 执行规则，包含禁止捏造数据源字段、坐标格式和样例内容的规则。
- `tool-types.json`: 注册了 `map`、`wiki`、`guide-config` 三种工具类型。
- `templates/map.json`: 基于现有 Figma 地图框架定义地图页面区域。
- `components/map.json`: 基于 Figma 中已观察到的组件建立地图组件注册表。
- `MAP_V0_STATUS.md`: 记录当前地图类型 v0 已确认的预览布局、交互和占位资源状态。
- `OUTPUT_SCHEMA.json`: 定义 AI 最终输出 JSON 的通用外层结构。
- `schemas/`: 为当前 JSON 契约提供本地 schema。
- `tokens/tokens.css`: 已复制现有设计 token，包含颜色、字体、间距、圆角等 CSS 变量。

代码组件层：

- 项目已建立 Vite + React + TypeScript 代码壳。
- `src/components/game-tool/` 下已有地图流程需要的基础组件文件，例如 Button、SearchBar、Select、Checkbox、DropdownCard、Tooltip、DescribeCard 等。
- `src/preview/ComponentPreview.tsx` 用于本地预览这些组件。
- 图标使用 `remixicon` npm 包，图标 props 应使用 Remix 命名，例如 `map-pin-line` 或 `ri-map-pin-line`。

等待区：

- `datasource-schema/README.md`: 说明数据源 schema 不能提前捏造。
- `mapping/README.md`: 说明字段到组件 props 的映射必须等真实数据源。
- `examples/README.md`: 说明示例必须来自真实数据或开发确认的 mock 数据。

## 当前没有完成

以下内容必须等开发数据源或进一步确认，不能由 AI 猜：

- 真实地图数据字段。
- 地图坐标格式。
- 地图底图、瓦片或图片资源格式。
- 点位、分类、筛选、详情之间的数据关系。
- 字段到组件 props 的映射。
- 完整输入输出 example。
- wiki 页面模板细节。
- 攻略配置页面模板细节。
- 最终 renderer 的数据绑定规则。
- CI 校验脚本。

需要等待数据源的地方统一使用 `TODO_FROM_DATASOURCE`。

## 文件作用

- `SKILL.md`: 给 AI 看的执行手册，说明应该按什么流程工作、哪些事情禁止做。
- `tool-types.json`: 工具类型目录，AI 用它判断数据源应该走地图、Wiki 还是攻略配置。
- `templates/map.json`: 地图页面骨架，定义页面区域和每个区域允许出现的组件。
- `components/map.json`: 地图组件注册表，定义地图类型目前可使用的 Figma/代码组件。
- `MAP_V0_STATUS.md`: 地图 v0 封版记录，说明当前已确认的布局、交互、占位资产和仍待数据源补齐的部分。
- `OUTPUT_SCHEMA.json`: AI 最终输出 JSON 的格式约束，防止输出任意页面代码。
- `tokens/tokens.css`: 设计 token，代码组件应优先使用这里的 CSS 变量保持视觉一致。
- `schemas/*.json`: 当前契约文件的校验 schema。
- `datasource-schema/`: 等开发提供真实数据源后，放各工具类型的数据源 schema。
- `mapping/`: 等真实字段确认后，放数据字段到组件 props 的映射。
- `examples/`: 等真实或确认 mock 数据后，放输入到输出的黄金样例。

## 关键原则

- 不要捏造不存在的数据字段。
- 不要捏造坐标结构。
- 不要捏造点位、筛选、分类、详情样例。
- 不要把 Figma 中不存在、代码中也未实现的东西登记为已可用组件。
- AI 输出必须是结构化 JSON，不能直接自由生成 H5 页面代码。
- Figma 是设计源，React 组件是运行源，组件注册表是 AI 可用组件清单。
- 地图左侧顶部区域是游戏 Logo 预留区，应使用用户提供的 Logo 图片资产；不要生成假的游戏 Logo，也不要把普通文字标题渲染到该区域。
- 地图主区域的拖拽、滚轮缩放属于 map canvas 布局/渲染能力；底图随缩放变化，点位标记保持固定视觉尺寸。
- 地图 `map.canvas` 是覆盖整个 `1160 x 800` 弹窗的底层画布；左侧 Sidebar 和底部 Footer 叠在画布上方。不要把 `map.canvas` 误定义成右侧局部区域。
- Map Sidebar 当前按 Figma 模板使用 `x=12, y=12, w=264, h=776, radius=8`。
- 左侧筛选列表使用 `Layout.Scroll` 作为视觉滚动条；当前模板实例为 `x=252, y=102, w=12, h=586`，由渲染器绑定真实列表滚动状态，不来自数据源字段。
- `Layout.DescribeCard` 当前固定在模板右下角：`x=868, y=522, w=280, h=266`。
- 鼠标位于地图底图/画布区域时，拖拽和滚轮应由地图画布接管；不要触发浏览器图片拖拽，也不要让外层预览页随滚轮滚动。
- 地图底部主操作按钮用于取消所有筛选：清空搜索文本，并取消所有已选筛选项。
- 地图模板颜色以 Figma 节点 `58:11293` 为准：窗口背景 `#1F2224`，面板/详情/缩放控件 `#2C3134`，搜索框 `#353A3D`，字段描边 `#43484B`。
- 本地预览页使用 `public/assets/preview/` 下的用户提供图片作为占位：`map-placeholder.png` 是地图底图占位，`game-logo-placeholder.png` 是 Logo 占位；它们不是通用默认数据。

## 组件同步清单

当 Figma 组件发生变化时，需要同步检查这些地方：

- React 组件实现：`src/components/game-tool/`
- 组件样式：`src/styles.css`
- 本地预览：`src/preview/ComponentPreview.tsx`
- 组件注册表：`skill-pack/components/map.json`
- Figma 组件文档卡片
- build 和 JSON 校验结果

## 下一步建议

在开发提供地图数据源前，可以继续做：

- 对齐 Figma 组件和 React 组件的命名、状态、props。
- 检查 `components/map.json` 是否准确反映代码组件能力。
- 补充组件 props 定义，但只写组件自身需要的通用 props，不绑定数据源字段。
- 继续完善本地组件预览，确保设计 token 在代码中生效。

开发提供地图数据源后，再做：

- 创建 `datasource-schema/map.json`。
- 创建 `mapping/map.json`。
- 创建 `examples/map.json`。
- 补充 output JSON 校验脚本。
- 实现或完善 renderer，跑通地图类型完整链路。
