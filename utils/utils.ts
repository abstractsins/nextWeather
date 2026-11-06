import { TempUnit } from "@/types/types";

export const getUnitLabel = (id: string, units: TempUnit): string => {
        switch(id) {
            case 'temp': return units === 'f' ? '°F' : '°C';
            case 'feels_like': return units === 'f' ? '°F' : '°C';
            case 'humidity': return '%';
            case 'wind': return units === 'f' ? 'mph' : 'kph';
            case 'wind_gust': return units === 'f' ? 'mph' : 'kph';
            case 'cloudiness': return '%';
            default: return '';
        }
    };

export const toCardinalDirection = (degrees: number | undefined): string => {
    if (typeof degrees !== "number" || Number.isNaN(degrees)) return "N/A";
    const normalized = ((degrees % 360) + 360) % 360;
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(normalized / 45) % 8;
    return directions[index];
};

type PrecipType = "rain" | "snow";

export const getPrecipitationSummary = (
    amountMm: number | undefined,
    type: PrecipType,
    units: TempUnit
): { amountLabel: string; detail: string } => {
    const safeAmount = typeof amountMm === "number" && Number.isFinite(amountMm) ? amountMm : 0;
    const amountLabel = units === "f"
        ? `${(safeAmount / 25.4).toFixed(2)} in`
        : `${safeAmount.toFixed(1)} mm`;

    let intensity = "none";
    if (safeAmount > 0 && safeAmount < 0.25) intensity = "very light";
    else if (safeAmount < 2.5) intensity = "light";
    else if (safeAmount < 7.6) intensity = "moderate";
    else if (safeAmount < 15) intensity = "heavy";
    else if (safeAmount >= 15) intensity = "intense";

    if (safeAmount <= 0) {
        return {
            amountLabel,
            detail: `No ${type} in the last hour`,
        };
    }

    return {
        amountLabel,
        detail: `${intensity[0].toUpperCase()}${intensity.slice(1)} ${type} in the last hour`,
    };
};