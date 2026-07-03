import type { CSSProperties } from "react";
import { Background, CategoryCard, Header, Scroll, TopBar } from "../components/game-tool";
import { getObservedScrollbarTop, getWikiHomeTemplateChecks, wikiHomeTemplateLayout } from "./wikiHomeTemplateModel";

const topBarItems = Array.from({ length: wikiHomeTemplateLayout.header.topBar.itemCount }, (_, index) => ({
  id: `category-${index + 1}`,
  label: "类型名称",
  state: index === 0 ? ("active" as const) : undefined,
}));

const avatarSrcs = [
  "/assets/preview/map-placeholder.png",
  "/assets/preview/map-placeholder.png",
  "/assets/preview/map-placeholder.png",
];

const categories = Array.from({ length: 16 }, (_, index) => ({
  id: `home-category-${index + 1}`,
  title: index === 0 ? "角色" : "类型名称",
  description: index === 0 ? "查看所有角色及阵营信息" : "介绍信息",
  state: index === 1 ? ("hover" as const) : ("default" as const),
}));

export function WikiHomeTemplatePreview() {
  const checks = getWikiHomeTemplateChecks();
  const passedChecks = checks.filter((check) => check.pass).length;
  const contentScrollHeight = wikiHomeTemplateLayout.content.bodyRelativeY + wikiHomeTemplateLayout.content.height;
  const frameStyle = {
    "--wiki-home-canvas-width": `${wikiHomeTemplateLayout.canvas.width}px`,
    "--wiki-home-canvas-height": `${wikiHomeTemplateLayout.canvas.height}px`,
    "--wiki-home-body-top": `${wikiHomeTemplateLayout.body.y}px`,
    "--wiki-home-body-height": `${wikiHomeTemplateLayout.body.height}px`,
    "--wiki-home-content-x": `${wikiHomeTemplateLayout.content.bodyRelativeX}px`,
    "--wiki-home-content-y": `${wikiHomeTemplateLayout.content.bodyRelativeY}px`,
    "--wiki-home-content-width": `${wikiHomeTemplateLayout.content.width}px`,
    "--wiki-home-content-height": `${wikiHomeTemplateLayout.content.height}px`,
    "--wiki-home-content-gap": `${wikiHomeTemplateLayout.content.gap}px`,
    "--wiki-home-summary-banner-width": `${wikiHomeTemplateLayout.summaryBanner.width}px`,
    "--wiki-home-summary-banner-height": `${wikiHomeTemplateLayout.summaryBanner.height}px`,
    "--wiki-home-summary-x": `${wikiHomeTemplateLayout.summary.bodyRelativeFrame.x - wikiHomeTemplateLayout.content.bodyRelativeX}px`,
    "--wiki-home-summary-y": `${wikiHomeTemplateLayout.summary.bodyRelativeFrame.y - wikiHomeTemplateLayout.content.bodyRelativeY}px`,
    "--wiki-home-grid-width": `${wikiHomeTemplateLayout.grid.width}px`,
    "--wiki-home-grid-height": `${wikiHomeTemplateLayout.grid.height}px`,
    "--wiki-home-card-width": `${wikiHomeTemplateLayout.cardGrid.cardWidth}px`,
    "--wiki-home-card-height": `${wikiHomeTemplateLayout.cardGrid.cardHeight}px`,
    "--wiki-home-card-gap": `${wikiHomeTemplateLayout.cardGrid.columnGap}px`,
  } as CSSProperties;

  return (
    <section className="wiki-home-template-workspace">
      <div className="wiki-home-template-stage" aria-label="WikiHome template preview from skill-pack/wiki/templates/wiki.json">
        <Background className="wiki-home-template-frame" style={frameStyle}>
          <Header searchPlaceholder="搜索栏">
            <TopBar items={topBarItems} />
          </Header>

          <div className="wiki-home-template-body">
            <div className="wiki-home-template-content">
              <section className="wiki-home-template-summary-banner" aria-label="Wiki home summary banner">
                <div className="wiki-home-template-summary">
                <div className="wiki-home-template-summary__title">
                  <span>游戏名称</span>
                  <span>Wiki攻略</span>
                </div>
                <div className="wiki-home-template-summary__meta">
                  <span>共19个分类</span>
                  <span>·</span>
                  <span>5348项</span>
                </div>
                </div>
              </section>

              <section className="wiki-home-template-grid" aria-label="Wiki category grid">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    title={category.title}
                    description={category.description}
                    avatarSrcs={avatarSrcs}
                    countLabel="+999"
                    state={category.state}
                    interactive
                  />
                ))}
              </section>
            </div>

            <Scroll
              className="wiki-home-template-scroll"
              scrollTop={getObservedScrollbarTop()}
              scrollHeight={contentScrollHeight}
              viewportHeight={wikiHomeTemplateLayout.body.height}
              trackHeight={wikiHomeTemplateLayout.scrollbar.height}
              thumbHeight={wikiHomeTemplateLayout.scrollbar.thumbHeight}
            />
          </div>
        </Background>
      </div>

      <aside className="wiki-home-template-audit" aria-label="WikiHome template self check">
        <p className="preview-kicker">Template self-check</p>
        <h2>WikiHome layout contract</h2>
        <p>
          Preview reads Home layout values from <code>skill-pack/wiki/templates/wiki.json</code> and checks them against the Figma node <code>477:3685</code>.
        </p>
        <div className="wiki-home-template-audit__summary">
          {passedChecks}/{checks.length} checks passed
        </div>
        <ul>
          {checks.map((check) => (
            <li key={check.label} className={check.pass ? "wiki-home-template-audit__item--pass" : "wiki-home-template-audit__item--fail"}>
              <span>{check.pass ? "PASS" : "FAIL"}</span>
              <strong>{check.label}</strong>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
