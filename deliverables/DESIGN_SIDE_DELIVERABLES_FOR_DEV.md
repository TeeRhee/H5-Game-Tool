# 设计侧交付内容与开发实现取舍

本文档面向开发实现侧，说明当前 H5 Game Tool 项目里哪些内容属于设计侧交付、它们的具体作用，以及在开发落地时是否可以忽略。

当前判断基准为 2026-06-23 交付结构：三个 installable skill、一个本地组件包、一个可选 renderer demo。默认工具视口为 `1160 x 800`。

## 总结

开发实现侧不能只看 Figma 截图或 `DESIGN.md`。当前链路把设计侧内容拆成两类：

- 人可读设计规则：帮助开发理解视觉、布局、交互边界。
- 机器可读契约：约束 AI、页面生成脚本和 renderer，开发实现不能随意忽略。

如果只是接入已有组件包和 `page.output.json`，大多数设计原始资料可以不直接阅读，但不能删除或绕过已经固化在 skill、组件包和 schema 里的契约文件。

## 设计侧交付物清单

| 交付内容 | 位置 | 具体作用 | 开发实现侧是否可以忽略 | 结论 |
| --- | --- | --- | --- | --- |
| Figma 地图模板 | Figma file `fnA9NEBTDyxU94M0fvNy8e`, node `58:11293` | 原始设计源。定义地图弹窗结构、层级、视觉尺寸、颜色和组件关系。 | 日常接入可以不直接打开；实现布局、修视觉差异、同步新设计时不能忽略。 | 可作为参考忽略，不能作为源头废弃。 |
| `DESIGN.md` | `deliverables/installable-skills/h5-map-page-composer/references/DESIGN.md` | 人可读设计规则。说明布局、视觉、组件使用、不要自由发挥的规则。 | 如果只安装组件包并接入现成输出，可以不逐行阅读；如果要改 renderer、改布局或让 AI 重新生成页面，不能忽略。 | 条件性可忽略。 |
| `tokens.css` | `design-system-pack/tokens.css`; 组件包内 `tokens.css` | 设计 token。承载颜色、字体、间距、圆角等视觉变量，是代码组件和生成结果保持一致的基础。 | 不能忽略。可以不手工改，但必须被组件包或全局样式正确引入。 | 不可忽略。 |
| `templates/map.json` | `skill-pack/map/templates/map.json`; page composer references | 地图页面骨架。定义 `1160 x 800` 页面区域、组件槽位、布局结构。 | 如果只渲染既有 `page.output.json`，可以不直接读；如果要生成页面或改页面结构，不能忽略。 | 条件性可忽略。 |
| `components/map.json` | `skill-pack/components.json`; page composer references | 组件注册表。定义 AI 当前允许使用哪些 Figma/React 组件。 | 不能在页面生成链路里忽略，否则 AI 可能使用不存在或未实现的组件。纯手写 renderer 时可以作为参考，但不建议跳过。 | 生成链路不可忽略。 |
| `mapping/map.json` | `skill-pack/mapping/map.json`; page composer references | 数据字段到页面组件 props 的绑定层。当前仍受真实数据源限制。 | 当前真实数据字段未最终确认时，不能擅自补全；实现侧可以暂时不依赖完整映射，但不能编造字段。 | 当前可暂缓，不可伪造。 |
| `OUTPUT_SCHEMA.json` | `skill-pack/OUTPUT_SCHEMA.json`; page composer references | 页面输出 JSON 的格式约束。防止 AI 输出任意 HTML 或任意 React 代码。 | 不能忽略。renderer 和页面生成都应接受这个结构化输出边界。 | 不可忽略。 |
| `MAP_V0_STATUS.md` | `skill-pack/MAP_V0_STATUS.md` | 地图 V0 封版记录。记录已确认布局、交互、占位资源和仍待数据源补齐项。 | 日常接入可以不读；调试布局、交互、层级和数据缺口时必须参考。 | 条件性可忽略。 |
| 组件包源码 | `component-packages/h5-game-tool-components/` | React 组件、样式、token、类型声明的维护源。 | 只接入页面时可以不打开源码；需要改组件、改 token、发新版本时不能忽略。 | 条件性可忽略。 |
| 组件包 tarball | `deliverables/h5-game-tool-components-0.1.1.tgz` | 开发工程实际安装的本地 npm 包。包含可运行 React 组件、类型声明、`style.css` 和 `tokens.css`。 | 不能忽略。目标前端工程必须安装它或等价集成其内容。 | 不可忽略。 |
| 预览占位图片 | `public/assets/preview/map-placeholder.png`; `public/assets/preview/game-logo-placeholder.png` | 本地 preview 用的地图和 Logo 占位图。不是通用数据默认值。 | 开发接入真实数据时可以忽略；跑当前 demo 或对齐 preview 时需要保留。 | 可忽略，不能误当真实数据。 |
| renderer demo | `deliverables/H5-Game-Map-Renderer-Demo-2026-06-18.zip`; 当前仓库 `src/` | 可运行参考工程，用于查看地图页面和 Crimson Desert 示例。 | 如果目标工程已有 renderer，可以不直接交付 demo；如果要验证效果或参考实现，不能忽略。 | 可选。 |

## 开发实现侧最小必需内容

如果目标只是把当前地图工具接入一个前端工程，最少需要：

```txt
h5-game-tool-components-0.1.1.tgz
page.output.json
标准地图包：
  map.meta.json
  map.normalized.json
  maps/
  icons/
  images/
```

同时需要遵守：

- 引入组件包样式：`import "@h5-game-tool/components/style.css";`
- 以 `OUTPUT_SCHEMA.json` 约束 `page.output.json`。
- 以标准地图包作为数据入口，不直接消费原始爬虫数据。
- 保持默认工具视口 `1160 x 800`，不要把地图画布误写成右侧局部区域。

## 可以忽略的情况

以下情况可以不直接阅读或处理设计侧源文件：

- 只安装 `h5-game-tool-components-0.1.1.tgz` 并使用既有组件。
- 只渲染已经生成并校验过的 `page.output.json`。
- 只跑已有 Crimson Desert demo，不修改视觉和交互。
- 目标工程只需要复用组件包，不维护组件源码。

这些情况下，设计侧内容已经通过组件包、样式、token、schema 和生成结果间接进入实现侧。

## 不能忽略的情况

以下情况必须回到设计侧契约：

- 修改页面布局、区域尺寸、层级或交互行为。
- 修改颜色、字体、圆角、间距或视觉状态。
- 新增、删除或替换组件。
- 让 AI 重新生成 `page.output.json`。
- 把新游戏数据源接入地图工具。
- 判断某个字段、点位、分类、详情是否应该出现在页面里。
- 准备扩展到 `wiki` 或 `guide-config`。

## 关键结论

1. `DESIGN.md` 不是机器契约的替代品。
   它是人可读规则，不能替代 `skill-pack/map/templates/map.json`、`skill-pack/components.json`、`skill-pack/map/mapping/map.json` 和 `OUTPUT_SCHEMA.json`。

2. Figma 是设计源，React 组件是运行源。
   开发最终运行的是组件包和 renderer，不是 Figma 文件；但组件包和 renderer 的视觉边界来自 Figma。

3. `tokens.css` 不能被当成可选装饰。
   它是设计系统进入代码的主要通道。忽略 token 会导致颜色、尺寸、状态和后续设计同步失控。

4. `components.json` 是 AI 可用组件清单。
   如果页面生成绕过它，AI 可能生成 Figma 中不存在或代码中未实现的组件。

5. `mapping/map.json` 当前不能靠猜补齐。
   真实字段、坐标、分类、点位和详情关系必须来自开发数据源或确认 mock。

6. renderer demo 是参考工程，不是必须交付给线上工程的依赖。
   真正的实现依赖是组件包、标准地图包和结构化页面输出。

## 建议给开发的交付口径

可以这样交付给开发：

```txt
设计侧已经沉淀为固定页面契约、组件注册表、token 和输出 schema。
开发实现时不需要直接还原 Figma，也不需要让 AI 自由写页面。
目标工程只需要安装组件包，接入标准地图包和 page.output.json，并遵守 1160 x 800 的地图工具布局规则。
如果需要改视觉、改布局、改组件或接入新数据源，再回到 DESIGN.md、design-system-pack/tokens.css、skill-pack/map/templates/map.json、skill-pack/components.json、skill-pack/map/mapping/map.json 和 OUTPUT_SCHEMA.json。
```
