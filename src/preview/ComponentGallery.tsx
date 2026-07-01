import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import tokensCssFallback from "../../design-system-pack/tokens.css?raw";
import {
  Button,
  Background,
  Badge,
  BreadcrumbItem,
  Breadcrumbs,
  CategoryCard,
  Checkbox,
  CommandMenuItem,
  DetailCard,
  DropdownCard,
  DropdownItem,
  DropdownOption,
  Header,
  ImageFrame,
  Navigate,
  NavigateItem,
  Pagination,
  PopupDescribeCard,
  ProgressBar,
  ProgressBarLabel,
  RemixIcon,
  SearchBar,
  SecondaryTab,
  Select,
  ShowCard,
  TableHeaderCell,
  TableRowCell,
  MapTip,
  ToolTip,
  TopBar,
  TopBarItem,
  WikiDescribeCard,
} from "../components/game-tool";

interface TokenItem {
  name: string;
  value: string;
  group: string;
}

interface TokenApiResponse {
  css: string;
  files: string[];
  source: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const selectOptions = [
  { id: "all", label: "全部区域" },
  { id: "loot", label: "资源路线" },
  { id: "boss", label: "首领攻略" },
];

const tokenGroups = [
  { id: "color", label: "颜色" },
  { id: "type", label: "文字" },
  { id: "space", label: "间距" },
  { id: "radius", label: "圆角" },
  { id: "other", label: "其他" },
];

const designStyleSections = [
  {
    title: "颜色 Style",
    description: "从设计稿变量导出的语义色、品牌色、灰阶和状态色。",
    tokens: ["--color-primary-base", "--color-bg-soft", "--color-bg-surface", "--color-text-strong", "--color-stroke-soft"],
  },
  {
    title: "文字 Style",
    description: "字号、行高、字重和字体族 token，用于 Wiki 标题、正文和标签。",
    tokens: ["--type-font-family-primary", "--type-size-600", "--type-size-300", "--type-size-200", "--type-line-height-300"],
  },
  {
    title: "间距 Style",
    description: "组件内部间距和页面布局间距，后续 Wiki 框架优先引用这些 token。",
    tokens: ["--space-element-padding-md", "--space-element-gap-md", "--space-layout-600", "--space-layout-700"],
  },
  {
    title: "圆角 Style",
    description: "按钮、卡片、输入框、浮层等结构使用的圆角尺度。",
    tokens: ["--radius-md", "--radius-lg", "--radius-xl", "--radius-900"],
  },
];

const breadcrumbPreviewItems = [
  { id: "home", label: "Breadcrumb" },
  { id: "category", label: "Breadcrumb" },
  { id: "detail", label: "Breadcrumb" },
];

function classifyToken(name: string) {
  if (name.startsWith("--color") || name.startsWith("--neutral")) return "color";
  if (name.startsWith("--type")) return "type";
  if (name.startsWith("--space")) return "space";
  if (name.startsWith("--radius")) return "radius";
  return "other";
}

function parseTokens(css: string): TokenItem[] {
  const tokens = new Map<string, TokenItem>();
  const pattern = /(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(css))) {
    const [, name, rawValue] = match;
    tokens.set(name, {
      name,
      value: rawValue.trim(),
      group: classifyToken(name),
    });
  }

  return Array.from(tokens.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function replaceTokenValue(css: string, name: string, value: string) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.replace(new RegExp(`(${escapedName}\\s*:\\s*)([^;]+)(;)`, "g"), `$1${value}$3`);
}

function isColorValue(value: string) {
  return value.startsWith("#") || value.startsWith("rgb") || value.startsWith("hsl");
}

function getTokenValue(tokens: TokenItem[], name: string) {
  return tokens.find((token) => token.name === name)?.value ?? "未定义";
}

function applyTokenToDocument(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

function ComponentCard({
  title,
  description,
  wide = false,
  children,
}: {
  title: string;
  description: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <article className={wide ? "gallery-card gallery-card--wide" : "gallery-card"}>
      <header className="gallery-card__header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </header>
      <div className="gallery-card__body">{children}</div>
    </article>
  );
}

export function ComponentGallery() {
  const [tokensCss, setTokensCss] = useState(tokensCssFallback);
  const [tokenFiles, setTokenFiles] = useState<string[]>(["design-system-pack/tokens.css"]);
  const [tokenSource, setTokenSource] = useState("design-system-pack/tokens.css");
  const [searchValue, setSearchValue] = useState("深渊");
  const [selectValue, setSelectValue] = useState("loot");
  const [describeOpen, setDescribeOpen] = useState(true);
  const [mapTipActive, setMapTipActive] = useState(false);
  const [breadcrumbCount, setBreadcrumbCount] = useState(3);
  const [tokenQuery, setTokenQuery] = useState("");
  const [activeTokenGroup, setActiveTokenGroup] = useState("color");
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [lastSyncMessage, setLastSyncMessage] = useState("当前使用本地 token 文件。");

  useEffect(() => {
    let cancelled = false;

    async function loadTokens() {
      try {
        const response = await fetch("/api/tokens");
        if (!response.ok) return;
        const payload = (await response.json()) as TokenApiResponse;
        if (cancelled) return;
        setTokensCss(payload.css);
        setTokenFiles(payload.files);
        setTokenSource(payload.source);
        setLastSyncMessage(`已连接 token 仓库：${payload.files.length} 个文件会同步写入。`);
      } catch {
        if (!cancelled) setLastSyncMessage("未连接写入 API，当前仅显示静态 token。");
      }
    }

    loadTokens();
    return () => {
      cancelled = true;
    };
  }, []);

  const tokens = useMemo(() => parseTokens(tokensCss), [tokensCss]);
  const filteredTokens = useMemo(() => {
    const query = tokenQuery.trim().toLowerCase();
    return tokens.filter((token) => {
      if (activeTokenGroup !== "all" && token.group !== activeTokenGroup) return false;
      if (!query) return true;
      return token.name.toLowerCase().includes(query) || token.value.toLowerCase().includes(query);
    });
  }, [activeTokenGroup, tokenQuery, tokens]);

  const collections = useMemo(() => {
    const matches = Array.from(tokensCss.matchAll(/\/\*\s*(Collection|Modes):\s*([^*]+?)\s*\*\//g));
    return matches.map((match) => `${match[1] === "Collection" ? "变量集合" : "模式"}：${match[2].trim()}`);
  }, [tokensCss]);

  const updateTokenDraft = (name: string, value: string) => {
    setTokensCss((current) => replaceTokenValue(current, name, value));
    applyTokenToDocument(name, value);
    setSaveStates((current) => ({ ...current, [name]: "idle" }));
  };

  const saveToken = async (name: string, value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      setSaveStates((current) => ({ ...current, [name]: "error" }));
      setLastSyncMessage(`${name} 保存失败：值不能为空。`);
      return;
    }

    setSaveStates((current) => ({ ...current, [name]: "saving" }));
    try {
      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, value: trimmedValue }),
      });
      const payload = (await response.json()) as { updatedFiles?: string[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "保存失败");
      setSaveStates((current) => ({ ...current, [name]: "saved" }));
      setLastSyncMessage(`${name} 已同步到 ${payload.updatedFiles?.length ?? 0} 个 token 文件。`);
    } catch (error) {
      setSaveStates((current) => ({ ...current, [name]: "error" }));
      setLastSyncMessage(`${name} 保存失败：${error instanceof Error ? error.message : "未知错误"}`);
    }
  };

  return (
    <section className="gallery-workspace" aria-label="组件和 token 预览">
      <div className="gallery-section">
        <div className="gallery-section__heading">
          <p className="preview-kicker">组件来源</p>
          <h2>游戏工具组件预览</h2>
          <p>
            当前页面直接渲染 <code>src/components/game-tool/index.ts</code> 导出的组件，并使用
            <code> {tokenSource}</code> 中的 token。
          </p>
        </div>

        <div className="component-gallery-grid">
          <ComponentCard title="Button" description="Figma 属性：Variant、Appearance、State、Size、IconOnly、ShowLeftIcon、ShowRightIcon。" wide>
            <div className="gallery-state-stack">
              <div className="gallery-state-row">
                <span className="gallery-state-label">样式组合</span>
                <div className="inline-row">
                  <Button variant="primary" appearance="filled" leftIcon={<RemixIcon name="arrow-left-s-line" size={20} />} rightIcon={<RemixIcon name="arrow-right-s-line" size={20} />}>主按钮填充</Button>
                  <Button variant="primary" appearance="stroke" leftIcon={<RemixIcon name="arrow-left-s-line" size={20} />} rightIcon={<RemixIcon name="arrow-right-s-line" size={20} />}>主按钮描边</Button>
                  <Button variant="neutral" appearance="filled" leftIcon={<RemixIcon name="arrow-left-s-line" size={20} />} rightIcon={<RemixIcon name="arrow-right-s-line" size={20} />}>中性填充</Button>
                  <Button variant="neutral" appearance="stroke" leftIcon={<RemixIcon name="arrow-left-s-line" size={20} />} rightIcon={<RemixIcon name="arrow-right-s-line" size={20} />}>中性描边</Button>
                </div>
              </div>
              <div className="gallery-state-row">
                <span className="gallery-state-label">状态</span>
                <div className="inline-row">
                  <Button state="default" leftIcon={<RemixIcon name="arrow-left-s-line" size={20} />} rightIcon={<RemixIcon name="arrow-right-s-line" size={20} />}>默认</Button>
                  <Button state="hover" leftIcon={<RemixIcon name="arrow-left-s-line" size={20} />} rightIcon={<RemixIcon name="arrow-right-s-line" size={20} />}>悬停</Button>
                  <Button state="focus" leftIcon={<RemixIcon name="arrow-left-s-line" size={20} />} rightIcon={<RemixIcon name="arrow-right-s-line" size={20} />}>聚焦</Button>
                  <Button state="disabled" leftIcon={<RemixIcon name="arrow-left-s-line" size={20} />} rightIcon={<RemixIcon name="arrow-right-s-line" size={20} />}>禁用</Button>
                </div>
              </div>
              <div className="gallery-state-row">
                <span className="gallery-state-label">尺寸和纯图标</span>
                <div className="inline-row">
                  <Button size="medium" leftIcon={<RemixIcon name="arrow-left-s-line" size={20} />} rightIcon={<RemixIcon name="arrow-right-s-line" size={20} />}>中号</Button>
                  <Button size="small" leftIcon={<RemixIcon name="arrow-left-s-line" size={20} />} rightIcon={<RemixIcon name="arrow-right-s-line" size={20} />}>小号</Button>
                  <Button size="xsmall" leftIcon={<RemixIcon name="arrow-left-s-line" size={20} />} rightIcon={<RemixIcon name="arrow-right-s-line" size={20} />}>超小号</Button>
                  <Button size="medium" iconOnly aria-label="中号图标按钮" leftIcon={<RemixIcon name="file-copy-line" size={20} />}>中号图标按钮</Button>
                  <Button size="small" iconOnly aria-label="小号图标按钮" leftIcon={<RemixIcon name="file-copy-line" size={20} />}>小号图标按钮</Button>
                  <Button size="xsmall" iconOnly aria-label="超小图标按钮" leftIcon={<RemixIcon name="file-copy-line" size={20} />}>超小图标按钮</Button>
                </div>
              </div>
              <div className="gallery-state-row">
                <span className="gallery-state-label">图标开关</span>
                <div className="inline-row">
                  <Button leftIcon={<RemixIcon name="arrow-left-s-line" size={20} />} rightIcon={<RemixIcon name="arrow-right-s-line" size={20} />} showRightIcon={false}>仅左图标</Button>
                  <Button leftIcon={<RemixIcon name="arrow-left-s-line" size={20} />} rightIcon={<RemixIcon name="arrow-right-s-line" size={20} />} showLeftIcon={false}>仅右图标</Button>
                  <Button leftIcon={<RemixIcon name="arrow-left-s-line" size={20} />} rightIcon={<RemixIcon name="arrow-right-s-line" size={20} />}>左右图标</Button>
                  <Button leftIcon={<RemixIcon name="arrow-left-s-line" size={20} />} rightIcon={<RemixIcon name="arrow-right-s-line" size={20} />} showLeftIcon={false} showRightIcon={false}>无图标</Button>
                </div>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="SearchBar" description="Figma 状态：Default、Hover、Active、Filled。" wide>
            <div className="gallery-control-column">
              <SearchBar value="" placeholder="Default" state="default" onChange={setSearchValue} />
              <SearchBar value="" placeholder="Hover" state="hover" onChange={setSearchValue} />
              <SearchBar value="" placeholder="Active" state="active" onChange={setSearchValue} />
              <SearchBar value={searchValue || "深境矿点"} placeholder="Filled" state="filled" onChange={setSearchValue} />
            </div>
          </ComponentCard>

          <ComponentCard title="Select" description="Figma 状态：Default、Hover、Active、Disabled；DropdownCard 宽度跟随触发器。" wide>
            <div className="gallery-control-grid">
              <Select options={selectOptions} placeholder="Default" state="default" onChange={setSelectValue} />
              <Select options={selectOptions} value={selectValue} state="hover" onChange={setSelectValue} />
              <Select options={selectOptions} value={selectValue} state="active" onChange={setSelectValue} />
              <Select options={selectOptions} value={selectValue} state="disabled" onChange={setSelectValue} />
            </div>
          </ComponentCard>

          <ComponentCard title="Checkbox" description="Figma 矩阵：Default / Active / Indeterminate × Default / Hover / Pressed / Disabled。" wide>
            <div className="checkbox-matrix" aria-label="Checkbox 状态矩阵">
              <span />
              {["Default", "Hover", "Pressed", "Disabled"].map((label) => (
                <span key={label} className="gallery-state-label">{label}</span>
              ))}
              {[
                ["Default", "unchecked"],
                ["Active", "checked"],
                ["Indeterminate", "indeterminate"],
              ].map(([label, state]) => (
                <Fragment key={label}>
                  <span className="gallery-state-label">{label}</span>
                  {(["default", "hover", "pressed", "disabled"] as const).map((interactionState) => (
                    <Checkbox
                      key={`${state}-${interactionState}`}
                      state={state as "unchecked" | "checked" | "indeterminate"}
                      interactionState={interactionState}
                      disabled={interactionState === "disabled"}
                      ariaLabel={`${label} ${interactionState}`}
                    />
                  ))}
                </Fragment>
              ))}
            </div>
          </ComponentCard>

          <ComponentCard title="DropdownItem" description="Figma 状态：Default、Hover、Pressed；支持 child、icon、count、右侧展开入口。" wide>
            <div className="gallery-list-preview">
              <DropdownItem
                label="资源"
                count={24}
                state="default"
                checkboxState="indeterminate"
                showRightIcon
                icon={<RemixIcon name="treasure-map-line" size={16} />}
              />
              <DropdownItem label="稀有物品" count={8} state="hover" child checkboxState="checked" icon={<RemixIcon name="gemini-line" size={16} />} />
              <DropdownItem label="NPC 路线" count={16} state="pressed" child checkboxState="unchecked" />
            </div>
          </ComponentCard>

          <ComponentCard title="DropdownOption / DropdownCard" description="Figma 状态：Default、Hover、Selected、Active。">
            <DropdownCard>
              <DropdownOption label="默认选项" />
              <DropdownOption label="悬停选项" state="hover" />
              <DropdownOption label="已选选项" selected />
              <DropdownOption label="激活选项" state="active" />
            </DropdownCard>
          </ComponentCard>

          <ComponentCard title="Map / MapTip / Default" description="地图标记按钮，点击切换 active 状态。">
            <div className="gallery-map-tip-preview gallery-map-tip-preview--single">
              <MapTip visible selected={mapTipActive} content="宝箱标记" x={0} y={0} icon={<RemixIcon name="map-pin-line" size={20} />} onClick={() => setMapTipActive((active) => !active)} />
            </div>
          </ComponentCard>

          <ComponentCard title="Base / ToolTip / Default" description="截断文本 hover 展示完整内容，支持 8 个方向。">
            <div className="wiki-preview-tooltip-grid">
              {(["TopLeft", "TopCenter", "TopRight", "Left", "Right", "BottomLeft", "BottomCenter", "BottomRight"] as const).map((placement) => (
                <ToolTip key={placement} content={`完整提示内容：${placement}`} placement={placement}>
                  <span className="wiki-preview-tooltip-trigger">{placement}</span>
                </ToolTip>
              ))}
            </div>
          </ComponentCard>

          <ComponentCard title="Map / PopupDescribeCard / Default" description="地图浮动详情面板，覆盖有图、无图、仅标题三种内容结构。" wide>
            <div className="gallery-describe-variants">
              <div className="gallery-describe-preview">
                <PopupDescribeCard
                  open={describeOpen}
                  title="古代机关"
                  description="这里可以组合短描述、攻略提示和奖励说明。"
                  imageSrc="/assets/preview/map-placeholder.png"
                  onClose={() => setDescribeOpen(false)}
                />
              </div>
              <div className="gallery-describe-preview">
                <PopupDescribeCard
                  open
                  title="隐秘矿点"
                  description="无图片时高度根据文字内容自适应。"
                  onClose={() => undefined}
                />
              </div>
              <div className="gallery-describe-preview">
                <PopupDescribeCard open title="传送点" onClose={() => undefined} />
              </div>
            </div>
          </ComponentCard>

        </div>
      </div>

      <div className="gallery-section">
        <div className="gallery-section__heading">
          <p className="preview-kicker">Wiki 页面组件</p>
          <h2>Figma 页面组件实现</h2>
          <p>
            以下组件来自 Figma 节点 <code>167:628</code> 的 Wiki 类模板与组件说明页，已经同步到本地组件入口。
          </p>
        </div>

        <div className="wiki-component-board">
          <ComponentCard title="Layout / Background / Default" description="Wiki 页面背景容器，提供页面底色、边界和内容承载区域。">
            <Background className="wiki-preview-bg-slab">
              <div className="wiki-preview-bg-demo">
                <span>Wiki 背景层</span>
                <strong>承载顶部导航、内容卡片和详情区块</strong>
              </div>
            </Background>
          </ComponentCard>

          <ComponentCard title="Nav / Header / Default" description="顶部导航和搜索入口。" wide>
            <Background className="wiki-preview-bg-slab">
              <Header />
            </Background>
          </ComponentCard>

          <ComponentCard title="Nav / TopBar / Default" description="顶部导航容器和导航项状态。" wide>
            <TopBar
              items={[
                { id: "home", label: "首页", state: "active" },
                { id: "guide", label: "攻略", state: "hover" },
                { id: "data", label: "资料" },
              ]}
            />
          </ComponentCard>

          <ComponentCard title="Nav / TopBarItem / Default" description="顶部导航项，覆盖设计稿 State=Default、Hover、Active。" wide>
            <div className="inline-row">
              <TopBarItem state="default">顶部导航</TopBarItem>
              <TopBarItem state="hover">顶部导航</TopBarItem>
              <TopBarItem state="active">顶部导航</TopBarItem>
            </div>
          </ComponentCard>

          <ComponentCard title="Nav / SecondaryTab" description="二级 tab 导航项，覆盖 State=Default / Active。" wide>
            <div className="inline-row">
              <SecondaryTab state="active">二级导航</SecondaryTab>
              <SecondaryTab>二级导航</SecondaryTab>
              <SecondaryTab>二级导航</SecondaryTab>
            </div>
          </ComponentCard>

          <ComponentCard title="Game / CategoryCard / Default" description="Wiki 首页分类入口卡片。" wide>
            <div className="wiki-preview-stack">
              <CategoryCard title="类型名称" description="介绍信息" countLabel="+999" />
              <CategoryCard title="类型名称" description="介绍信息" countLabel="+999" state="hover" />
            </div>
          </ComponentCard>

          <ComponentCard title="Base / Image / Default" description="资料图片占位，支持 1:1、3:2、16:9。" wide>
            <div className="wiki-preview-image-row">
              <ImageFrame ratio="1:1" src="/assets/preview/map-placeholder.png" />
              <ImageFrame ratio="3:2" src="/assets/preview/map-placeholder.png" />
              <ImageFrame ratio="16:9" src="/assets/preview/map-placeholder.png" />
            </div>
          </ComponentCard>

          <ComponentCard title="Nav / Pagination / Default" description="分页条和页码状态。" wide>
            <Pagination page={1} totalPages={24} />
          </ComponentCard>

          <ComponentCard title="Data / TableHeaderCell / Default" description="详情页表格表头和单元格。" wide>
            <div className="gt-wiki-table">
              <TableHeaderCell>属性</TableHeaderCell>
              <TableHeaderCell>数值</TableHeaderCell>
              <TableRowCell icon={<RemixIcon name="sword-line" size={16} />}>攻击</TableRowCell>
              <TableRowCell>128</TableRowCell>
              <TableRowCell icon={<RemixIcon name="shield-line" size={16} />}>防御</TableRowCell>
              <TableRowCell>86</TableRowCell>
            </div>
          </ComponentCard>

          <ComponentCard title="Nav / Breadcrumbs / Default" description="二级页和详情页面包屑。">
            <Breadcrumbs
              items={breadcrumbPreviewItems.slice(0, breadcrumbCount)}
              onItemClick={(_item, index) => {
                if (index < breadcrumbCount - 1) setBreadcrumbCount(2);
              }}
            />
          </ComponentCard>

          <ComponentCard title="Nav / BreadcrumbItem / Default" description="面包屑单项，覆盖设计稿 State=Default、Hover、Active。">
            <div className="inline-row">
              <BreadcrumbItem state="default">Breadcrumb</BreadcrumbItem>
              <BreadcrumbItem state="hover">Breadcrumb</BreadcrumbItem>
              <BreadcrumbItem state="active">Breadcrumb</BreadcrumbItem>
            </div>
          </ComponentCard>

          <ComponentCard title="Layout / DescribeCard / Default" description="Figma 属性：Size=SM/LG、State=Default/Hover、ShowImage、ShowBadge、ShowAttributes。" wide>
            <div className="wiki-describe-preview">
              <div className="wiki-describe-preview__group">
                <span>SM / 默认</span>
                <WikiDescribeCard
                  title="项目名称"
                  description="项目详细介绍"
                  badge="核心标签"
                  meta={["补充信息1", "补充信息2", "补充信息3"]}
                  imageSrc="/assets/preview/map-placeholder.png"
                />
              </div>
              <div className="wiki-describe-preview__group">
                <span>SM / 悬停</span>
                <WikiDescribeCard
                  title="项目名称"
                  description="项目详细介绍项目详细介绍项目详细介绍项目详细介绍"
                  badge="核心标签"
                  meta={["补充信息1", "补充信息2", "补充信息3"]}
                  imageSrc="/assets/preview/map-placeholder.png"
                  state="hover"
                />
              </div>
              <div className="wiki-describe-preview__group">
                <span>LG / 默认</span>
                <WikiDescribeCard
                  size="lg"
                  title="项目名称"
                  description="项目详细介绍项目详细介绍项目详细介绍项目详细介绍"
                  badge="核心标签"
                  meta={["辅助信息"]}
                  imageSrc="/assets/preview/map-placeholder.png"
                />
              </div>
              <div className="wiki-describe-preview__group">
                <span>LG / 悬停</span>
                <WikiDescribeCard
                  size="lg"
                  state="hover"
                  title="项目名称"
                  description="项目详细介绍项目详细介绍项目详细介绍项目详细介绍"
                  badge="核心标签"
                  meta={["辅助信息"]}
                  imageSrc="/assets/preview/map-placeholder.png"
                />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Layout / DetailCard / Default" description="详情页主体卡片，展示设计稿中的标题、描述、关联卡片、信息、标签和表格。" wide>
            <DetailCard />
          </ComponentCard>

          <ComponentCard title="Game / ProgressBar / Default" description="进度条和带文字说明的进度状态。" wide>
            <div className="wiki-preview-stack">
              <ProgressBar value={70} />
              <ProgressBarLabel title="资料收集" value={80} description="辅助信息解释信息重点" />
            </div>
          </ComponentCard>

          <ComponentCard title="Game / ShowCard / Default" description="展示型列表卡片，支持标签和进度两种形态。" wide>
            <div className="wiki-preview-stack">
              <ShowCard title="详情名称" description="详情介绍介绍" label="标签" imageSrc="/assets/preview/map-placeholder.png" />
              <ShowCard
                title="终止项详情"
                description="这是一段较长的副标题说明，用来验证最多显示两行文字，超过两行以后截断，完整文案后续交给 Pop 组件展示。"
                label="标签"
                imageSrc="/assets/preview/map-placeholder.png"
                hasNextLevel={false}
              />
              <ShowCard title="数据存储" description="辅助信息解释信息重点" variant="process" progress={80} label="标签" imageSrc="/assets/preview/map-placeholder.png" />
            </div>
          </ComponentCard>

          <ComponentCard title="Nav / CommandMenuItem / Default" description="Figma 属性：Variant=Base/LeftIcon、State=Default/Hover、ShowBadge。" wide>
            <div className="wiki-preview-stack wiki-preview-stack--compact">
              <CommandMenuItem variant="base" badge="标签">
                详情名称
              </CommandMenuItem>
              <CommandMenuItem variant="base" state="hover" badge="标签">
                详情名称
              </CommandMenuItem>
              <CommandMenuItem variant="leftIcon" icon={<RemixIcon name="settings-2-line" size={18} />} badge="标签">
                详情名称
              </CommandMenuItem>
              <CommandMenuItem variant="leftIcon" icon={<RemixIcon name="settings-2-line" size={18} />} state="hover" badge="标签">
                详情名称
              </CommandMenuItem>
              <CommandMenuItem variant="base" showBadge={false}>
                详情名称
              </CommandMenuItem>
            </div>
          </ComponentCard>

          <ComponentCard title="Nav / Navigate / Default" description="详情页侧边锚点导航，结构为外层容器和 5 个 NavigateItem。">
            <Navigate />
          </ComponentCard>

          <ComponentCard title="Nav / NavigateItem / Default" description="页内导航项，覆盖设计稿 State=Default、Hover、Active。">
            <div className="inline-row">
              <NavigateItem state="default">顶部导航</NavigateItem>
              <NavigateItem state="hover">顶部导航</NavigateItem>
              <NavigateItem state="active">顶部导航</NavigateItem>
            </div>
          </ComponentCard>

          <ComponentCard title="Base / Badge / Default" description="Figma 状态：Info、Error、Neutral、Warning。">
            <div className="inline-row">
              <Badge tone="info">辅助标签</Badge>
              <Badge tone="error">辅助标签</Badge>
              <Badge tone="neutral">辅助标签</Badge>
              <Badge tone="warning">辅助标签</Badge>
            </div>
          </ComponentCard>
        </div>
      </div>

      <div className="gallery-section">
        <div className="gallery-section__heading">
          <p className="preview-kicker">设计稿 Style</p>
          <h2>Figma 导出样式</h2>
          <p>这里展示当前 token 文件中带出的设计稿集合、模式和主要样式族，便于对照设计稿实现。</p>
        </div>

        <div className="style-meta-row">
          {collections.map((item) => (
            <span key={item} className="style-meta-pill">
              {item}
            </span>
          ))}
        </div>

        <div className="style-gallery-grid">
          {designStyleSections.map((section) => (
            <article key={section.title} className="style-card">
              <h3>{section.title}</h3>
              <p>{section.description}</p>
              <div className="style-token-list">
                {section.tokens.map((tokenName) => {
                  const value = getTokenValue(tokens, tokenName);
                  return (
                    <div key={tokenName} className="style-token-row">
                      {isColorValue(value) ? <span className="token-swatch" style={{ background: value }} /> : null}
                      <code>{tokenName}</code>
                      <span>{value}</span>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="gallery-section">
        <div className="gallery-section__heading">
          <p className="preview-kicker">设计 Token</p>
          <h2>当前 Token 仓库</h2>
          <p>
            共解析出 {tokens.length} 个 CSS 变量。修改输入框后会立即作用到当前组件预览；离开输入框或按 Enter 会写回 token 文件。
          </p>
        </div>

        <div className="token-sync-panel" role="status" aria-live="polite">
          <span>{lastSyncMessage}</span>
          <span>同步文件：{tokenFiles.length} 个</span>
        </div>

        <div className="token-toolbar">
          <SearchBar value={tokenQuery} placeholder="搜索 token 名称或值" onChange={setTokenQuery} />
          <div className="token-tabs" role="tablist" aria-label="Token 分组">
            <button
              type="button"
              className={activeTokenGroup === "all" ? "token-tab token-tab--active" : "token-tab"}
              onClick={() => setActiveTokenGroup("all")}
            >
              全部
            </button>
            {tokenGroups.map((group) => (
              <button
                key={group.id}
                type="button"
                className={activeTokenGroup === group.id ? "token-tab token-tab--active" : "token-tab"}
                onClick={() => setActiveTokenGroup(group.id)}
              >
                {group.label}
              </button>
            ))}
          </div>
        </div>

        <div className="token-table-wrap">
          <table className="token-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>预览</th>
                <th>当前值，可编辑</th>
                <th>分组</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {filteredTokens.map((token) => (
                <tr key={token.name}>
                  <td>
                    <code>{token.name}</code>
                  </td>
                  <td>
                    {isColorValue(token.value) ? (
                      <span className="token-swatch" style={{ background: token.value }} />
                    ) : (
                      <span className="token-text-preview">{token.value}</span>
                    )}
                  </td>
                  <td>
                    <label className="token-value-field">
                      <span className="sr-only">修改 {token.name}</span>
                      <input
                        value={token.value}
                        spellCheck={false}
                        autoComplete="off"
                        data-lpignore="true"
                        data-1p-ignore
                        onChange={(event) => updateTokenDraft(token.name, event.target.value)}
                        onBlur={(event) => saveToken(token.name, event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter") return;
                          event.currentTarget.blur();
                        }}
                      />
                    </label>
                  </td>
                  <td>{tokenGroups.find((group) => group.id === token.group)?.label ?? "其他"}</td>
                  <td className={`token-save-state token-save-state--${saveStates[token.name] ?? "idle"}`}>
                    {saveStates[token.name] === "saving"
                      ? "保存中"
                      : saveStates[token.name] === "saved"
                        ? "已同步"
                        : saveStates[token.name] === "error"
                          ? "失败"
                          : "待修改"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
