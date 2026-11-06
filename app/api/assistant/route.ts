import { NextRequest, NextResponse } from "next/server";

const jsonError = (error: string, status: number, details?: string) =>
  NextResponse.json(details ? { error, details } : { error }, { status });

export async function POST(req: NextRequest) {
  try {
    const promptObj = await req.json();
    if (
      typeof promptObj !== "object" ||
      promptObj === null ||
      typeof (promptObj as { prompt?: unknown }).prompt !== "string"
    ) {
      return jsonError(
        "Request body must be an object with a string prompt.",
        400,
      );
    }

    const url = process.env.OPENWEATHER_AI_URL;
    if (!url) {
      return jsonError("Server not configured with OPENWEATHER_AI_URL", 500);
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return jsonError("Server not configured with OPENWEATHER_API_KEY", 500);
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(promptObj),
    });

    const text = await res.text();
    if (!text) {
      return NextResponse.json({}, { status: res.status });
    }

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: res.status });
    } catch {
      return jsonError(
        "Invalid JSON response from upstream assistant service.",
        502,
      );
    }
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    console.error("assistant route error:", err);
    return jsonError("Unexpected server error", 500, details);
  }
}
