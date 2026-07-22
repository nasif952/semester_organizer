// One-off helper: run a .sql file's full text against Postgres as a single
// query (node-postgres's simple query protocol supports multiple
// semicolon-separated statements in one client.query(sqlText) call).
//
// Usage:
//   node scripts/run-sql.mjs <path-to-sql-file>
//
// Connection string is read from the SUPABASE_DB_URL env var (see
// .env.local) - never hardcode credentials in this file.
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { Client } from "pg";

function loadEnvLocal() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    const text = readFileSync(envPath, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // .env.local is optional if the vars are already set in the shell.
  }
}

async function main() {
  loadEnvLocal();

  const sqlFile = process.argv[2];
  if (!sqlFile) {
    console.error("Usage: node scripts/run-sql.mjs <path-to-sql-file>");
    process.exit(1);
  }

  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.error("Missing SUPABASE_DB_URL env var (set it in .env.local).");
    process.exit(1);
  }

  const sqlText = readFileSync(path.resolve(sqlFile), "utf8");

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log(`Connected. Running ${sqlFile} (${sqlText.length} chars)...`);
  try {
    const result = await client.query(sqlText);
    const results = Array.isArray(result) ? result : [result];
    for (const r of results) {
      if (r && r.rows && r.rows.length) {
        console.table(r.rows);
      }
    }
    console.log("Done.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
