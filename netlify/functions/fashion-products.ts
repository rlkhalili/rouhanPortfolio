import { createClient } from "@supabase/supabase-js";

type HandlerResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

const jsonHeaders = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

const productColumns =
  "article_code, link, price_numeric, price_label, image_model_alt, image_model_src, thumbnail_src, swatches, sizes, created_at, updated_at, in_stock";

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

export const handler = async (): Promise<HandlerResponse> => {
  try {
    const { url, key } = getSupabaseCredentials();
    const client = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

    const { data, error } = await client
      .from("products")
      .select(productColumns)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      return { statusCode: 500, headers: jsonHeaders, body: JSON.stringify({ error: error.message }) };
    }

    return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify({ products: data ?? [] }) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error while loading products.";
    return { statusCode: 500, headers: jsonHeaders, body: JSON.stringify({ error: message }) };
  }
};
