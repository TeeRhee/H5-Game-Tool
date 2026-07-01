import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { ComponentGallery } from "./ComponentGallery";
import { WikiHomeTemplatePreview } from "./WikiHomeTemplatePreview";
import {
  Button,
  type CheckboxState,
  Divider,
  DropdownItem,
  PictureTitle,
  PopupDescribeCard,
  RemixIcon,
  SearchBar,
  Select,
  Scroll,
  MapTip,
} from "../components/game-tool";

const DEFAULT_DATA_BASE = "/data/crimsondesert/";
const CANVAS_WIDTH = 1160;
const CANVAS_HEIGHT = 800;

function getDataBase() {
  const value = new URLSearchParams(window.location.search).get("data") ?? DEFAULT_DATA_BASE;
  return value.endsWith("/") ? value : `${value}/`;
}

const DATA_BASE = getDataBase();

interface MapMeta {
  game: {
    id: string;
    name: string;
    logo?: string;
  };
  maps: Array<{
    id: string;
    name: string;
    default?: boolean;
    tile: {
      sourceType: "template" | "manifest";
      urlTemplate?: string;
      manifest?: string;
      tileSize: number;
      imageType: string;
      minZoom: number;
      maxZoom: number;
      maxNativeZoom: number;
      tileOrigin: "top-left";
      indexOrder: "z-x-y";
    };
    coordinate: {
      origin: "top-left";
      axis: "x-right-y-down";
      width: number;
      height: number;
      projectZoom: number;
    };
  }>;
  assets: {
    iconBase: string;
    imageBase: string;
  };
  uiRules: {
    singleMapSelect: "disabled" | "hidden";
    detailFallback: "show-title-only";
    areaDisplay: "center-label" | "none";
  };
}

interface NormalizedMapData {
  categories: Array<{
    id: string;
    name: string;
    groups: Array<{
      id: string;
      name: string;
      icon?: string;
      count: number;
    }>;
  }>;
  markers: Array<{
    id: string;
    mapId: string;
    categoryId: string;
    groupId: string;
    title: string;
    position: {
      x: number;
      y: number;
    };
    detail?: {
      description?: string;
      image?: string;
      tips?: string;
      reward?: string;
    };
  }>;
  areas?: Array<{
    id: string;
    mapId: string;
    name: string;
    type: "center-label" | "polygon";
    position?: {
      x: number;
      y: number;
    };
  }>;
}

interface TileRenderItem {
  key: string;
  src: string;
  left: number;
  top: number;
  size: number;
}

interface TileManifest {
  version: 1;
  tiles: Array<{
    z: number;
    x: number;
    y: number;
    src: string;
  }>;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const joinAssetPath = (path: string) => {
  if (/^(https?:)?\/\//.test(path) || path.startsWith("/")) return path;
  return `${DATA_BASE}${path}`;
};

const buildTileUrl = (template: string, z: number, x: number, y: number) =>
  joinAssetPath(
    template
      .replace(/\{z\}/g, String(z))
      .replace(/\{x\}/g, String(x))
      .replace(/\{y\}/g, String(y)),
  );

function deriveParentState(groupIds: string[], visibleGroupIds: Set<string>): CheckboxState {
  if (groupIds.every((id) => visibleGroupIds.has(id))) return "checked";
  if (groupIds.every((id) => !visibleGroupIds.has(id))) return "unchecked";
  return "indeterminate";
}

function getTileZoom(scale: number, coordinateWidth: number, tileSize: number, minZoom: number, maxNativeZoom: number) {
  const idealScreenTile = 180;
  const zoom = Math.round(Math.log2((coordinateWidth * scale) / idealScreenTile));
  return clamp(Number.isFinite(zoom) ? zoom : minZoom, minZoom, maxNativeZoom);
}

function MapDemoPreview() {
  const [meta, setMeta] = useState<MapMeta | null>(null);
  const [data, setData] = useState<NormalizedMapData | null>(null);
  const [tileManifests, setTileManifests] = useState<Record<string, TileManifest>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedMapId, setSelectedMapId] = useState("world");
  const [query, setQuery] = useState("");
  const [visibleGroupIds, setVisibleGroupIds] = useState<Set<string>>(new Set());
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [view, setView] = useState({ x: 280, y: -132, scale: 0.13 });
  const [canvasSize, setCanvasSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
  const [filterScroll, setFilterScroll] = useState({ scrollTop: 0, scrollHeight: 0, viewportHeight: 0 });
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const filterScrollRef = useRef<HTMLDivElement | null>(null);
  const mapDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMapPackage() {
      try {
        const [metaResponse, dataResponse] = await Promise.all([
          fetch(`${DATA_BASE}map.meta.json`),
          fetch(`${DATA_BASE}map.normalized.json`),
        ]);

        if (!metaResponse.ok || !dataResponse.ok) {
          throw new Error("地图标准数据包加载失败");
        }

        const nextMeta = (await metaResponse.json()) as MapMeta;
        const nextData = (await dataResponse.json()) as NormalizedMapData;
        const nextTileManifests: Record<string, TileManifest> = {};

        await Promise.all(
          nextMeta.maps.map(async (map) => {
            if (map.tile.sourceType !== "manifest") return;
            if (!map.tile.manifest) throw new Error(`Map ${map.id} is missing tile.manifest`);

            const manifestResponse = await fetch(joinAssetPath(map.tile.manifest));
            if (!manifestResponse.ok) throw new Error(`Map ${map.id} tile manifest failed to load`);
            nextTileManifests[map.id] = (await manifestResponse.json()) as TileManifest;
          }),
        );

        if (cancelled) return;

        const defaultMap = nextMeta.maps.find((item) => item.default) ?? nextMeta.maps[0];
        setMeta(nextMeta);
        setData(nextData);
        setTileManifests(nextTileManifests);
        setSelectedMapId(defaultMap.id);
        setVisibleGroupIds(new Set(nextData.categories.flatMap((category) => category.groups.map((group) => group.id))));
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "地图标准数据包加载失败");
      }
    }

    loadMapPackage();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    const updateSize = () => {
      const rect = surface.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(surface);
    return () => observer.disconnect();
  }, []);

  const selectedMap = useMemo(() => {
    if (!meta) return null;
    return meta.maps.find((item) => item.id === selectedMapId) ?? meta.maps[0];
  }, [meta, selectedMapId]);

  const categoryLookup = useMemo(() => {
    const categories = new Map<string, NormalizedMapData["categories"][number]>();
    const groups = new Map<string, NormalizedMapData["categories"][number]["groups"][number]>();
    data?.categories.forEach((category) => {
      categories.set(category.id, category);
      category.groups.forEach((group) => groups.set(group.id, group));
    });
    return { categories, groups };
  }, [data]);

  const selectedMarker = useMemo(
    () => data?.markers.find((marker) => marker.id === selectedMarkerId) ?? null,
    [data, selectedMarkerId],
  );

  const mapOptions = useMemo(
    () => meta?.maps.map((item) => ({ id: item.id, label: item.name })) ?? [],
    [meta],
  );

  const normalizedQuery = query.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!data) return [];
    if (!normalizedQuery) return data.categories;

    return data.categories
      .map((category) => ({
        ...category,
        groups: category.groups.filter((group) => {
          if (category.name.toLowerCase().includes(normalizedQuery) || group.name.toLowerCase().includes(normalizedQuery)) {
            return true;
          }
          return data.markers.some(
            (marker) =>
              marker.groupId === group.id &&
              marker.mapId === selectedMapId &&
              marker.title.toLowerCase().includes(normalizedQuery),
          );
        }),
      }))
      .filter((category) => category.groups.length > 0);
  }, [data, normalizedQuery, selectedMapId]);

  const visibleMarkers = useMemo(() => {
    if (!data || !selectedMap) return [];

    const left = -view.x / view.scale;
    const top = -view.y / view.scale;
    const right = left + canvasSize.width / view.scale;
    const bottom = top + canvasSize.height / view.scale;
    const margin = 320 / view.scale;

    return data.markers.filter((marker) => {
      if (marker.mapId !== selectedMap.id || !visibleGroupIds.has(marker.groupId)) return false;
      if (normalizedQuery) {
        const category = categoryLookup.categories.get(marker.categoryId);
        const group = categoryLookup.groups.get(marker.groupId);
        const matches =
          marker.title.toLowerCase().includes(normalizedQuery) ||
          category?.name.toLowerCase().includes(normalizedQuery) ||
          group?.name.toLowerCase().includes(normalizedQuery);
        if (!matches) return false;
      }

      const { x, y } = marker.position;
      return x >= left - margin && x <= right + margin && y >= top - margin && y <= bottom + margin;
    });
  }, [canvasSize, categoryLookup, data, normalizedQuery, selectedMap, view, visibleGroupIds]);

  const renderTiles = useMemo<TileRenderItem[]>(() => {
    if (!selectedMap) return [];

    const { coordinate, tile } = selectedMap;
    const z = getTileZoom(view.scale, coordinate.width, tile.tileSize, tile.minZoom, tile.maxNativeZoom);
    const tileCount = 2 ** z;
    const tileCoordSize = coordinate.width / tileCount;
    const leftCoord = -view.x / view.scale;
    const topCoord = -view.y / view.scale;
    const rightCoord = leftCoord + canvasSize.width / view.scale;
    const bottomCoord = topCoord + canvasSize.height / view.scale;
    const minX = clamp(Math.floor(leftCoord / tileCoordSize) - 1, 0, tileCount - 1);
    const maxX = clamp(Math.floor(rightCoord / tileCoordSize) + 1, 0, tileCount - 1);
    const minY = clamp(Math.floor(topCoord / tileCoordSize) - 1, 0, tileCount - 1);
    const maxY = clamp(Math.floor(bottomCoord / tileCoordSize) + 1, 0, tileCount - 1);
    const tiles: TileRenderItem[] = [];

    if (tile.sourceType === "manifest") {
      const manifest = tileManifests[selectedMap.id];
      if (!manifest) return [];

      return manifest.tiles
        .filter((item) => item.z === z && item.x >= minX && item.x <= maxX && item.y >= minY && item.y <= maxY)
        .map((item) => {
          const size = tileCoordSize * view.scale;
          return {
            key: `${item.z}-${item.x}-${item.y}`,
            src: joinAssetPath(item.src),
            left: view.x + item.x * tileCoordSize * view.scale,
            top: view.y + item.y * tileCoordSize * view.scale,
            size,
          };
        });
    }

    if (!tile.urlTemplate) return [];
    const urlTemplate = tile.urlTemplate;

    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        const size = tileCoordSize * view.scale;
        tiles.push({
          key: `${z}-${x}-${y}`,
          src: buildTileUrl(urlTemplate, z, x, y),
          left: view.x + x * tileCoordSize * view.scale,
          top: view.y + y * tileCoordSize * view.scale,
          size,
        });
      }
    }

    return tiles;
  }, [canvasSize, selectedMap, tileManifests, view]);

  const visibleAreas = useMemo(() => {
    if (!data || !selectedMap || meta?.uiRules.areaDisplay === "none") return [];
    return (data.areas ?? []).filter((area) => area.mapId === selectedMap.id && area.type === "center-label" && area.position);
  }, [data, meta, selectedMap]);

  const markerIcon = useCallback(
    (groupId: string) => {
      const icon = categoryLookup.groups.get(groupId)?.icon;
      if (!meta || !icon) return <RemixIcon name="map-pin-line" size={20} />;
      return <img className="map-marker-icon" src={joinAssetPath(`${meta.assets.iconBase}${icon}`)} alt="" draggable={false} />;
    },
    [categoryLookup.groups, meta],
  );

  const markerDetailDescription = useMemo(() => {
    if (!selectedMarker) return undefined;
    const detail = selectedMarker.detail;
    const lines = [detail?.description, detail?.tips, detail?.reward].filter(Boolean);
    return lines.length > 0 ? lines.join("\n") : undefined;
  }, [selectedMarker]);

  const markerDetailImage = useMemo(() => {
    if (!selectedMarker?.detail?.image || !meta) return undefined;
    return joinAssetPath(`${meta.assets.imageBase}${selectedMarker.detail.image}`);
  }, [meta, selectedMarker]);

  const toggleCategory = (categoryId: string) => {
    const category = data?.categories.find((item) => item.id === categoryId);
    if (!category) return;

    const groupIds = category.groups.map((group) => group.id);
    const shouldCheck = deriveParentState(groupIds, visibleGroupIds) !== "checked";
    setVisibleGroupIds((current) => {
      const next = new Set(current);
      groupIds.forEach((id) => {
        if (shouldCheck) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  const toggleGroup = (groupId: string) => {
    setVisibleGroupIds((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const clearAllFilters = () => {
    setQuery("");
    setVisibleGroupIds(new Set());
    setSelectedMarkerId(null);
    setDetailOpen(false);
  };

  const resetView = () => {
    setView({ x: 280, y: -132, scale: 0.13 });
  };

  const startMapDrag = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button, input")) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    mapDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: view.x,
      originY: view.y,
    };
  };

  const dragMap = (event: PointerEvent<HTMLElement>) => {
    const drag = mapDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setView((current) => ({
      ...current,
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    }));
  };

  const stopMapDrag = (event: PointerEvent<HTMLElement>) => {
    const drag = mapDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    mapDragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const zoomMapAtPoint = (factor: number, pointerX = canvasSize.width / 2, pointerY = canvasSize.height / 2) => {
    setView((current) => {
      const nextScale = clamp(current.scale * factor, 0.05, 2.8);
      const mapX = (pointerX - current.x) / current.scale;
      const mapY = (pointerY - current.y) / current.scale;
      return {
        x: pointerX - mapX * nextScale,
        y: pointerY - mapY * nextScale,
        scale: nextScale,
      };
    });
  };

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const rect = surface.getBoundingClientRect();
      zoomMapAtPoint(event.deltaY > 0 ? 0.9 : 1.1, event.clientX - rect.left, event.clientY - rect.top);
    };

    surface.addEventListener("wheel", handleWheel, { passive: false });
    return () => surface.removeEventListener("wheel", handleWheel);
  });

  const updateFilterScroll = () => {
    const node = filterScrollRef.current;
    if (!node) return;
    setFilterScroll({
      scrollTop: node.scrollTop,
      scrollHeight: node.scrollHeight,
      viewportHeight: node.clientHeight,
    });
  };

  useEffect(() => {
    updateFilterScroll();
  }, [filteredCategories, visibleGroupIds, collapsedCategories, query]);

  if (loadError) {
    return (
      <div className="map-demo-frame">
        <section className="map-loading">{loadError}</section>
      </div>
    );
  }

  if (!meta || !data || !selectedMap) {
    return (
      <div className="map-demo-frame">
        <section className="map-loading">正在加载红色沙漠地图数据...</section>
      </div>
    );
  }

  return (
    <div className="map-demo-frame">
      <section className="preview-intro">
        <div>
          <p className="preview-kicker">Game H5 Tool</p>
          <h1>{meta.game.name}地图工具</h1>
          <p>
            已接入标准地图数据包：{data.markers.length} 个点位、{data.categories.length} 个分类、
            {data.areas?.length ?? 0} 个区域中心点。
          </p>
        </div>
        <Button leftIcon={<RemixIcon name="focus-3-line" size={16} />} onClick={resetView}>
          回到初始视角
        </Button>
      </section>

      <section className="map-popup">
        <aside className="map-popup__sidebar">
          <PictureTitle title={meta.game.name} logoSrc={joinAssetPath(meta.game.logo ?? "")} />
          <div className="map-popup__controls">
            {meta.maps.length > 1 || meta.uiRules.singleMapSelect !== "hidden" ? (
              <Select options={mapOptions} value={selectedMapId} onChange={setSelectedMapId} />
            ) : null}
            <SearchBar value={query} placeholder="搜索点位或筛选项" onChange={setQuery} />
            <div className="map-status">
              显示 {visibleMarkers.length} / {data.markers.length} 个点位
            </div>
            <div className="map-popup__filters-wrap">
              <div ref={filterScrollRef} className="map-popup__filters" onScroll={updateFilterScroll}>
              {filteredCategories.map((category) => {
                const groupIds = category.groups.map((group) => group.id);
                const parentState = deriveParentState(groupIds, visibleGroupIds);
                const collapsed = collapsedCategories[category.id] ?? false;

                return (
                  <div className="filter-group" key={category.id}>
                    <DropdownItem
                      label={category.name}
                      checkboxState={parentState}
                      collapsed={collapsed}
                      showBadge={false}
                      showRightIcon
                      onClick={() => toggleCategory(category.id)}
                      onCheckboxToggle={() => toggleCategory(category.id)}
                      onRightIconClick={() =>
                        setCollapsedCategories((current) => ({
                          ...current,
                          [category.id]: !collapsed,
                        }))
                      }
                    />
                    {collapsed ? null : (
                      <>
                        <div className="filter-group__children">
                          {category.groups.map((group) => (
                            <DropdownItem
                              key={group.id}
                              label={group.name}
                              count={group.count}
                              child
                              checkboxState={visibleGroupIds.has(group.id) ? "checked" : "unchecked"}
                              icon={markerIcon(group.id)}
                              onCheckboxToggle={() => toggleGroup(group.id)}
                              onClick={() => toggleGroup(group.id)}
                            />
                          ))}
                        </div>
                        <Divider />
                      </>
                    )}
                  </div>
                );
              })}
              {filteredCategories.length === 0 ? <div className="empty-state">没有匹配的筛选项</div> : null}
            </div>
              <Scroll
                className="map-popup__filters-scroll"
                scrollTop={filterScroll.scrollTop}
                scrollHeight={filterScroll.scrollHeight}
                viewportHeight={filterScroll.viewportHeight}
                visible={filterScroll.scrollHeight > filterScroll.viewportHeight}
              />
            </div>
          </div>
        </aside>

        <div className="map-popup__bottom-action">
          <Button className="map-popup__reset" aria-label="取消所有筛选" onClick={clearAllFilters}>
            取消所有筛选
          </Button>
        </div>

        <section className="map-popup__canvas" aria-label="地图主区域">
          <div
            ref={surfaceRef}
            className="map-canvas__surface"
            onPointerDown={startMapDrag}
            onPointerMove={dragMap}
            onPointerUp={stopMapDrag}
            onPointerCancel={stopMapDrag}
          >
            <div className="map-canvas__tile-layer" aria-hidden="true">
              {renderTiles.map((tile) => (
                <img
                  key={tile.key}
                  className="map-canvas__tile"
                  src={tile.src}
                  alt=""
                  draggable={false}
                  style={{
                    left: tile.left,
                    top: tile.top,
                    width: tile.size + 0.5,
                    height: tile.size + 0.5,
                  }}
                />
              ))}
            </div>

            <div className="map-canvas__area-layer" aria-hidden="true">
              {visibleAreas.map((area) =>
                area.position ? (
                  <span
                    key={area.id}
                    className="map-canvas__area-label"
                    style={{
                      left: view.x + area.position.x * view.scale,
                      top: view.y + area.position.y * view.scale,
                    }}
                  >
                    {area.name}
                  </span>
                ) : null,
              )}
            </div>

            <div className="map-canvas__markers">
              {visibleMarkers.map((marker) => (
                <MapTip
                  key={marker.id}
                  content={marker.title}
                  visible
                  icon={markerIcon(marker.groupId)}
                  x={view.x + marker.position.x * view.scale}
                  y={view.y + marker.position.y * view.scale}
                  onClick={() => {
                    setSelectedMarkerId(marker.id);
                    setDetailOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
          <div className="map-canvas__zoom-controls" aria-label="地图缩放控制">
            <Button
              className="map-canvas__zoom-button"
              variant="neutral"
              appearance="stroke"
              size="xsmall"
              iconOnly
              aria-label="放大地图"
              leftIcon={<RemixIcon name="add-fill" size={20} />}
              onClick={() => zoomMapAtPoint(1.18)}
            >
              放大地图
            </Button>
            <Button
              className="map-canvas__zoom-button"
              variant="neutral"
              appearance="stroke"
              size="xsmall"
              iconOnly
              aria-label="缩小地图"
              leftIcon={<RemixIcon name="subtract-line" size={20} />}
              onClick={() => zoomMapAtPoint(0.85)}
            >
              缩小地图
            </Button>
          </div>
          {selectedMarker ? (
            <PopupDescribeCard
              open={detailOpen}
              title={selectedMarker.title}
              description={markerDetailDescription}
              imageSrc={markerDetailImage}
              onClose={() => setDetailOpen(false)}
            />
          ) : null}
        </section>
      </section>
    </div>
  );
}

export function ComponentPreview() {
  const [activeView, setActiveView] = useState<"components" | "wiki-home" | "map">("components");

  return (
    <main className="preview-shell preview-shell--workbench">
      <section className="preview-intro preview-intro--workbench">
        <div>
          <p className="preview-kicker">H5 Game Tool</p>
          <h1>组件和 Token 预览</h1>
          <p>
            集中查看已经实现的 game-tool 组件、当前设计 token、设计稿 style，以及原有地图示例。
          </p>
        </div>
        <div className="preview-view-switch" role="tablist" aria-label="预览视图">
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "components"}
            className={activeView === "components" ? "preview-view-switch__item preview-view-switch__item--active" : "preview-view-switch__item"}
            onClick={() => setActiveView("components")}
          >
            组件库
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "wiki-home"}
            className={activeView === "wiki-home" ? "preview-view-switch__item preview-view-switch__item--active" : "preview-view-switch__item"}
            onClick={() => setActiveView("wiki-home")}
          >
            Wiki Home
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "map"}
            className={activeView === "map" ? "preview-view-switch__item preview-view-switch__item--active" : "preview-view-switch__item"}
            onClick={() => setActiveView("map")}
          >
            地图示例
          </button>
        </div>
      </section>

      {activeView === "components" ? <ComponentGallery /> : activeView === "wiki-home" ? <WikiHomeTemplatePreview /> : <MapDemoPreview />}
    </main>
  );
}
