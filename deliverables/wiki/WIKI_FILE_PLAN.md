# Wiki 类 Demo 文件计划表

本文档用于把现有 Wiki demo 改造成设计侧定义的 Wiki 工具页面。表格中的文件按建议实施顺序排列；每完成一项，都应同步跑一次本地页面检查或类型检查。

## 实施原则

- 先集中组件和 token，再改页面框架。
- `DESIGN.md` 是人读规则书，不能替代 template、component registry、mapping 或 schema。
- 现有 demo 的路由、数据读取、埋点和运行脚本先保留；只在明确需要时替换。
- 新增文件优先放在 Wiki 专属目录，避免和 map 工具契约混在一起。

## 文件计划表

| 顺序 | 文件路径 | 新建/复用 | 具体作用 | 依赖输入 | 验收方式 |
| --- | --- | --- | --- | --- | --- |
| 1 | `src/components/game-tool/index.ts` | 复用并维护 | 组件唯一导出入口。所有可被 Wiki demo 使用的基础组件都从这里导出，避免页面直接散落引用内部文件。 | 已实现组件源码 | 页面引用只从该入口导入；新增组件时同步导出。 |
| 2 | `src/preview/ComponentGallery.tsx` | 新建 | 组件预览页。展示 Button、SearchBar、Select、Checkbox、Dropdown、PictureTitle、Tooltip、DescribeCard、Divider、Scroll、RemixIcon，以及当前 token 清单。 | `src/components/game-tool/`、`design-system-pack/tokens.css` | `npm run dev` 打开默认页面可看到组件和 token。 |
| 3 | `src/preview/ComponentPreview.tsx` | 复用并改造 | 预览工作台入口。负责在组件库预览和现有地图 demo 之间切换。 | `ComponentGallery.tsx`、原地图 demo 逻辑 | 默认进入 Components；切到 Map demo 后原地图仍可加载。 |
| 4 | `src/styles.css` | 复用并扩展 | 全局样式、组件样式、预览页样式、token 表格样式。必须继续引入当前 token 文件。 | `design-system-pack/tokens.css` | 组件预览页无文本溢出，移动端单列展示。 |
| 5 | `skill-pack/wiki/DESIGN.md` | 新建 | Wiki 页面的人读设计规则：页面框架、信息层级、组件使用边界、响应式策略、禁止自由发挥项。 | Figma Wiki 设计、现有 demo 截图 | AI 能据此说明页面结构，但不把它当机器契约。 |
| 6 | `skill-pack/wiki/tokens.css` | 暂不创建 | Wiki 当前直接使用 `design-system-pack/tokens.css`。如果后续 Wiki 需要独立 token 再拆分，不在当前版本重复存放。 | 当前 token 文件 | CSS 变量无未定义引用；和组件预览页显示一致。 |
| 7 | `skill-pack/components.json` | 复用并维护 | 共享组件注册表。Wiki 不再单独维护组件注册表；具体哪些组件能出现在 Wiki 页面里，由 `skill-pack/wiki/templates/wiki.json` 的 region 规则决定。 | 组件预览页、Figma 组件命名 | 注册表中的组件都能在源码中找到实现，Wiki template 引用的组件都在注册表内。 |
| 8 | `skill-pack/wiki/templates/wiki.json` | 新建 | Wiki 页面机器可读骨架。定义 1160x800 默认画布、顶部区域、导航区、内容列表区、详情区、分页或筛选区。 | `DESIGN.md`、Wiki demo 信息架构 | JSON 能表达页面区块，不包含编造数据。 |
| 9 | `skill-pack/wiki/mapping/wiki.json` | 新建 | demo 数据字段到组件 props 的映射层。记录标题、分类、图标、图片、正文、标签、状态等字段来自哪里。 | 前端 demo 数据结构 | 不清楚的字段使用 `TODO_FROM_DATASOURCE`。 |
| 10 | `skill-pack/wiki/OUTPUT_SCHEMA.json` | 新建 | 如果 Wiki 后续要走结构化页面生成，用它约束输出格式，防止 AI 生成任意 HTML/React。 | template、components、mapping | schema 能校验 Wiki page output。 |
| 11 | `skill-pack/wiki/examples/wiki.page.output.json` | 新建 | Wiki 页面结构化输出示例。只放真实 demo 字段或明确 mock 字段。 | schema、mapping、demo 数据 | 可作为 renderer 或 AI 修改源码时的结构参考。 |
| 12 | `deliverables/wiki/WIKI_FILE_PLAN.md` | 新建 | 当前文件。作为实施清单和交付边界说明，后续按实际完成情况更新。 | 本次工作流定义 | 表格能指导逐文件实现。 |
| 13 | `deliverables/wiki/IMPLEMENTATION_BRIEF.md` | 新建 | 给工程 AI 的源码改造说明：目标页面、需要替换的文件、保留项、验收命令、截图要求。 | Wiki demo 工程结构 | AI 能按 brief 直接改源码。 |
| 14 | `deliverables/wiki/acceptance-checklist.md` | 新建 | 验收清单：桌面、移动端、组件一致性、token 引用、无未定义 CSS 变量、无横向溢出。 | 最终页面 | 每次修改后逐项打勾。 |

## 当前优先级

第一阶段只需要完成 1-4 和 12，让所有组件、token、预览页先集中起来。

第二阶段再做 5-9，把 Wiki 设计规则、共享组件引用、template 和 mapping 固化。

第三阶段视工程需要决定是否做 10-11。如果前端继续直接改源码，这两个可以延后；如果要让 AI 生成结构化页面，再补齐。
