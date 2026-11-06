
import { DataCardLesserProps } from "@/types/types";
import { getUnitLabel } from "@/utils/utils";
import { useWeather } from "@/providers/WeatherProvider";
import MiniLoader from "./MiniLoader";
import { useEffect, useRef, useState } from "react";

export default function DataCardLesser({ id, title, className, data, data2 }: DataCardLesserProps) {
    const { units, weatherLoading } = useWeather();
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [lockedMinHeight, setLockedMinHeight] = useState<number | null>(null);
    const processedData = typeof data === 'number'
        ? (units === 'c' && id === 'wind_gust' ? Math.round(data * 3.6) : Math.round(data))
        : data;

    useEffect(() => {
        if (!weatherLoading && cardRef.current) {
            setLockedMinHeight(cardRef.current.offsetHeight);
        }
    }, [weatherLoading, processedData, data2, units]);

    return (
        <>
            <div
                ref={cardRef}
                id={id}
                className={className}
                style={weatherLoading && lockedMinHeight ? { minHeight: `${lockedMinHeight}px` } : undefined}
            >
                <span className={'data-label'}>{title}</span>
                {weatherLoading ? (
                    <span className={'data-value-big'}>
                        <MiniLoader />
                    </span>
                ) : (
                    <>
                        <span className={'data-value-big'}>{processedData}<span className={`data-label-small ${id === 'temp' && 'degree'}`}>{getUnitLabel(id, units)}</span></span>
                        <span className={'data-description'}>{data2}</span>
                    </>
                )}
            </div>
        </>
    );
}