import { useEffect, useState } from "react";
import {
  ApiErrorResponse,
  AssistantResponse,
  CurrentWeather,
  LocationObj,
  ForecastResponse,
  ReverseGeocodeResponse,
  TempUnit,
} from "@/types/types";

type Coords = { lat: number; lon: number };

const isApiError = (value: unknown): value is ApiErrorResponse =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { error?: unknown }).error === "string";

const fetchJsonOrThrow = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(input, init);
  const text = await response.text();
  const parsed = text ? (JSON.parse(text) as unknown) : {};

  if (!response.ok) {
    if (isApiError(parsed)) {
      const details = parsed.details ? `: ${parsed.details}` : "";
      throw new Error(`${parsed.error}${details}`);
    }

    throw new Error(`Request failed with status ${response.status}`);
  }

  return parsed as T;
};

const getAssistantAnswer = (value: unknown): string => {
  if (typeof value !== "string") return "No answer returned.";
  return value.trim();
};

const toRoundedInt = (value: number | undefined): number =>
  Math.round(value ?? 0);

const toDisplayWind = (value: number | undefined, units: TempUnit): number => {
  if (typeof value !== "number") return 0;
  return units === "f" ? Math.round(value) : Math.round(value * 3.6);
};

const capitalizeSentenceStart = (value: string): string => {
  const firstLetterIndex = value.search(/[a-z]/i);
  if (firstLetterIndex === -1) return value;
  return (
    value.slice(0, firstLetterIndex) +
    value.charAt(firstLetterIndex).toUpperCase() +
    value.slice(firstLetterIndex + 1)
  );
};

const enforceSentenceCase = (text: string): string => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return normalized;

  return normalized
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => capitalizeSentenceStart(sentence.trim()))
    .join(" ");
};

const countDamnOccurrences = (text: string): number =>
  (text.match(/\bdamn\b/gi) ?? []).length;

const enforceSingleDamn = (text: string): string => {
  if (countDamnOccurrences(text) === 1) return text;

  const cleaned = text
    .replace(/\bdamn\b/gi, "")
    .replace(/\s+([.,!?;:])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "Damn.";

  const withTrailingPunctuation = /[.!?]$/.test(cleaned)
    ? cleaned
    : `${cleaned}.`;
  return `${withTrailingPunctuation} Damn.`;
};

const buildDeterministicAssistantResponse = (
  location: string,
  current: CurrentWeather,
  units: TempUnit,
): string => {
  const condition = current.weather?.[0]?.description ?? "unknown conditions";
  const temp = toRoundedInt(current.temp);
  const feelsLike = toRoundedInt(current.feels_like);
  const humidity = toRoundedInt(current.humidity);
  const wind = toDisplayWind(current.wind_speed, units);
  const tempUnitLabel = units === "f" ? "°F" : "°C";
  const windUnitLabel = units === "f" ? "MPH" : "KPH";

  return `Right now in **${location}** it’s **${condition}** — about **${temp}${tempUnitLabel}** (feels like **${feelsLike}${tempUnitLabel}**), with **${humidity}% humidity** and wind around **${wind} ${windUnitLabel}**. Damn, that weather is intense.`;
};

const hasForbiddenUnits = (text: string, units: TempUnit): boolean => {
  const lowered = text.toLowerCase();
  const hasMeters = /\b\d+(?:\.\d+)?\s?m\b/.test(lowered);
  if (hasMeters) return true;

  if (units === "f") {
    return (
      lowered.includes("°c") ||
      lowered.includes(" celsius") ||
      lowered.includes("kph") ||
      lowered.includes("km/h") ||
      lowered.includes("kmh") ||
      lowered.includes("m/s")
    );
  }

  return (
    lowered.includes("°f") ||
    lowered.includes("fahrenheit") ||
    lowered.includes("mph") ||
    lowered.includes("m/s")
  );
};

const includesExpectedValues = (
  text: string,
  current: CurrentWeather,
  units: TempUnit,
): boolean => {
  const temp = toRoundedInt(current.temp);
  const feelsLike = toRoundedInt(current.feels_like);
  const humidity = toRoundedInt(current.humidity);
  const wind = toDisplayWind(current.wind_speed, units);
  const tempLabel = units === "f" ? "°F" : "°C";
  const windLabelRegex = units === "f" ? "MPH" : "(?:KPH|KM\\/H|KMH)";

  const hasTemp = text.includes(`${temp}${tempLabel}`);
  const hasFeels = text.includes(`${feelsLike}${tempLabel}`);
  const hasHumidity = text.includes(`${humidity}%`);
  const hasWind = new RegExp(`\\b${wind}\\s*${windLabelRegex}\\b`, "i").test(
    text,
  );

  return hasTemp && hasFeels && hasHumidity && hasWind;
};

const getVerifiedAssistantResponse = (
  answer: unknown,
  location: string,
  current: CurrentWeather,
  units: TempUnit,
): string => {
  const text = enforceSentenceCase(getAssistantAnswer(answer));
  if (!text) {
    return enforceSentenceCase(
      enforceSingleDamn(
        buildDeterministicAssistantResponse(location, current, units),
      ),
    );
  }

  if (
    hasForbiddenUnits(text, units) ||
    !includesExpectedValues(text, current, units)
  ) {
    return enforceSentenceCase(
      enforceSingleDamn(
        buildDeterministicAssistantResponse(location, current, units),
      ),
    );
  }

  return enforceSentenceCase(enforceSingleDamn(text));
};

export default function useWeather() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [customCoords, setCustomCoords] = useState<boolean>(false);
  const [locationData, setLocationData] = useState<LocationObj | null>(null);
  const [weatherData, setWeatherData] = useState<ForecastResponse>();
  const [error, setError] = useState<string | null>(null);
  const [specificLocal, setSpecificLocal] = useState<string | null | undefined>(
    null,
  );
  const [generalLocal, setGeneralLocal] = useState<string | null | undefined>(
    null,
  );
  const [assistantResponse, setAssistantResponse] = useState<
    string | undefined
  >();
  const [assistantWaiting, setAssistantWaiting] = useState<boolean>(false);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [lastWeatherUpdatedAt, setLastWeatherUpdatedAt] = useState<Date | null>(
    null,
  );

  const [units, setUnits] = useState<TempUnit>("f");

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
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60_000 },
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
    setWeatherLoading(true);

    (async () => {
      try {
        const [rev, weather] = await Promise.all([
          fetchJsonOrThrow<ReverseGeocodeResponse>(
            `/api/reverse-geocode?lat=${coords.lat}&lon=${coords.lon}`,
            { signal: ac.signal },
          ),
          fetchJsonOrThrow<ForecastResponse>(
            `/api/weather?lat=${coords.lat}&lon=${coords.lon}&units=${units}`,
            { signal: ac.signal },
          ),
        ]);

        setLocationData(rev.results?.[0] ?? null);
        setWeatherData(weather);
        if (weather) setLastWeatherUpdatedAt(new Date());
      } catch (e) {
        if (!ac.signal.aborted) {
          const msg = e instanceof Error ? e.message : String(e);
          setError(msg);
        }
      } finally {
        if (!ac.signal.aborted) setWeatherLoading(false);
      }
    })();

    return () => ac.abort();
  }, [coords, units]);

  useEffect(() => {
    if (!locationData || !weatherData?.current) return;

    const current = weatherData.current;
    const promptLocation =
      [
        locationData.city,
        locationData.state,
        locationData.country,
        locationData.name,
      ]
        .filter(
          (value): value is string =>
            typeof value === "string" && value.trim().length > 0,
        )
        .join(", ") || "your area";
    const weatherSummary = current.weather?.[0]?.description ?? "unknown conditions";
    const roundedTemp = toRoundedInt(current.temp);
    const roundedFeelsLike = toRoundedInt(current.feels_like);
    const roundedHumidity = toRoundedInt(current.humidity);
    const roundedWind = toDisplayWind(current.wind_speed, units);
    const tempScale = units === "f" ? "Fahrenheit" : "Celsius";
    const tempField = units === "f" ? "temp_f" : "temp_c";
    const feelsLikeField = units === "f" ? "feels_like_f" : "feels_like_c";
    const windField = units === "f" ? "wind_mph" : "wind_kph";
    const windUnitRule = units === "f" ? "MPH" : "KPH";
    const disallowedUnitsRule =
      units === "f"
        ? "Do not use Celsius, Kelvin, KPH, KM/H, or M/S."
        : "Do not use Fahrenheit, Kelvin, MPH, or M/S.";

    let prompt = `What's it like in ${promptLocation} right now? `;
    prompt += `Use ${tempScale} (rounded to nearest whole degree) and ${windUnitRule} only. ${disallowedUnitsRule} `;
    prompt += `Write exactly two sentences. `;
    prompt += `Use sentence case. `;
    prompt += `Sentence 1 must include only these facts: condition, temperature, feels-like temperature, humidity, and wind speed. `;
    prompt += `Sentence 2 must be emotional commentary and include the word "damn" exactly once. `;
    prompt += `Use these exact observed values from sensors; do not invent or convert numbers: `;
    prompt += `condition="${weatherSummary}", ${tempField}=${roundedTemp}, ${feelsLikeField}=${roundedFeelsLike}, humidity_pct=${roundedHumidity}, ${windField}=${roundedWind}. `;
    prompt += `Repeat those exact numeric values in the response and match them with the correct units. `;
    prompt += `Do not mention visibility, pressure, UV, sunrise, sunset, clouds percentage, or any other metric not listed above. `;
    const assistantLocation =
      (locationData.city &&
        locationData.state_code &&
        `${locationData.city}, ${locationData.state_code}`) ||
      (locationData.city &&
        locationData.country &&
        `${locationData.city}, ${locationData.country}`) ||
      locationData.name ||
      locationData.country ||
      "your area";
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
        "unknown",
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
        const json = await fetchJsonOrThrow<AssistantResponse>(`/api/assistant`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ prompt }),
          signal: ac.signal,
        });

        setAssistantResponse(
          getVerifiedAssistantResponse(
            json.answer,
            assistantLocation,
            current,
            units,
          ),
        );
      } catch (e) {
        if (!ac.signal.aborted) {
          console.error(e);
          setAssistantResponse("Unable to fetch assistant summary right now.");
        }
      } finally {
        if (!ac.signal.aborted) setAssistantWaiting(false);
      }
    })();

    return () => ac.abort();
  }, [locationData, weatherData, units]);

  return {
    specificLocal,
    generalLocal,
    locationData,
    setLocationData,
    weatherData,
    setWeatherData,
    lastWeatherUpdatedAt,
    units,
    setUnits,
    coords,
    setCoords,
    setCustomCoords,
    assistantResponse,
    assistantWaiting,
    weatherLoading,
    error,
  };
}
