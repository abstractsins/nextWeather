import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const promptObj = await req.json();
        console.log(promptObj);

        const url = process.env.OPENWEATHER_AI_URL;
        if (!url) {
            return NextResponse.json(
                { error: "Server not configured with OPENWEATHER_AI_URL" },
                { status: 500 }
            );
        }

        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Server not configured with OPENWEATHER_API_KEY" },
                { status: 500 }
            );
        }

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "X-Api-Key": apiKey,
            },
            body: JSON.stringify(promptObj),
        });

        // If the upstream fails, don't try to parse empty body
        const text = await res.text();
        let data: unknown;
        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            data = { error: "Invalid JSON from upstream" };
        }

        return NextResponse.json(data, { status: res.status });
    } catch (err: any) {
        console.error("assistant route error:", err);
        return NextResponse.json(
            { error: err.message ?? "Unknown server error" },
            { status: 500 }
        );
    }
}
