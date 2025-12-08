import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const productColumns =
  "articleCode, pdpUrl, title, category, regularPrice, redPrice, yellowPrice, imageProductAlt, imageProductSrc, imageModelAlt, imageModelSrc, swatches, galleryImages, videoFallbackImage, productColor, sizes, prices, createdAt, updatedAt";

// keep this route dynamic for nextjs dev/export to avoid static export errors
export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 200;
const tableName = process.env["SUPABASE_TABLE"] ?? "hm";



function parseLimit(raw: string | null) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
  return Math.min(Math.max(Math.floor(parsed), 1), MAX_LIMIT);
}

function parsePage(raw: string | null) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(Math.floor(parsed), 1);
}

function parseList(raw: string | null) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
  .slice(0, 20);
}

function parseSearch(raw: string | null) {
  if (!raw) return "";
  const cleaned = raw.replace(/[%_]/g, "").trim();
  return cleaned.slice(0, 120);
}

function parseBoolean(raw: string | null) {
  return raw?.toLowerCase() === "true";
}

function parseSort(raw: string | null) {
  if (!raw) return "updatedAt";
  const normalized = raw.toLowerCase();
  if (normalized === "created_at" || normalized === "createdat") return "createdAt";
  if (normalized === "updated_at" || normalized === "updatedat") return "updatedAt";
  return "updatedAt";
}

function parseDirection(raw: string | null): "asc" | "desc" {
  return raw?.toLowerCase() === "asc" ? "asc" : "desc";
}

function getSupabaseCredentials() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_ANON_KEY"] ?? process.env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!url || !key) {
    throw new Error(
      "Supabase credentials are missing. Set SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) in env.",
    );
  }

  return { url, key };
}

export async function GET(request: NextRequest) {
  try {
    const { url, key } = getSupabaseCredentials();
    const client = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

    const limit = parseLimit(request.nextUrl.searchParams.get("limit"));
    const page = parsePage(request.nextUrl.searchParams.get("page"));
    const sortColumn = parseSort(request.nextUrl.searchParams.get("sort"));
    const direction = parseDirection(request.nextUrl.searchParams.get("direction"));
    const search = parseSearch(request.nextUrl.searchParams.get("search"));
    const categories = parseList(request.nextUrl.searchParams.get("categories"));
    const colors = parseList(request.nextUrl.searchParams.get("colors"));
    const saleOnly = parseBoolean(request.nextUrl.searchParams.get("saleOnly"));
    const rangeFrom = (page - 1) * limit;
    const rangeTo = rangeFrom + limit - 1;

    let query = client.from(tableName).select(productColumns, { count: "exact" });

    if (categories.length > 0) {
      query = query.in("category", categories);
    }

    if (search) {
      const pattern = `%${search}%`;
      query = query.or(`title.ilike.${pattern},imageModelAlt.ilike.${pattern}`);
    }

  if (saleOnly) {
    query = query.or("redPrice.not.is.null,redPrice.neq.,yellowPrice.not.is.null,yellowPrice.neq.");
  }

  if (colors.length > 0) {
    const clauses = colors
      .map((value) => value.replace(/[%]/g, "").trim().replace(/\s+/g, "%"))
      .filter(Boolean)
      .map((value) => `swatches::text.ilike.%${value}%,productColor::text.ilike.%${value}%`);
    if (clauses.length > 0) {
      query = query.or(clauses.join(","));
    }
  }

    const { data, error, count } = await query
      .order(sortColumn, { ascending: direction === "asc" })
      .range(rangeFrom, rangeTo);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json(
      { products: data ?? [], appliedLimit: limit, sort: sortColumn, direction, page, totalCount: count ?? 0 },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error while loading products.";
    return NextResponse.json({ error: message }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
