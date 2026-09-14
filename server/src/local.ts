// Runs the worker on plain Node, no wrangler and no Node 22 requirement.
// The handler below is the same code that runs on Cloudflare in production —
// only the plumbing differs.
//
//   ANTHROPIC_API_KEY=sk-ant-... npm run dev:node

import { createServer } from "node:http";
import worker, { type Env } from "./index";

const PORT = Number(process.env.PORT ?? 8787);
const env: Env = { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "" };

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
  if (!env.ANTHROPIC_API_KEY) console.log("no ANTHROPIC_API_KEY set — calls will return 500");
});
