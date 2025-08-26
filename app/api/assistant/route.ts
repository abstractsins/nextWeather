import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    const promptObj = await req.json();

    console.log(promptObj);

    const url = process.env.OPENWEATHER_AI_URL || '';

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
            "X-Api-Key": apiKey
        },
        body: JSON.stringify(promptObj)
    });

    const data = await res.json();

    console.log(data);

    return NextResponse.json(data, { status: res.status });
}