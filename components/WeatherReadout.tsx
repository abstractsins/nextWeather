import { useEffect, useState } from 'react';
import { useWeather } from '@/providers/WeatherProvider';
import styles from './WeatherReadout.module.css'
import HeroData from './HeroData';
import LesserData from './LesserData';
import Assistant from './Assistant';


interface Props {
    className?: string;
}

const GRADIENT_VIBRANCE = 1.15;

const applyGradientVibrance = (gradient: string): string => {
    return gradient.replace(
        /rgba\((\d+),\s*(\d+),\s*(\d+),\s*(0|1|0?\.\d+)\)/g,
        (_match, r, g, b, alpha) => {
            const nextAlpha = Math.min(1, parseFloat(alpha) * GRADIENT_VIBRANCE);
            return `rgba(${r}, ${g}, ${b}, ${nextAlpha.toFixed(3)})`;
        }
    );
};

export default function WeatherReadout({ className }: Props) {
    const [now, setNow] = useState<Date>(new Date());

    const {
        locationData,
        specificLocal,
        weatherData,
        lastWeatherUpdatedAt,
        weatherLoading,
        units,
        setUnits
    } = useWeather();

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 30_000);

        return () => clearInterval(interval);
    }, []);

    const getFreshnessText = (): string => {
        if (!lastWeatherUpdatedAt) return "Last updated: --";
        const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - lastWeatherUpdatedAt.getTime()) / 1000));
        if (elapsedSeconds < 5) return "Last updated: just now";
        if (elapsedSeconds < 60) return `Last updated: ${elapsedSeconds}s ago`;
        const elapsedMinutes = Math.floor(elapsedSeconds / 60);
        return `Last updated: ${elapsedMinutes}m ago`;
    };

    const getLocationLocalTimeText = (): string => {
        const offsetSeconds = weatherData?.timezone_offset;
        if (typeof offsetSeconds !== 'number') return 'Local time: --';

        const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
        const locationMs = utcMs + offsetSeconds * 1_000;
        const locationDate = new Date(locationMs);

        const hours24 = locationDate.getUTCHours();
        const minutes = locationDate.getUTCMinutes();
        const amPm = hours24 >= 12 ? 'PM' : 'AM';
        const hours12 = hours24 % 12 || 12;
        const paddedMinutes = minutes.toString().padStart(2, '0');

        return `Local time: ${hours12}:${paddedMinutes} ${amPm}`;
    };
    
    const getPanelGradient = (): string => {
        const current = weatherData?.current;
        if (!current) {
            return applyGradientVibrance("linear-gradient(145deg, rgba(58, 67, 124, 0.2), rgba(16, 19, 46, 0.2))");
        }

        const weatherMain = current.weather?.[0]?.main?.toLowerCase() ?? "";
        const fallbackIsDay = now.getHours() >= 6 && now.getHours() < 18;
        const dt = current.dt;
        const sunrise = current.sunrise;
        const sunset = current.sunset;
        const hasSunData =
            typeof dt === "number" &&
            typeof sunrise === "number" &&
            typeof sunset === "number";
        const isDay = hasSunData
            ? dt >= sunrise && dt < sunset
            : fallbackIsDay;

        if (weatherMain.includes("thunderstorm")) {
            return applyGradientVibrance(isDay
                ? "linear-gradient(145deg, rgba(158, 122, 255, 0.32), rgba(72, 94, 207, 0.28), rgba(255, 99, 132, 0.18))"
                : "linear-gradient(145deg, rgba(110, 79, 200, 0.33), rgba(43, 56, 141, 0.3), rgba(196, 69, 120, 0.18))");
        }

        if (weatherMain.includes("rain") || weatherMain.includes("drizzle")) {
            return applyGradientVibrance(isDay
                ? "linear-gradient(145deg, rgba(37, 197, 250, 0.32), rgba(45, 127, 229, 0.28), rgba(77, 229, 208, 0.2))"
                : "linear-gradient(145deg, rgba(32, 136, 201, 0.33), rgba(31, 73, 149, 0.28), rgba(42, 173, 184, 0.2))");
        }

        if (weatherMain.includes("snow")) {
            return applyGradientVibrance(isDay
                ? "linear-gradient(145deg, rgba(242, 250, 255, 0.32), rgba(176, 224, 255, 0.27), rgba(210, 186, 255, 0.2))"
                : "linear-gradient(145deg, rgba(170, 193, 224, 0.31), rgba(95, 128, 171, 0.28), rgba(138, 109, 214, 0.2))");
        }

        if (weatherMain.includes("cloud")) {
            return applyGradientVibrance(isDay
                ? "linear-gradient(145deg, rgba(196, 186, 255, 0.3), rgba(140, 167, 255, 0.25), rgba(238, 178, 255, 0.18))"
                : "linear-gradient(145deg, rgba(110, 110, 188, 0.31), rgba(72, 92, 152, 0.28), rgba(155, 96, 170, 0.18))");
        }

        return applyGradientVibrance(isDay
            ? "linear-gradient(145deg, rgba(255, 202, 87, 0.34), rgba(255, 153, 102, 0.3), rgba(105, 188, 255, 0.2))"
            : "linear-gradient(145deg, rgba(81, 89, 191, 0.33), rgba(156, 97, 195, 0.27), rgba(35, 46, 121, 0.24))");
    };

    return (
        <div
            className={`${styles.body} ${className}`}
            style={{ backgroundImage: getPanelGradient() }}
        >
            {locationData &&
                <div className={styles.neighborhood}>
                    <span>{specificLocal}</span>
                </div>
            }
            <div className={styles.freshness}>
                <span>{getFreshnessText()}</span>
            </div>
            <div className={styles.localTime}>
                <span>{getLocationLocalTimeText()}</span>
            </div>
            <div className={styles.unitsToggle} role="group" aria-label="Temperature units">
                <button
                    type="button"
                    className={`${styles.unitButton} ${units === 'f' ? styles.activeUnit : ''}`}
                    onClick={() => setUnits('f')}
                    disabled={weatherLoading}
                    aria-busy={weatherLoading}
                >
                    °F
                </button>
                <button
                    type="button"
                    className={`${styles.unitButton} ${units === 'c' ? styles.activeUnit : ''}`}
                    onClick={() => setUnits('c')}
                    disabled={weatherLoading}
                    aria-busy={weatherLoading}
                >
                    °C
                </button>
            </div>

            <>
                <HeroData />
                <LesserData />
            </>

            <Assistant />
                
        </div>
    );
}