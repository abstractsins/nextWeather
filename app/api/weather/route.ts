import { NextRequest, NextResponse } from "next/server";

const jsonError = (error: string, status: number, details?: string) =>
  NextResponse.json(details ? { error, details } : { error }, { status });

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const lat = url.searchParams.get("lat");
    const lon = url.searchParams.get("lon");
    const unitsParam = url.searchParams.get("units");

    if (!lat || !lon) {
      return jsonError("lat and lon are required", 400);
    }

    const latNumber = Number(lat);
    const lonNumber = Number(lon);
    if (!Number.isFinite(latNumber) || !Number.isFinite(lonNumber)) {
      return jsonError("lat and lon must be valid numbers", 400);
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return jsonError("Server not configured with OPENWEATHER_API_KEY", 500);
    }

    const u = new URL("https://api.openweathermap.org/data/3.0/onecall?");
    u.searchParams.set("lat", lat);
    u.searchParams.set("lon", lon);
    u.searchParams.set("appid", apiKey);
    const upstreamUnits = unitsParam === "c" ? "metric" : "imperial";
    u.searchParams.set("units", upstreamUnits);

    const upstream = await fetch(u.toString());

    if (!upstream.ok) {
      const text = await upstream.text();
      return jsonError("OpenWeather error", upstream.status, text);
    }

    const data = await upstream.json();

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : "Unknown error";
    return jsonError("Unexpected server error", 500, details);
  }
}
