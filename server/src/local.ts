// Runs the worker on plain Node, no wrangler and no Node 22 requirement.
// The handler below is the same code that runs on Cloudflare in production —
// only the plumbing differs.
//
//   ANTHROPIC_API_KEY=sk-ant-... npm run dev:node

import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import worker, { type Env } from "./index";

// Reads the key out of server/.dev.vars as plain text. Sourcing that file into
// a shell instead would run anything malformed in it as commands.
function keyFromDevVars(): string {
  const path = join(dirname(fileURLToPath(import.meta.url)), "..", ".dev.vars");
  if (!existsSync(path)) return "";
  const line = readFileSync(path, "utf8").split("\n").find((l) => l.startsWith("ANTHROPIC_API_KEY="));
  return line ? line.slice("ANTHROPIC_API_KEY=".length).trim() : "";
}

const PORT = Number(process.env.PORT ?? 8787);
const key = process.env.ANTHROPIC_API_KEY || keyFromDevVars();
const env: Env = { ANTHROPIC_API_KEY: key };

// A single key, checked by shape only. The value is never printed.
const oneKey = /^sk-ant-[A-Za-z0-9_-]{80,160}$/.test(key);

createServer(async (req, res) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === "string") headers.set(k, v);
    else if (Array.isArray(v)) v.forEach((one) => headers.append(k, one));
  }

  const request = new Request(`http://localhost:${PORT}${req.url ?? "/"}`, {
    method: req.method,
    headers,
    body: chunks.length ? Buffer.concat(chunks) : undefined,
  });

  try {
    const response = await worker.fetch(request, env);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Handler threw." }));
  }
}).listen(PORT, () => {
  console.log(`reading server on http://localhost:${PORT}`);
  if (!key) console.log("no key: set ANTHROPIC_API_KEY or add it to server/.dev.vars");
  else if (!oneKey) console.log(`the key in .dev.vars doesn't look like a single Anthropic key (${key.length} characters); save it again`);
  else console.log(`key loaded (${key.length} characters)`);
});
