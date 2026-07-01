# Wiki 验收清单

本文档用于每次修改 Wiki 类页面、Wiki template、Wiki mapping、共享组件或 token 后做验收。当前只验收桌面 Wiki，不验收移动端。

## 1. 仓库状态

- [ ] 工作区没有无关改动。
- [ ] 本次变更只涉及 Wiki、共享组件、共享 token、预览入口或必要文档。
- [ ] 如果改了组件源码，确认 `src/components/game-tool/` 和 `component-packages/h5-game-tool-components/` 是否需要同步。
- [ ] 如果改了交付物，确认 `deliverables/CURRENT_DELIVERABLES.md` 是否需要同步更新。

## 2. 契约文件

- [ ] `skill-pack/tool-types.json` 中 `wiki` 指向 `wiki/templates/wiki.json`。
- [ ] `skill-pack/tool-types.json` 中 `wiki` 指向 `wiki/mapping/wiki.json`。
- [ ] `skill-pack/wiki/templates/wiki.json` 的默认画布是 `1000 x 610`。
- [ ] `skill-pack/wiki/templates/wiki.json` 没有混入 map 的 region、marker、tile、area、coordinate 概念。
- [ ] `skill-pack/wiki/mapping/wiki.json` 没有发明未确认的 datasource 字段。
- [ ] `skill-pack/wiki/DESIGN.md` 仍然是人读规则，不替代 template、mapping、schema 或 component registry。
- [ ] Wiki 没有新增专属组件注册表，组件仍统一维护在 `skill-pack/components.json`。

## 3. 组件使用

- [ ] 页面只使用对应 region 的 `allowedComponents`。
- [ ] 新增组件时，组件源码放在 `src/components/game-tool/`。
- [ ] 新增组件时，已从 `src/components/game-tool/index.ts` 导出。
- [ ] 新增组件时，已登记到 `skill-pack/components.json`。
- [ ] 新增组件需要外部安装调用时，已同步到 `component-packages/h5-game-tool-components/`。
- [ ] 没有把 map 专属交互组件当成 Wiki 组件使用。

## 4. Token 和样式

- [ ] Wiki 使用 `design-system-pack/tokens.css`。
- [ ] 当前版本没有创建 `skill-pack/wiki/tokens.css`。
- [ ] 新样式优先使用语义 token，例如 `--color-bg-*`、`--color-text-*`、`--color-stroke-*`、`--space-*`、`--radius-*`、`--type-*`。
- [ ] 没有新增未定义的 `var(--...)` 引用。
- [ ] 没有重复维护多份互相冲突的 CSS 规则。
- [ ] 文本、按钮、卡片内容在 `1000 x 610` 桌面画布内不互相遮挡。

## 5. 桌面页面表现

- [ ] Home 状态包含 header、summary、四列 category grid。
- [ ] Secondary list 状态包含 header、三列 card list、pagination，不显示 breadcrumbs。
- [ ] Detail 状态包含 header、breadcrumbs、hero card、attribute section、related section、structured detail section。
- [ ] Detail 长内容使用真实纵向滚动。
- [ ] `Layout.Scroll` 只表达滚动状态，不替代页面真实滚动。
- [ ] 面包屑层级和 active 状态来自 datasource、routing context 或 renderer state。
- [ ] 分页状态来自 datasource 或 renderer state，不使用硬编码最终值。

## 6. 数据和空状态

- [ ] 未确认字段仍标记为 `TODO_FROM_DATASOURCE`，没有被写成真实字段名。
- [ ] 开发 mock 与真实 datasource 明确分离。
- [ ] 最终页面不显示假分类、假数量、假图片、假 badge、假表格行。
- [ ] 可选字段缺失时，对应 UI 元素折叠或隐藏。
- [ ] 表格数据存在时使用结构化 columns 和 rows，不把表格塞进纯文本。

## 7. 基础可用性

- [ ] 可点击元素使用 button 或明确的交互语义。
- [ ] 图标按钮有 `aria-label` 或等价可访问名称。
- [ ] 搜索、分页、面包屑、卡片点击不会产生控制台错误。
- [ ] 键盘焦点状态可见。
- [ ] 页面没有横向滚动条，除非某个确认过的内容容器明确需要横向滚动。

## 8. 校验命令

必须通过：

```sh
npm run validate:skill-pack
npm run build
```

如果新增 Wiki datasource、output schema 或 example，再增加对应校验项。当前仓库尚未定义 Wiki datasource 校验命令。

## 9. 当前不适用

这些项当前不验收，除非已有新的设计或数据输入：

- [ ] 移动端 Wiki 布局
- [ ] Wiki datasource schema
- [ ] Wiki `OUTPUT_SCHEMA.json`
- [ ] Wiki `examples/wiki.page.output.json`
- [ ] 真实游戏 Wiki 数据采集

## 10. 完成标准

一次 Wiki 修改可以认为完成，需要同时满足：

- [ ] 契约文件通过校验。
- [ ] 构建通过。
- [ ] 页面或预览没有明显遮挡、溢出、错用组件。
- [ ] 没有编造未确认 datasource 字段。
- [ ] 相关文档已同步更新。
