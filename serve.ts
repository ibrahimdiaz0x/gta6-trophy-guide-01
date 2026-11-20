/**
 * Tiny dev server for the trophy guide (local testing only).
 * Serves app/ at http://localhost:4173/ — the dossier screenshots are
 * taken against this server. Not part of the submitted program.
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = import.meta.dirname;
const APP = join(ROOT, "app");
const PORT = 4173;

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const server = createServer(async (req, res) => {
  try {
    const path = req.url === "/" || !req.url ? "/index.html" : req.url.split("?")[0];
    const file = join(APP, path);
    if (!file.startsWith(APP)) { res.writeHead(403); res.end(); return; }
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": MIME[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("not found");
  }
});

server.listen(PORT, () => console.log(`trophy guide dev server: http://localhost:${PORT}/`));
