import fs from "node:fs";
import path from "node:path";

const dist = path.join(process.cwd(), "dist");
if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true, force: true });

