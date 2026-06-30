import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const TOKEN_FILES = [
  "design-system-pack/tokens.css",
  "component-packages/h5-game-map-components/src/tokens.css",
];

function updateTokenDeclaration(css: string, name: string, value: string) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(${escapedName}\\s*:\\s*)([^;]+)(;)`, "g");
  let count = 0;
  const nextCss = css.replace(pattern, (_match, prefix: string, _oldValue: string, suffix: string) => {
    count += 1;
    return `${prefix}${value}${suffix}`;
  });

  return { css: nextCss, count };
}

async function readJsonBody(req: import("node:http").IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(res: import("node:http").ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function tokenRepositoryPlugin(): Plugin {
  return {
    name: "h5-token-repository-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0];
        if (!url?.startsWith("/api/tokens")) {
          next();
          return;
        }

        const root = server.config.root;
        const mainTokenPath = path.resolve(root, TOKEN_FILES[0]);

        try {
          if (req.method === "GET") {
            const css = await readFile(mainTokenPath, "utf8");
            sendJson(res, 200, {
              css,
              files: TOKEN_FILES,
              source: TOKEN_FILES[0],
            });
            return;
          }

          if (req.method === "POST") {
            const body = (await readJsonBody(req)) as { name?: string; value?: string };
            const name = body.name?.trim();
            const value = body.value?.trim();

            if (!name || !/^--[a-zA-Z0-9-]+$/.test(name)) {
              sendJson(res, 400, { error: "Invalid token name" });
              return;
            }

            if (!value || /[{};]/.test(value)) {
              sendJson(res, 400, { error: "Invalid token value" });
              return;
            }

            const updatedFiles: string[] = [];
            const missingFiles: string[] = [];

            for (const relativePath of TOKEN_FILES) {
              const filePath = path.resolve(root, relativePath);
              try {
                const css = await readFile(filePath, "utf8");
                const result = updateTokenDeclaration(css, name, value);
                if (result.count > 0) {
                  await writeFile(filePath, result.css, "utf8");
                  updatedFiles.push(relativePath);
                }
              } catch {
                missingFiles.push(relativePath);
              }
            }

            if (updatedFiles.length === 0) {
              sendJson(res, 404, { error: "Token was not found in synced token files", missingFiles });
              return;
            }

            sendJson(res, 200, { name, value, updatedFiles, missingFiles });
            return;
          }

          sendJson(res, 405, { error: "Method not allowed" });
        } catch (error) {
          sendJson(res, 500, { error: error instanceof Error ? error.message : "Unknown token API error" });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tokenRepositoryPlugin()],
});
