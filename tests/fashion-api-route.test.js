import assert from "node:assert";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const routePath = resolve(__dirname, "../app/api/fashion-products/route.ts");
const source = readFileSync(routePath, "utf8");

const hasDynamicExport = /export const dynamic\s*=\s*["']force-dynamic["']/.test(source);
const expectedTableDefault = /const tableName = .*"hm"/.test(source);
const configPath = resolve(__dirname, "../next.config.ts");
const configSource = readFileSync(configPath, "utf8");
const outputIsEnvGuarded = /NEXT_OUTPUT/.test(configSource) && !/output:\s*["']export["']/.test(configSource);
const colorClauseRegex = /swatches::text\.ilike\.%[^%]+%/;
const spaceSanitizerRegex = /ilike\.%[^%]*%[^%]*%/;

assert.ok(hasDynamicExport, "API route must export `dynamic = \"force-dynamic\"` to avoid static export errors.");
assert.ok(expectedTableDefault, "API route should default SUPABASE_TABLE fallback to \"hm\".");
assert.ok(
  outputIsEnvGuarded,
  "next.config.ts should guard `output` behind NEXT_OUTPUT to allow dev server API routes.",
);
assert.ok(colorClauseRegex.test(source), "API route should cast swatches/productColor to text when applying ilike colors.");
assert.ok(spaceSanitizerRegex.test(source), "Color patterns should replace spaces with % to support multi-word matches.");
