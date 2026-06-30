# Wiki 实现 Brief

本文档给后续工程改造或 AI 接入使用。它说明 Wiki 类页面应该怎么接入当前仓库，以及哪些边界不能被实现过程顺手改掉。

## 目标

把 Wiki 类页面作为独立工具类型接入当前游戏轻工具 UI 工程。Wiki 使用共享 token、共享组件库、Wiki 专属 template 和 Wiki 专属 mapping，不复用 map 的页面模板，也不把 Wiki 规则写进 map 文件。

当前目标只覆盖桌面 Wiki：

- 默认画布：`1000 x 610`
- 页面状态：Home、Secondary list、Detail
- 组件来源：`skill-pack/components.json` 和 `src/components/game-tool/index.ts`
- 视觉规范来源：`design-system-pack/tokens.css`
- 页面规则来源：`skill-pack/wiki/DESIGN.md`
- 机器模板来源：`skill-pack/wiki/templates/wiki.json`
- 字段映射草案来源：`skill-pack/wiki/mapping/wiki.json`

移动端 Wiki、真实 datasource、Wiki 输出 schema、真实 page output 示例目前都还没有确认。

## 当前已确认输入

已确认：

- Figma 文件：`fnA9NEBTDyxU94M0fvNy8e`
- Wiki 页面节点：`167:628`
- Home 状态节点：`167:630`
- Secondary list 状态节点：`304:5972`
- Detail large card expanded 状态节点：`304:17202`
- Detail all states 状态节点：`304:9319`
- Wiki 默认桌面画布：`1000 x 610`
- Wiki 使用共享组件注册表，不维护专属组件注册表
- Wiki 当前使用 `design-system-pack/tokens.css`，不创建 `skill-pack/wiki/tokens.css`

未确认：

- Wiki datasource 包结构
- 真实字段名和字段路径
- 路由结构
- 真实图片、图标、分类、数量、分页、属性、表格数据
- 移动端布局
- Wiki 页面输出 schema
- Wiki page output 示例

## 文件边界

实现 Wiki 页面时可以读取这些文件作为规则源：

- `skill-pack/wiki/DESIGN.md`
- `skill-pack/wiki/templates/wiki.json`
- `skill-pack/wiki/mapping/wiki.json`
- `skill-pack/components.json`
- `skill-pack/tool-types.json`
- `design-system-pack/tokens.css`
- `src/components/game-tool/index.ts`
- `src/preview/ComponentPreview.tsx`
- `src/preview/ComponentGallery.tsx`

实现 Wiki 页面时不要把以下内容当作 Wiki 规则源：

- `skill-pack/map/templates/map.json`
- `skill-pack/map/mapping/map.json`
- `skill-pack/map/datasource-schema/*`
- `public/data/crimsondesert/map.*.json`
- `public/data/crimsondesert/page.output.json`

map 当前是完整链路示例，Wiki 当前只是 template 和 mapping 草案。可以参考 map 的工程组织方式，但不能复用 map 的地图字段、坐标、瓦片、marker、area、filter 语义。

## 实现范围

第一版 Wiki 前端实现建议只做桌面预览或桌面页面壳：

1. 在当前预览入口增加 Wiki 视图，或在宿主工程中增加 Wiki 独立入口。
2. 按 `skill-pack/wiki/templates/wiki.json` 的 region 渲染页面结构。
3. 只使用 region `allowedComponents` 中允许的共享组件。
4. 数据绑定只使用确认过的 datasource 或开发批准的 mock。
5. 未确认字段继续保留为 `TODO_FROM_DATASOURCE`，不要在最终 UI 里显示假字段。
6. 详情页长内容使用真实滚动；`Layout.Scroll` 只作为视觉滚动状态组件。
7. 保持 Wiki 默认画布为 `1000 x 610`，内容溢出时纵向滚动。

如果实现过程中发现缺少组件：

- 先确认该组件是否已经存在于 `src/components/game-tool/`
- 如果确实需要新增通用组件，组件源码放在 `src/components/game-tool/`
- 同步从 `src/components/game-tool/index.ts` 导出
- 同步维护 `skill-pack/components.json`
- 如果要交付给外部仓库，也要同步 `component-packages/h5-game-tool-components/`

不要为单个 Wiki 页面临时创建只在页面内部使用的私有组件，除非它已经被确认不适合进入共享组件库。

## 数据规则

在 Wiki datasource 未确认前：

- 不要发明 `category.name`、`entry.title`、`detail.attributes` 之类的真实字段路径。
- 不要把演示文案、截图文字、组件预览文字当作最终数据。
- 不要硬编码分类数、条目数、分页数、进度值、badge、表格行。
- 面包屑、分页、搜索值可以来自 renderer state 或 routing context，但必须在实现里标清来源。
- 可选区块没有数据时应折叠，不应显示假内容。

允许在开发预览中使用 mock，但 mock 必须满足两个条件：

- 文件名或注释明确标注为 development mock
- 不进入最终 skill-pack contract 作为真实字段定义

## 推荐实现顺序

1. 读取 `skill-pack/wiki/templates/wiki.json`，确认 region、allowedComponents、画布尺寸。
2. 读取 `skill-pack/wiki/mapping/wiki.json`，确认哪些字段仍是 `TODO_FROM_DATASOURCE`。
3. 在预览或宿主页面里建立 Wiki desktop shell。
4. 先完成 Home，再完成 Secondary list，最后完成 Detail。
5. 接入共享组件，不新增页面私有样式体系。
6. 接入 development mock 时，把 mock 和真实 datasource 明确分开。
7. 跑校验和构建。
8. 按 `docs/wiki/acceptance-checklist.md` 逐项验收。

## 验收命令

每次完成 Wiki 相关改造后至少运行：

```sh
npm run validate:skill-pack
npm run build
```

如果新增了 datasource、schema、output 示例，再补充对应的 schema 校验命令。当前仓库还没有 Wiki datasource 校验命令。

## 暂不处理

以下内容不在当前 brief 范围内：

- 移动端 Wiki 页面
- Wiki datasource schema
- Wiki output schema
- Wiki page output 示例
- 真实游戏 Wiki 内容采集或清洗
- map 工具链改造
- deliverables zip 重新打包

这些内容需要新的设计节点、数据源定义或明确交付要求后再开始。
