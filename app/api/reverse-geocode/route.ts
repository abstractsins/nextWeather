import { NextRequest, NextResponse } from "next/server";

const jsonError = (error: string, status: number, details?: string) =>
  NextResponse.json(details ? { error, details } : { error }, { status });

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const lat = url.searchParams.get("lat");
    const lon = url.searchParams.get("lon");

    if (!lat || !lon) {
      return jsonError("lat and lon are required", 400);
    }

    const latNumber = Number(lat);
    const lonNumber = Number(lon);
    if (!Number.isFinite(latNumber) || !Number.isFinite(lonNumber)) {
      return jsonError("lat and lon must be valid numbers", 400);
    }

    const apiKey = process.env.GEOAPIFY_API_KEY;
    if (!apiKey) {
      return jsonError("Server not configured with GEOAPIFY_API_KEY", 500);
    }

    const upstream = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${encodeURIComponent(
        lat,
      )}&lon=${encodeURIComponent(lon)}&format=json&apiKey=${apiKey}`,
    );

    if (!upstream.ok) {
      const text = await upstream.text();
      return jsonError("Geoapify error", upstream.status, text);
    }

    const data = await upstream.json();
    return NextResponse.json(data, {
      // Add light caching if you want (same lat/lon calls)
      // headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    return jsonError("Unexpected server error", 500, details);
  }
}
