# Skill 和 Renderer 分包说明

本项目现在拆成两个可交付包：

1. `H5-Game-Map-Codex-Skill-installable-2026-06-18.zip`
2. `H5-Game-Map-Renderer-Demo-2026-06-18.zip`

## 1. 可安装 Codex Skill 包

文件：

```txt
deliverables/H5-Game-Map-Codex-Skill-installable-2026-06-18.zip
```

用途：

- 给其他 Codex / AI 安装使用。
- 校验标准地图数据包。
- 从标准地图数据包生成受约束的 H5 页面 JSON。
- 指导 AI 在字段含义清楚时编写 source-specific adapter。

安装方式：

把 zip 解压后得到的 `h5-game-map/` 文件夹放进 Codex skills 目录：

```txt
%USERPROFILE%\.codex\skills\h5-game-map
```

或放进当前 Codex 使用的 `$CODEX_HOME/skills/h5-game-map`。

安装后重启 Codex，让技能索引重新加载。

Skill 包内部结构：

```txt
h5-game-map/
  SKILL.md
  agents/openai.yaml
  scripts/
    validate-map-package.mjs
    generate-map-output.mjs
  references/
    OUTPUT_SCHEMA.json
    tool-types.json
    map/datasource-schema/
    templates/
    components/
    mapping/
    examples/
    schemas/
```

Skill 使用命令：

```sh
node scripts/validate-map-package.mjs --package <standard-map-package-dir>
node scripts/generate-map-output.mjs --package <standard-map-package-dir> --output <standard-map-package-dir>/page.output.json
```

注意：

- Skill 包不包含 React renderer。
- Skill 包不包含 Crimson Desert 大体积瓦片数据。
- Skill 包不是直接把任意原始爬虫数据变成页面；原始数据必须先通过 adapter 转成标准地图包。

## 2. Renderer Demo 包

文件：

```txt
deliverables/H5-Game-Map-Renderer-Demo-2026-06-18.zip
```

用途：

- 给开发本地运行 H5 地图 renderer。
- 包含 React/Vite 页面、组件、脚本、Crimson Desert 标准数据包和预览资源。
- 用于验证新游戏标准地图包是否能在 H5 页面中显示。

运行方式：

```sh
npm install
npm run validate:skill-pack
npm run validate:crimsondesert
npm run dev
```

打开：

```txt
http://127.0.0.1:5173/?data=/data/crimsondesert/
```

新游戏接入方式：

1. 把新游戏标准地图包放到 `public/data/<game-id>/`。
2. 运行：

```sh
npm run validate:map -- --package public/data/<game-id>
npm run generate:map-output -- --package public/data/<game-id> --output public/data/<game-id>/page.output.json
```

3. 打开：

```txt
http://127.0.0.1:5173/?data=/data/<game-id>/
```

## 当前能力边界

已支持：

- `map` 地图类型。
- 标准地图包校验。
- template tiles 和 manifest tiles。
- 搜索、筛选、marker、区域标签、详情卡、拖拽、缩放。
- 标准包到 `OUTPUT_SCHEMA` 页面 JSON。

未支持：

- `wiki` 页面生成。
- `guide-config` 页面生成。
- 原始爬虫数据无 adapter 直接生成 H5。
- Storybook。
