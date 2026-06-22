# Renderer Demo 使用说明

Renderer Demo 包用于在本地运行和验证 H5 地图页面。

## 包文件

```txt
H5-Game-Map-Renderer-Demo-2026-06-18.zip
```

## 本地运行步骤

1. 解压 zip，得到：

```txt
h5-game-map-renderer-demo/
```

2. 进入目录：

```sh
cd h5-game-map-renderer-demo
```

3. 安装依赖：

```sh
npm install
```

4. 验证内置 skill 契约和 Crimson Desert 示例数据：

```sh
npm run validate:skill-pack
npm run validate:crimsondesert
```

5. 启动本地预览：

```sh
npm run dev
```

6. 打开浏览器：

```txt
http://127.0.0.1:5173/?data=/data/crimsondesert/
```

这会加载内置的 Crimson Desert 标准地图数据包。

## 接入新地图

把新地图标准包放到：

```txt
public/data/<game-id>/
```

目录里至少需要：

```txt
map.meta.json
map.normalized.json
maps/ 或 tile-manifest.json
icons/
images/
```

然后运行：

```sh
npm run validate:map -- --package public/data/<game-id>
npm run generate:map-output -- --package public/data/<game-id> --output public/data/<game-id>/page.output.json
```

再打开：

```txt
http://127.0.0.1:5173/?data=/data/<game-id>/
```

把 `<game-id>` 换成你的数据包目录名。

## 注意事项

- Renderer Demo 是 H5 页面运行工程，不是 Codex skill。
- Codex skill 安装包是 `H5-Game-Map-Codex-Skill-installable-2026-06-18.zip`。
- Renderer Demo 可以预览标准地图包，但不能直接理解任意原始爬虫数据。
- 原始数据需要先通过 adapter 转成标准包，再放进 `public/data/<game-id>/`。
