import { load } from "@std/dotenv";

await load({ export: true });

const DENO_KV_ACCESS_TOKEN = Deno.env.get("DENO_KV_ACCESS_TOKEN");
const DENO_KV_DB_ID = Deno.env.get("DENO_KV_DB_ID");

if (!DENO_KV_ACCESS_TOKEN || !DENO_KV_DB_ID) throw new Error("Bad config");

const kv = await Deno.openKv(
  `https://api.deno.com/databases/${DENO_KV_DB_ID}/connect`,
);

await kv.delete(["data"]);
