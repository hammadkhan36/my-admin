import "server-only";
import { NextRequest, NextResponse } from "next/server";

export const MAX_BODY_BYTES = 16_000;

export function reply(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function fail(error: string, status: number) {
  return reply({ success: false, error }, status);
}

export function safePageUrl(value: string): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);

    if (!["https:", "http:"].includes(url.protocol)) {
      return null;
    }

    // Exclude credentials, query parameters and fragments.
    return `${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}

export async function readBody(request: NextRequest): Promise<unknown> {
  const reader = request.body?.getReader();

  if (!reader) {
    throw new Error("INVALID_BODY");
  }

  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";

  try {
    while (true) {
      const chunk = await reader.read();

      if (chunk.done) break;

      bytes += chunk.value.byteLength;

      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new Error("BODY_TOO_LARGE");
      }

      text += decoder.decode(chunk.value, { stream: true });
    }

    text += decoder.decode();

    return JSON.parse(text);
  } finally {
    reader.releaseLock();
  }
}

// Shared guards for public JSON endpoints: JSON content-type, 16 KB limit, plain object.
// Returns the parsed object, or a ready error response.
export async function readJsonObject(
  request: NextRequest
): Promise<{ body: Record<string, unknown> } | { response: NextResponse }> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().startsWith("application/json")) {
    return { response: fail("JSON request required.", 415) };
  }

  let raw: unknown;

  try {
    raw = await readBody(request);
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === "BODY_TOO_LARGE";
    return {
      response: fail(
        tooLarge ? "Request is too large." : "Invalid JSON request.",
        tooLarge ? 413 : 400
      ),
    };
  }

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { response: fail("Invalid request.", 400) };
  }

  return { body: raw as Record<string, unknown> };
}
