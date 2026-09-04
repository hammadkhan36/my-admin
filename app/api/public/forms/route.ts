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
    .from("custom_forms")
    .select("id, name, slug, description, fields")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (slug) {
    query = query.eq("slug", slug);
  }

  const { data, error } = await query;

  if (error) return fail(error.message, 500);

  return ok({
    forms: data ?? [],
  });
}



















// Step 6: Test

// Run:

// npm run build

// Open:

// /website/forms

// Public fetch:

// GET http://localhost:3000/api/public/forms

// Public submit:

// POST http://localhost:3000/api/public/forms/submit

// Headers:

// Content-Type: application/json
// x-api-key: change-this-config-secret-key

// Body:

// {
//   "form_slug": "contact-form",
//   "data": {
//     "full-name": "Ali Khan",
//     "phone": "+923001234567",
//     "email": "ali@example.com",
//     "message": "I need more details."
//   },
//   "page_url": "https://example.com/contact",
//   "referrer": "https://google.com"
// }