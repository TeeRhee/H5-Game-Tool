import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

fs.mkdirSync(dist, { recursive: true });
fs.copyFileSync(path.join(root, "src", "style.css"), path.join(dist, "style.css"));
fs.copyFileSync(path.join(root, "../../design-system-pack/tokens.css"), path.join(dist, "tokens.css"));

