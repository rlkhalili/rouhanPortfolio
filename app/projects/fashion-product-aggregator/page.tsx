"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { projectDetails } from "@/app/content/portfolio";

type FashionProduct = {
  articleCode: string;
  pdpUrl: string | null;
  title: string | null;
  category: string | null;
  regularPrice: string | null;
  redPrice: string | null;
  yellowPrice: string | null;
  imageProductAlt: string | null;
  imageProductSrc: string | null;
  imageModelAlt: string | null;
  imageModelSrc: string | null;
  swatches: unknown;
  galleryImages: unknown;
  videoFallbackImage: string | null;
  productColor: unknown;
  sizes: unknown;
  prices: unknown;
  createdAt: string;
  updatedAt: string;
};

type SortOption = "updatedAt" | "createdAt";
type SortDirection = "asc" | "desc";

type ProductsResponse = {
  products?: FashionProduct[];
  error?: string;
  appliedLimit?: number;
  sort?: SortOption;
  direction?: SortDirection;
  page?: number;
  totalCount?: number;
};

const PRODUCTS_ENDPOINT = process.env.NEXT_PUBLIC_PRODUCTS_ENDPOINT ?? "/api/fashion-products";
const ROW_OPTIONS = [20, 50, 100];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "updatedAt", label: "Updated" },
  { value: "createdAt", label: "Created" },
];

/*
PURPOSE: Choose the best human-readable price from the product payload, preferring sale fields.
INPUTS: Product row with redPrice, yellowPrice, regularPrice, and optional prices[] JSON.
OUTPUT: String formatted price label; falls back to "N/A" when nothing usable is present.
CONTEXT/CONSTRAINTS: Supports the new camelCase schema and accepts prices as either parsed arrays or strings.
*/
function formatPrice(product: FashionProduct) {
  const trimmedRed = product.redPrice?.trim();
  if (trimmedRed) return trimmedRed;

  const trimmedYellow = product.yellowPrice?.trim();
  if (trimmedYellow) return trimmedYellow;

  const trimmedRegular = product.regularPrice?.trim();
  if (trimmedRegular) return trimmedRegular;

  if (Array.isArray(product.prices) && product.prices.length > 0) {
    const firstPrice = product.prices[0] as Record<string, unknown>;
    const formatted =
      typeof firstPrice?.formattedPrice === "string" ? firstPrice.formattedPrice.trim() : null;
    const numeric =
      typeof firstPrice?.price === "number" ? firstPrice.price : null;
    if (formatted) return formatted;
    if (numeric !== null) return `$${numeric.toFixed(2)}`;
  }

  return "N/A";
}

/*
PURPOSE: Render ISO timestamps in a user-friendly local format.
INPUTS: Timestamp string or null.
OUTPUT: Localized date string or fallback labels.
CONTEXT/CONSTRAINTS: Returns the raw string when parsing fails.
*/
function formatDate(value: string | null) {
  if (!value) return "Unknown";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

/*
PURPOSE: Prefix relative asset paths with the retailer base URL when needed.
INPUTS: Base URL string and a potentially relative URL string.
OUTPUT: Fully qualified URL or null when value is missing.
CONTEXT/CONSTRAINTS: Leaves already absolute URLs untouched and trims leading slashes.
*/
function withBase(base: string, value: string | null) {
  if (!value) return null;
  return value.startsWith("http") ? value : `${base}${value.replace(/^\/+/, "")}`;
}

/*
PURPOSE: Humanize category slugs (e.g., "ladies_sport_bottoms_trousers" -> "Ladies Sport Bottoms Trousers").
INPUTS: Raw category string.
OUTPUT: Title-cased label with underscores replaced by spaces.
CONTEXT/CONSTRAINTS: Leaves non-strings untouched by returning an empty string fallback.
*/
function formatCategoryName(value: string | null | undefined) {
  if (!value) return "";
  return value
    .split("_")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ""))
    .join(" ")
    .trim();
}

type SizeEntry = { name: string; stock: number | null };
type SwatchEntry = { hexColor: string | null; colorName: string | null };

/*
PURPOSE: Normalize varied size payloads into a consistent label/stock pair for display.
INPUTS: Raw `sizes` field (jsonb array, stringified JSON, or null).
OUTPUT: Array of { name, stock } entries with falsy items removed.
CONTEXT/CONSTRAINTS: Accepts either `name` or `sizeCode` as the label; ignores malformed entries.
*/
function parseSizes(raw: unknown): SizeEntry[] {
  if (!raw) return [];

  let value: unknown = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const fromName = "name" in item && typeof item.name === "string" ? item.name : null;
      const fromSizeCode =
        "sizeCode" in item && typeof item.sizeCode === "string" ? item.sizeCode : null;
      const label = fromName ?? fromSizeCode;
      const stock =
        "stock" in item && (typeof item.stock === "number" || item.stock === null)
          ? (item.stock as number | null)
          : null;
      return label ? { name: label, stock } : null;
    })
    .filter((item): item is SizeEntry => Boolean(item));
}

/*
PURPOSE: Normalize swatch payloads (array or JSON string) into color-friendly entries.
INPUTS: Raw `swatches` field from Supabase.
OUTPUT: Array of swatch entries with hexColor/colorName (empty when invalid).
CONTEXT/CONSTRAINTS: Returns an empty array when parsing fails or payload is malformed.
*/
function parseSwatches(raw: unknown): SwatchEntry[] {
  if (!raw) return [];

  let value: unknown = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const hexColor = "hexColor" in item && typeof item.hexColor === "string" ? item.hexColor : null;
      const colorName = "colorName" in item && typeof item.colorName === "string" ? item.colorName : null;
      return hexColor || colorName ? { hexColor, colorName } : null;
    })
    .filter((item): item is SwatchEntry => Boolean(item));
}

/*
PURPOSE: Normalize a swatch entry into a lowercase key for grouping/filtering.
INPUTS: Swatch entry with optional colorName/hexColor.
OUTPUT: Lowercase color key or null when unavailable.
CONTEXT/CONSTRAINTS: Prefers the colorName over hex value.
*/
function normalizeColorValue(swatch: SwatchEntry) {
  const name = swatch.colorName?.trim().toLowerCase();
  if (name) return name;
  const hex = swatch.hexColor?.trim().toLowerCase();
  return hex ?? null;
}

/*
PURPOSE: Return a human-readable label for a color swatch.
INPUTS: Swatch entry with optional colorName/hexColor.
OUTPUT: Color label string.
CONTEXT/CONSTRAINTS: Falls back to "Color" when both fields are missing.
*/
function getColorLabel(swatch: SwatchEntry) {
  return swatch.colorName ?? swatch.hexColor ?? "Color";
}

/*
PURPOSE: Retrieve product rows from the Netlify function with paging/sorting and error tolerance.
INPUTS: limit (number of rows), sort (column key), direction ("asc" | "desc"), page (1+), optional AbortSignal.
OUTPUT: ProductsResponse containing data, paging metadata, or error message.
CONTEXT/CONSTRAINTS: Uses `no-store` to avoid caching and gracefully handles aborted fetches; passes paging to API.
*/
async function fetchProductsFromApi(
  params: {
    limit: number;
    sort: SortOption;
    direction: SortDirection;
    page: number;
    search: string;
    categories: string[];
    colors: string[];
    saleOnly: boolean;
  },
  signal?: AbortSignal,
): Promise<ProductsResponse> {
  try {
    const searchParams = new URLSearchParams({
      limit: String(params.limit),
      sort: params.sort,
      direction: params.direction,
      page: String(params.page),
    });

    if (params.search.trim()) searchParams.set("search", params.search.trim());
    if (params.categories.length > 0) searchParams.set("categories", params.categories.join(","));
    if (params.colors.length > 0) searchParams.set("colors", params.colors.join(","));
    if (params.saleOnly) searchParams.set("saleOnly", "true");

    const response = await fetch(`${PRODUCTS_ENDPOINT}?${searchParams.toString()}`, { signal, cache: "no-store" });

    if (!response.ok) {
      const detail = await response.text();
      return { error: `Product feed unavailable (${response.status}). ${detail || "Try again shortly."}` };
    }

    const payload = (await response.json()) as ProductsResponse;

    if (!payload || !Array.isArray(payload.products)) {
      return { error: payload?.error ?? "Unexpected response from product feed." };
    }

    return {
      products: payload.products,
      error: payload.error,
      totalCount: payload.totalCount,
      page: payload.page ?? params.page,
    };
  } catch (err) {
    if (signal?.aborted) return {};
    return { error: err instanceof Error ? err.message : "Unable to reach the product feed." };
  }
}

export default function FashionProductAggregatorPage() {
  const [products, setProducts] = useState<FashionProduct[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(ROW_OPTIONS[0]);
  const [sort, setSort] = useState<SortOption>("updatedAt");
  const [direction, setDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState<number | undefined>();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [saleOnly, setSaleOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pageInput, setPageInput] = useState("1");
  const totalPages = typeof totalCount === "number" ? Math.max(1, Math.ceil(totalCount / limit)) : null;
  const canGoPrev = page > 1;
  const canGoNext = totalPages ? page < totalPages : products.length === limit;

  const content = projectDetails.find((detail) => detail.slug === "fashion-product-aggregator");
  const eyebrow = content?.eyebrow ?? "Project";
  const title = content?.title ?? "Fashion Product Aggregator";
  const summary =
    content?.summary ??
    "Live view of normalized listings pulled from multiple fashion retailers. Data is stored in Postgres via Supabase; this page queries the shared dataset directly so you can see the aggregated feed without hitting the API.";
  const stack = content?.stack ?? "TypeScript, Next.js 16, Supabase Postgres";
  const whatYouSee =
    content?.whatYouSee ??
    "Latest products with adjustable row count (20 default), sorting by price/created/updated time, color filtering, and stock-aware size options.";
  const why =
    content?.why ??
    "Load the page → scraper runs → rows land in Supabase Postgres → UI refreshes with the new data. It is the end-to-end loop I would own on the job.";

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);

      const {
        products: latest,
        error: fetchError,
        totalCount: fetchedTotal,
        page: responsePage,
      } = await fetchProductsFromApi(
        { limit, sort, direction, page, search, categories: selectedCategories, colors: selectedColors, saleOnly },
        controller.signal,
      );

      if (!isMounted) return;

      if (fetchError) {
        setError(fetchError);
        setProducts([]);
        setTotalCount(undefined);
      } else {
        setProducts(latest ?? []);
        setError(undefined);
        setTotalCount(typeof fetchedTotal === "number" ? fetchedTotal : undefined);
        if (typeof responsePage === "number" && responsePage !== page) {
          setPage(responsePage);
        }
      }

      if (isMounted) setLoading(false);
    }

    loadProducts().catch((err) => {
      if (!isMounted || controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Unable to reach the product feed.");
      setProducts([]);
      setTotalCount(undefined);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [limit, sort, direction, page, search, selectedCategories, selectedColors, saleOnly]);

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const colorOptions = useMemo(() => {
    const map = new Map<string, { label: string; swatch: string | null }>();

    products.forEach((product) => {
      const swatches = parseSwatches(product.swatches);
      if (!swatches.length && product.productColor && typeof product.productColor === "object") {
        const colorObj = product.productColor as Record<string, unknown>;
        const hexColor = typeof colorObj.hexColor === "string" ? colorObj.hexColor : null;
        const colorName = typeof colorObj.colorName === "string" ? colorObj.colorName : null;
        swatches.push({ hexColor, colorName });
      }

      swatches.forEach((swatch) => {
        const key = normalizeColorValue(swatch);
        if (!key || map.has(key)) return;
        map.set(key, { label: getColorLabel(swatch), swatch: swatch.hexColor ?? null });
      });
    });

    return Array.from(map.entries())
      .map(([value, meta]) => ({ value, ...meta }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [products]);

  const categoryOptions = useMemo(() => {
    const unique = new Set<string>();
    products.forEach((product) => {
      const cat = product.category?.trim();
      if (cat) unique.add(cat);
    });
    return Array.from(unique)
      .map((value) => ({ value, label: formatCategoryName(value) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [products]);

  const filteredProducts = products;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-black dark:text-zinc-100">
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:px-10 lg:px-16">
        <div className="rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{eyebrow}</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">{title}</h1>
            <Link
              href="/"
              className="text-sm font-medium text-blue-700 underline underline-offset-4 transition hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Back to portfolio
            </Link>
          </div>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{summary}</p>
          <div className="mt-4 grid gap-3 text-xs text-zinc-500 sm:grid-cols-3">
            <div>
              <p className="font-semibold uppercase tracking-[0.3em]">Stack</p>
              <p className="text-zinc-700 dark:text-zinc-200">{stack}</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.3em]">What you see</p>
              <p className="text-zinc-700 dark:text-zinc-200">{whatYouSee}</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.3em]">Why</p>
              <p className="text-zinc-700 dark:text-zinc-200">{why}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/70 dark:text-red-100">
            <p className="font-semibold">Unable to load Supabase data.</p>
            <p className="mt-1">{error}</p>
            <p className="mt-2 text-xs text-red-700 dark:text-red-200">
              Confirm the Netlify function{" "}
              <code className="rounded bg-red-900/30 px-1 py-0.5 text-[0.75rem]">/.netlify/functions/fashion-products</code>{" "}
              is deployed and that <code className="rounded bg-red-900/30 px-1 py-0.5 text-[0.75rem]">SUPABASE_URL</code>{" "}
              and <code className="rounded bg-red-900/30 px-1 py-0.5 text-[0.75rem]">SUPABASE_ANON_KEY</code> are set in
              the environment along with the{" "}
              <code className="rounded bg-red-900/30 px-1 py-0.5 text-[0.75rem]">products</code> table.
            </p>
          </div>
        )}

        {!error && (
          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Latest products</p>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  {loading
                    ? "Loading..."
                    : `Page ${page}${totalPages ? ` of ${totalPages}` : ""} · Showing ${filteredProducts.length} rows`}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    Rows
                    <select
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/60"
                      value={limit}
                      onChange={(event) => {
                        setLimit(Number(event.target.value));
                        setPage(1);
                      }}
                    >
                      {ROW_OPTIONS.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    Sort
                    <select
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/60"
                      value={sort}
                      onChange={(event) => {
                        setSort(event.target.value as SortOption);
                        setPage(1);
                      }}
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setDirection((current) => (current === "asc" ? "desc" : "asc"));
                      setPage(1);
                    }}
                    className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:border-blue-500 hover:text-blue-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-blue-400 dark:hover:text-blue-50"
                  >
                    {direction === "asc" ? "Ascending" : "Descending"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilters((current) => !current)}
                    className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:border-blue-500 hover:text-blue-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-blue-400 dark:hover:text-blue-50"
                  >
                    {showFilters ? "Hide filters" : "Show filters"}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <button
                    type="button"
                    disabled={!canGoPrev}
                    onClick={() => canGoPrev && setPage((current) => Math.max(1, current - 1))}
                    className={`rounded-lg border px-2 py-1 font-semibold transition ${
                      canGoPrev
                        ? "border-zinc-200 bg-white text-zinc-700 hover:border-blue-500 hover:text-blue-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-blue-400"
                        : "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600"
                    }`}
                  >
                    Prev
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Page {page}
                      {totalPages ? ` / ${totalPages}` : ""}
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={pageInput}
                      onChange={(event) => setPageInput(event.target.value)}
                      onBlur={() => {
                        const next = Number(pageInput);
                        if (Number.isFinite(next) && next >= 1) {
                          const clamped = totalPages ? Math.min(next, totalPages) : next;
                          setPage(clamped);
                          setPageInput(String(clamped));
                        } else {
                          setPageInput(String(page));
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          const next = Number(pageInput);
                          const clamped = Number.isFinite(next) && next >= 1 ? (totalPages ? Math.min(next, totalPages) : next) : page;
                          setPage(clamped);
                          setPageInput(String(clamped));
                        }
                      }}
                      className="w-16 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/60"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!canGoNext}
                    onClick={() => canGoNext && setPage((current) => current + 1)}
                    className={`rounded-lg border px-2 py-1 font-semibold transition ${
                      canGoNext
                        ? "border-zinc-200 bg-white text-zinc-700 hover:border-blue-500 hover:text-blue-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-blue-400"
                        : "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Search</p>
                      <input
                        type="text"
                        value={search}
                        onChange={(event) => {
                          setSearch(event.target.value);
                          setPage(1);
                        }}
                        placeholder="Title or model alt..."
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/60"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Categories</p>
                      <div className="flex flex-col gap-2">
                        <select
                          multiple
                          value={selectedCategories}
                          onChange={(event) => {
                            const selected = Array.from(event.target.selectedOptions).map((opt) => opt.value);
                            setSelectedCategories(selected);
                            setPage(1);
                          }}
                          className="min-h-32 w-full rounded-lg border border-zinc-200 bg-white px-2 py-2 text-sm text-zinc-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/60"
                        >
                          {categoryOptions.map((option) => (
                            <option key={option.value} value={option.value} className="text-sm">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="flex flex-wrap gap-2 text-[0.7rem] text-zinc-600 dark:text-zinc-300">
                          {selectedCategories.length === 0 ? (
                            <span className="rounded-full border border-dashed border-zinc-300 px-2 py-0.5 dark:border-zinc-700">
                              All categories
                            </span>
                          ) : (
                            selectedCategories.map((value) => (
                              <span
                                key={value}
                                className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 dark:border-zinc-700 dark:bg-zinc-900"
                              >
                                {formatCategoryName(value)}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedCategories((current) => current.filter((item) => item !== value))
                                  }
                                  className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                                >
                                  ✕
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Sale</p>
                      <label className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
                          checked={saleOnly}
                          onChange={(event) => {
                            setSaleOnly(event.target.checked);
                            setPage(1);
                          }}
                        />
                        Show sale items only
                      </label>
                    </div>
                  {colorOptions.length > 0 && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Colors</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedColors([]);
                              setPage(1);
                            }}
                            className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                              selectedColors.length === 0
                                ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400/60 dark:bg-blue-900/40 dark:text-blue-100"
                                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-500"
                            }`}
                          >
                            All colors
                          </button>
                          {colorOptions.map((color) => {
                            const active = selectedColors.includes(color.value);
                            return (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() =>
                                  setSelectedColors((current) =>
                                    current.includes(color.value)
                                      ? current.filter((value) => value !== color.value)
                                      : [...current, color.value],
                                  )
                                }
                                className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                                  active
                                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400/60 dark:bg-blue-900/40 dark:text-blue-100"
                                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-500"
                                }`}
                              >
                                {color.swatch ? (
                                  <span
                                    className="h-3 w-3 rounded-full border border-zinc-200 dark:border-zinc-600"
                                    style={{ backgroundColor: color.swatch }}
                                  />
                                ) : null}
                                <span>{color.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
                Loading latest products from Supabase...
              </p>
            ) : products.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
                No rows returned yet. Once the scraper pushes data to Supabase, the latest results will appear here.
              </p>
            ) : filteredProducts.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
                No products match the selected colors. Clear filters to see the latest rows.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {filteredProducts.map((product) => {
                  const sizes = parseSizes(product.sizes);
                  const swatches = parseSwatches(product.swatches);
                  const primaryImage = product.imageProductSrc ?? product.imageModelSrc;
                  const imageAlt = product.imageProductAlt ?? product.imageModelAlt ?? product.title ?? "Product thumbnail";

                  return (
                    <Link
                      key={product.articleCode}
                      href={withBase("https://www2.hm.com/", product.pdpUrl) ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:border-zinc-900 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-100 sm:flex-row sm:items-start sm:gap-4"
                    >
                      {primaryImage ? (
                        <img
                          src={withBase("https://image.hm.com/", primaryImage) ?? undefined}
                          alt={imageAlt}
                          className="w-full max-h-72 rounded-lg bg-white object-contain sm:h-24 sm:w-24 sm:shrink-0 sm:max-h-none sm:object-cover"
                        />
                      ) : (
                        <div className="flex min-h-48 w-full items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500 sm:h-24 sm:min-h-0 sm:w-24 sm:shrink-0">
                          No image
                        </div>
                      )}
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h2 className="break-words text-lg font-semibold leading-tight text-zinc-900 dark:text-white">
                              {product.title ?? product.imageModelAlt ?? "Product"}
                            </h2>
                          </div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-300">
                            {formatPrice(product)}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Updated: {formatDate(product.updatedAt)} · Created: {formatDate(product.createdAt)}
                          </p>
                        {swatches.length > 0 && (
                          <div className="flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                            {swatches.map((swatch, idx) => (
                              <span
                                key={`${swatch.colorName ?? swatch.hexColor ?? "swatch"}-${idx}`}
                                className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
                              >
                                {swatch.hexColor ? (
                                  <span
                                    className="h-3 w-3 rounded-full border border-zinc-200 dark:border-zinc-600"
                                    style={{ backgroundColor: swatch.hexColor }}
                                  />
                                ) : null}
                                <span>{swatch.colorName ?? swatch.hexColor}</span>
                              </span>
                            ))}
                          </div>
                        )}
                        {sizes.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                            {sizes.map((size, idx) => (
                              <span
                                key={`${size.name}-${idx}`}
                                className="rounded-full border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
                              >
                                {size.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
