import Link from "next/link";

import { getSupabaseClient } from "@/app/lib/supabaseClient";
import { projectDetails } from "@/app/content/portfolio";

export const revalidate = 0;

type FashionProduct = {
  article_code: string;
  link: string;
  price_numeric: number | null;
  price_label: string | null;
  image_model_alt: string | null;
  image_model_src: string | null;
  thumbnail_src: string | null;
  swatches: unknown;
  sizes: unknown;
  created_at: string;
  updated_at: string;
  in_stock: boolean;
};

async function fetchFashionProducts(): Promise<{ products: FashionProduct[]; error?: string }> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select(
        "article_code, link, price_numeric, price_label, image_model_alt, image_model_src, thumbnail_src, swatches, sizes, created_at, updated_at, in_stock",
      )
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      return { products: [], error: error.message };
    }

    return { products: data ?? [] };
  } catch (err) {
    return { products: [], error: err instanceof Error ? err.message : "Unable to reach Supabase." };
  }
}

function formatPrice(price: number | null, label: string | null) {
  if (label) return label;
  if (price === null || Number.isNaN(price)) return "N/A";
  return `$${price.toFixed(2)}`;
}

function formatDate(value: string | null) {
  if (!value) return "Unknown";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function withBase(base: string, value: string | null) {
  if (!value) return null;
  return value.startsWith("http") ? value : `${base}${value.replace(/^\/+/, "")}`;
}

type SizeEntry = { name: string; stock: number | null };
type SwatchEntry = { hexColor: string | null; colorName: string | null };

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
      const name = "name" in item && typeof item.name === "string" ? item.name : null;
      const stock =
        "stock" in item && (typeof item.stock === "number" || item.stock === null) ? (item.stock as number | null) : null;
      return name ? { name, stock } : null;
    })
    .filter((item): item is SizeEntry => Boolean(item));
}

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

export default async function FashionProductAggregatorPage() {
  const { products, error } = await fetchFashionProducts();
  const content = projectDetails.find((detail) => detail.slug === "fashion-product-aggregator");
  const eyebrow = content?.eyebrow ?? "Project";
  const title = content?.title ?? "Fashion Product Aggregator";
  const summary =
    content?.summary ??
    "Live view of normalized listings pulled from multiple fashion retailers. Data is stored in Postgres via Supabase; this page queries the shared dataset directly so you can see the aggregated feed without hitting the API.";
  const stack = content?.stack ?? "TypeScript, Next.js 16, Supabase Postgres";
  const whatYouSee =
    content?.whatYouSee ??
    "Latest 50 products sorted by update time, showing price label, stock, swatches, and quick media previews.";
  const why =
    content?.why ??
    "Load the page → scraper runs → rows land in Supabase Postgres → UI refreshes with the new data. It is the end-to-end loop I would own on the job.";

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
              Confirm SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment and that the{" "}
              <code className="rounded bg-red-900/30 px-1 py-0.5 text-[0.75rem]">products</code> table exists.
            </p>
          </div>
        )}

        {!error && (
          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Latest products</p>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Showing {products.length} rows</p>
            </div>

            {products.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
                No rows returned yet. Once the scraper pushes data to Supabase, the latest 50 results will appear here.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {products.map((product) => {
                  const sizes = parseSizes(product.sizes);
                  const swatches = parseSwatches(product.swatches);

                  return (
                    <Link
                      key={product.article_code}
                      href={withBase("https://www2.hm.com/", product.link) ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:border-zinc-900 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-100 sm:flex-row sm:items-start sm:gap-4"
                    >
                      {product.thumbnail_src ? (
                        <img
                          src={withBase("https://image.hm.com/", product.thumbnail_src) ?? undefined}
                          alt={product.image_model_alt ?? "Product thumbnail"}
                          className="w-full max-h-72 rounded-lg bg-white object-contain sm:h-24 sm:w-24 sm:shrink-0 sm:max-h-none sm:object-cover"
                        />
                      ) : (
                        <div className="flex min-h-48 w-full items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500 sm:h-24 sm:min-h-0 sm:w-24 sm:shrink-0">
                          No image
                        </div>
                      )}
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2 sm:justify-between">
                          <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                            Article {product.article_code}
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${
                              product.in_stock
                                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                            }`}
                          >
                            {product.in_stock ? "In stock" : "Out of stock"}
                          </span>
                        </div>
                        <h2 className="break-words text-lg font-semibold leading-tight text-zinc-900 dark:text-white">
                          {product.image_model_alt ?? "Product"}
                        </h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300">
                          {formatPrice(product.price_numeric, product.price_label)}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Updated: {formatDate(product.updated_at)} · Created: {formatDate(product.created_at)}
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
                                {size.name} · stock {typeof size.stock === "number" ? size.stock : "?"}
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
