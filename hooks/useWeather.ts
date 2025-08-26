import { useEffect, useState } from "react";
import { LocationObj, ForecastResponse } from "@/types/types";

type Coords = { lat: number; lon: number };

export default function useWeather() {
    const [coords, setCoords] = useState<Coords | null>(null);
    const [customCoords, setCustomCoords] = useState<boolean>(false);
    const [locationData, setLocationData] = useState<LocationObj | null>(null);
    const [weatherData, setWeatherData] = useState<ForecastResponse>();
    const [error, setError] = useState<string | null>(null);
    const [specificLocal, setSpecificLocal] = useState<string | null | undefined>(null);
    const [assistantResponse, setAssistantResponse] = useState<Promise<string | undefined>>();
    const [assistantWaiting, setAssistantWaiting] = useState<boolean>(false);

    const prompt = `What's it like in ${JSON.stringify(coords)} right now? Dont use Kelvin. Use Farenheit and MPH. Use the word 'damn'`;

    const promptObj = { prompt };

    console.log(promptObj);


    // Get browser location once
    useEffect(() => {
        if (!customCoords) {
            if (!("geolocation" in navigator)) {
                setError("Geolocation is not supported by this browser.");
                return;
            }
            let mounted = true;
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    if (!mounted) return;
                    setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                },
                (err) => mounted && setError(err.message),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60_000 }
            );
            return () => {
                mounted = false;
            };
        }
    }, [customCoords]);


    // Fetch reverse geocode + weather whenever coords are set
    useEffect(() => {
        if (!coords) return;

        const ac = new AbortController();

        (async () => {
            try {
                const [rev, weather] = await Promise.all([

                    fetch(`/api/reverse-geocode?lat=${coords.lat}&lon=${coords.lon}`, {
                        signal: ac.signal,
                    }).then((r) => r.json()),

                    fetch(`/api/weather?lat=${coords.lat}&lon=${coords.lon}`, {
                        signal: ac.signal,
                    }).then((r) => r.json()),

                ]);

                setLocationData(rev?.results?.[0] ?? null);
                setWeatherData(weather ?? null);
                console.log(weather);
            } catch (e) {
                if (!ac.signal.aborted) {
                    const msg = e instanceof Error ? e.message : String(e);
                    setError(msg);
                }
            }
        })();

        return () => ac.abort();
    }, [coords]);




    useEffect(() => {
        if (!locationData) return

        setAssistantWaiting(true);

        setSpecificLocal(
            locationData.neighbourhood ||
            locationData.suburb ||
            locationData.hamlet ||
            locationData.district ||
            locationData.region ||
            locationData.county ||
            'unknown'
        )

        console.log(JSON.stringify(promptObj));

        const run = async () => {

            try {
                const res = await fetch(`/api/assistant`, {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify(promptObj)
                })
                    .then(data => data.json());

                return res.answer;
            } catch (e) {
                console.error(e);
                setAssistantWaiting(false)
                return 'There was some kind of error! See the damn console.';
            } finally {
                setAssistantWaiting(false);
            }
        };

        const res = run();

        setAssistantResponse(res);

    }, [locationData]);


    return {
        specificLocal,
        locationData, setLocationData,
        weatherData, setWeatherData,
        coords, setCoords, setCustomCoords,
        assistantResponse, assistantWaiting,
        promptObj,
        error
    };
}
