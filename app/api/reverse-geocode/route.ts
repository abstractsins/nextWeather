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

        const apiKey = process.env.GEOAPIFY_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Server not configured with GEOAPIFY_API_KEY" },
                { status: 500 }
            );
        }

        const upstream = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${encodeURIComponent(
                lat
            )}&lon=${encodeURIComponent(lon)}&format=json&apiKey=${apiKey}`);

        if (!upstream.ok) {
            const text = await upstream.text();
            return NextResponse.json(
                { error: "Geoapify error", details: text },
                { status: upstream.status }
            );
        }

        const data = await upstream.json();
        // Optionally shape the response:
        // const minimal = data?.results?.[0] ?? null;
        return NextResponse.json(data, {
            // Add light caching if you want (same lat/lon calls)
            // headers: { "Cache-Control": "public, max-age=60" },
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: "Unexpected server error", details: err?.message },
            { status: 500 }
        );
    }
}
