import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

function ok(data: Record<string, unknown> = {}) {
  return NextResponse.json({
    success: true,
    ...data,
  });
}

function fail(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (!process.env.WEBSITE_CONFIG_API_KEY || apiKey !== process.env.WEBSITE_CONFIG_API_KEY) {
    return fail("Unauthorized request.", 401);
  }

  const supabase = createAdminClient();
  const slug = request.nextUrl.searchParams.get("slug");

  let query = supabase
    .from("website_pages")
    .select(
      `
      id,
      slug,
      title,
      meta_title,
      meta_description,
      website_content_blocks (
        id,
        block_key,
        block_type,
        title,
        subtitle,
        body,
        image_url,
        cta_label,
        cta_url,
        sort_order
      )
    `
    )
    .eq("is_active", true)
    .eq("website_content_blocks.is_active", true)
    .order("created_at", { ascending: false })
    .order("sort_order", {
      foreignTable: "website_content_blocks",
      ascending: true,
    });

  if (slug) {
    query = query.eq("slug", slug);
  }

  const { data, error } = await query;

  if (error) return fail(error.message, 500);

  return ok({
    pages: data ?? [],
  });
}














// Step 6: Test

// Run:

// npm run build

// Open:

// /website/pages

// Public API test:

// GET http://localhost:3000/api/public/pages

// Header:

// x-api-key: change-this-config-secret-key

// Single page:

// GET http://localhost:3000/api/public/pages?slug=home

// Expected:

// Test	Expected
// Create page	save ho
// Edit page	update ho
// Add content block	show under page
// Inactive page	public API me hide
// Inactive block	public API me hide
// Public pages API	pages + blocks return
// Activity logs	page/block logs show