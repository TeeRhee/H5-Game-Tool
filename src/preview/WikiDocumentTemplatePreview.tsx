import { useState } from "react";
import {
  Background,
  Breadcrumbs,
  CommandMenuItem,
  Header,
  Navigate,
  TopBar,
} from "../components/game-tool";

const topBarItems = [
  { id: "role", label: "角色" },
  { id: "armament", label: "武器" },
  { id: "camp", label: "阵营" },
  { id: "event", label: "事件", state: "active" as const },
  { id: "map", label: "地图" },
  { id: "record", label: "记录" },
];

const breadcrumbItems = [
  { id: "home", label: "首页" },
  { id: "event", label: "事件" },
  { id: "document", label: "迷宫回响图文攻略", state: "active" as const },
];

const anchorItems = [
  { id: "intro", label: "玩法概述", state: "active" as const },
  { id: "route", label: "路线选择" },
  { id: "boss", label: "首领机制" },
  { id: "reward", label: "奖励说明" },
  { id: "tips", label: "注意事项" },
];

const relatedItems = [
  { id: "r1", label: "活动总览", badge: "推荐" },
  { id: "r2", label: "词条与增益优先级", badge: "攻略" },
  { id: "r3", label: "首领速通阵容", badge: "阵容" },
  { id: "r4", label: "机关解谜细节", badge: "图文" },
  { id: "r5", label: "奖励兑换建议", badge: "掉落" },
  { id: "r6", label: "阶段任务列表", badge: "任务" },
];

const paragraphBlocks = [
  "本次事件页中的 document 页面应按 article-like guide detail 处理，而不是普通结构化详情卡。正文区域需要完整承载长段落说明、流程提示和图文混排内容，不能退化成展示卡片或表格式详情。",
  "中间正文遵循 ArticleBody 规则：正文块从 ArticleContent 的 y=64 开始，正文内容块之间保持 8px 垂直间距。12px 字号和 18px 行高属于段内排版规则，不等于段落之间的外部间距。",
  "左侧仅允许真实文章锚点导航。它的职责是帮助读者在当前文章内部定位章节，不应该拿来承载相关链接、外部跳转或伪目录占位。",
  "右侧相关信息必须使用 Nav.CommandMenuItem 继续向下堆叠。当前预览故意放了 6 条，验证最近调整后的规则：四条只是 Figma 可见样例，不是最大条数上限。",
];

export function WikiDocumentTemplatePreview() {
  const [activeAnchorId, setActiveAnchorId] = useState(anchorItems[0]?.id ?? "intro");

  return (
    <section className="wiki-document-template-workspace">
      <div className="wiki-document-template-stage" aria-label="Event document guide preview">
        <Background className="wiki-document-template-frame">
          <Header searchPlaceholder="搜索攻略">
            <TopBar items={topBarItems} activeId="event" />
          </Header>

          <div className="wiki-document-template-body">
            <Breadcrumbs className="wiki-document-template-breadcrumbs" items={breadcrumbItems} />

            <div className="wiki-document-template-layout">
              <Navigate
                className="wiki-document-template-nav"
                items={anchorItems}
                activeId={activeAnchorId}
                onActiveChange={setActiveAnchorId}
              />

              <article className="wiki-document-template-article">
                <div className="wiki-document-template-title-row">
                  <h2>迷宫回响图文攻略</h2>
                  <span className="wiki-document-template-title-pill">事件 Document</span>
                </div>

                <div className="wiki-document-template-meta-row">
                  <span>活动事件</span>
                  <span>·</span>
                  <span>2026-07-03</span>
                  <span>·</span>
                  <span>6 分钟阅读</span>
                </div>

                <div className="wiki-document-template-article-body">
                  <img
                    className="wiki-document-template-hero"
                    src="/assets/preview/map-placeholder.png"
                    alt="事件 document 示例主图"
                  />

                  {paragraphBlocks.map((paragraph) => (
                    <p key={paragraph} className="wiki-document-template-paragraph">
                      {paragraph}
                    </p>
                  ))}

                  <section className="wiki-document-template-related-section">
                    <h3>阶段流程</h3>
                    <p className="wiki-document-template-paragraph">
                      文章扩展块仍然属于正文流的一部分。只有 source 真有补充说明、嵌入媒体或附加文档块时才渲染；
                      一旦渲染，它应继续遵守 document guide 的正文宽度与间距，而不是切换成卡片列表语义。
                    </p>
                  </section>
                </div>
              </article>

              <aside className="wiki-document-template-info">
                <div className="wiki-document-template-info__title">相关信息</div>
                <div className="wiki-document-template-info__list">
                  {relatedItems.map((item) => (
                    <CommandMenuItem key={item.id} badge={item.badge}>
                      {item.label}
                    </CommandMenuItem>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </Background>
      </div>

      <aside className="wiki-document-template-audit" aria-label="Document guide audit notes">
        <p className="preview-kicker">Document audit</p>
        <h2>Event Document Checks</h2>
        <p>这张预览页把事件下的 document 页面按 `guide.document-detail` 拼成真实页面，而不是只展示单个组件。</p>
        <ul>
          <li>中间正文使用 `ArticleBody gap=8`，不是把 `12/18` 行高误当段间距。</li>
          <li>左侧只保留真实文章锚点，未把相关链接混进 `Nav.Navigate`。</li>
          <li>右侧相关信息使用 `Nav.CommandMenuItem`，并故意展示超过 4 条来验证新规则。</li>
          <li>顶栏激活 `事件`，面包屑作为 final detail 页面渲染在正文上方。</li>
        </ul>
      </aside>
    </section>
  );
}
