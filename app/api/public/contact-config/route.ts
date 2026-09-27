import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
export async function GET(request: NextRequest) {
  const key = process.env.WEBSITE_CONFIG_API_KEY;
  if (!key || request.headers.get("x-api-key") !== key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = createAdminClient();
  const [settings, services] = await Promise.all([
    db.from("communication_settings").select("contact_mode").eq("id", true).single(),
    db.from("services").select("id,name").eq("is_active", true).eq("show_on_website", true).order("sort_order"),
  ]);
  if (settings.error || services.error) return NextResponse.json({ error: "Settings unavailable" }, { status: 503 });
  return NextResponse.json({ contact_mode: settings.data.contact_mode, services: services.data }, { headers: { "Cache-Control": "no-store" } });
}
