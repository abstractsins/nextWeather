import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const lat = url.searchParams.get("lat");
        const lon = url.searchParams.get("lon");

        if (!lat || !lon) {
            return NextResponse.json(
                { error: "lat and lon are required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Server not configured with OPENWEATHER_API_KEY" },
                { status: 500 }
            );
        }

        const u = new URL("https://api.openweathermap.org/data/2.5/forecast");
        u.searchParams.set("lat", lat);
        u.searchParams.set("lon", lon);
        u.searchParams.set("appid", apiKey);
        u.searchParams.set("units", "imperial");

        const upstream = await fetch(u.toString());

        if (!upstream.ok) {
            const text = await upstream.text();
            return NextResponse.json(
                { error: "OpenWeather error", details: text },
                { status: upstream.status }
            );
        }

        const data = await upstream.json();

        return NextResponse.json(data, {
            headers: { "Cache-Control": "public, max-age=60" },
        });

    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json(
                { error: "Unexpected server error", details: err.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: "Unexpected server error", details: "Unknown error" },
            { status: 500 }
        );
    }
}
