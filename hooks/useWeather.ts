import { useEffect, useState } from "react";
import { LocationObj, ForecastResponse, TempUnit } from "@/types/types";

type Coords = { lat: number; lon: number };

export default function useWeather() {
    const [coords, setCoords] = useState<Coords | null>(null);
    const [customCoords, setCustomCoords] = useState<boolean>(false);
    const [locationData, setLocationData] = useState<LocationObj | null>(null);
    const [weatherData, setWeatherData] = useState<ForecastResponse>();
    const [error, setError] = useState<string | null>(null);
    const [specificLocal, setSpecificLocal] = useState<string | null | undefined>(null);
    const [generalLocal, setGeneralLocal] = useState<string | null | undefined>(null);
    const [assistantResponse, setAssistantResponse] = useState<string | undefined>();
    const [assistantWaiting, setAssistantWaiting] = useState<boolean>(false);

    const [units, setUnits] = useState<TempUnit>('f');

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

    const createPrompt = (): string => {
        const promptLocation = `${locationData?.city!}, ${locationData?.state!}, ${locationData?.country!} ${locationData?.name!}`;

        let prompt = `What's it like in ${promptLocation} right now? `;
        prompt += `Don't use Kelvin. Use ${units === 'f' ? 'farenheit (rounded to nearest degree F) and MPH. DO NOT USE CELCIUS OR KPH. do not use metric at all.' : 'celcius with one decimal place and KPH. USE METRIC ONLY'}. `;
        prompt += `You must use the word 'damn' at least once as a modifier to an adjective about the weather overall or an acute aspect about it. `;
        prompt += `Be very emotional. `
        prompt += `Keep the overall response to three sentences max, or about 35 words. `
        return prompt;
    };

    useEffect(() => {
        if (!locationData) return

        const prompt = createPrompt();

        console.log(locationData);

        const ac = new AbortController();

        setAssistantWaiting(true);

        setSpecificLocal(
            locationData.neighbourhood ||
            locationData.suburb ||
            locationData.hamlet ||
            locationData.district ||
            locationData.region ||
            locationData.county ||
            locationData.country ||
            locationData.name ||
            'unknown'
        );

        if (locationData.city && locationData.state_code) {
            setGeneralLocal(`${locationData.city}, ${locationData.state_code}`);
        } else if (locationData.county && locationData.state_code) {
            setGeneralLocal(`${locationData.county}, ${locationData.state_code}`);
        } else if (locationData.city && locationData.country) {
            setGeneralLocal(`${locationData.city}, ${locationData.country}`);
        } else if (locationData.ocean) {
            setGeneralLocal(`${locationData.ocean}`);
        }

        (async () => {

            try {
                const res = await fetch(`/api/assistant`, {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ prompt })
                })
                    .then(data => data.json());

                setAssistantResponse(res?.answer);
            } catch (e) {
                console.error(e);
                setAssistantWaiting(false)
                setAssistantResponse('There was some kind of error! See the damn console.');
            } finally {
                setAssistantWaiting(false);
                if (!ac.signal.aborted) setAssistantWaiting(false);
            }
        })();

        return () => ac.abort();
    }, [locationData]);


    return {
        specificLocal, generalLocal,
        locationData, setLocationData,
        weatherData, setWeatherData,
        coords, setCoords, setCustomCoords,
        assistantResponse, assistantWaiting,
        error
    };
}
