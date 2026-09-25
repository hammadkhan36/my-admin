import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const profile = await getCurrentProfile();

  if (!profile?.is_active) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("communication_settings")
    .select("contact_mode")
    .eq("id", true)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Contact settings unavailable." },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  return NextResponse.json(
    {
      contact_mode: data.contact_mode,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
