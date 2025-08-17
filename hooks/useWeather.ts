import { useEffect, useState } from "react";
import { LocationObj, ForecastEntry } from "@/types/types";

type Coords = { lat: number; lon: number };

export default function useWeather() {
    const [coords, setCoords] = useState<Coords | null>(null);
    const [locationData, setLocationData] = useState<LocationObj | null>(null);
    const [weatherData, setWeatherData] = useState<ForecastEntry[]>();
    const [error, setError] = useState<string | null>(null);
    const [specificLocal, setSpecificLocal] = useState<string | null | undefined>(null);

    
    // Get browser location once
    useEffect(() => {
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
    }, []);


    // Fetch reverse geocode + weather whenever coords are set
    useEffect(() => {
        if (!coords) return;

        const ac = new AbortController();

        (async () => {
            try {
                const [rev, wx] = await Promise.all([
                    fetch(`/api/reverse-geocode?lat=${coords.lat}&lon=${coords.lon}`, {
                        signal: ac.signal,
                    }).then((r) => r.json()),
                    fetch(`/api/weather?lat=${coords.lat}&lon=${coords.lon}`, {
                        signal: ac.signal,
                    }).then((r) => r.json()),
                ]);

                setLocationData(rev?.results?.[0] ?? null);
                setWeatherData(wx?.list ?? null);
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
        if (locationData) {
            setSpecificLocal(
                locationData.neighbourhood ||
                locationData.suburb ||
                locationData.hamlet ||
                locationData.district ||
                locationData.county
            )
        }

        console.log(locationData);
    }, [locationData]);


    return {
        specificLocal,
        locationData,
        weatherData,
        coords,
        error
    };
}
