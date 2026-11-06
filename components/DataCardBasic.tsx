import { DataCardHeroProps } from "@/types/types";
import { getUnitLabel } from "@/utils/utils";
import { useWeather } from "@/providers/WeatherProvider";

export default function DataCardBasic({ id, className, title, data }: DataCardHeroProps) {
    const { units } = useWeather();

    const processedData = typeof data === 'number'
        ? (units === 'c' && id === 'wind' ? Math.round(data * 3.6) : Math.round(data))
        : data;
    const isDegree = id === 'temp' || id === 'feels_like';

    return (
        <div id={id} className={className}>
            <span className={'data-label'}>{title}</span>
            <span className={'data-value-big'}>{processedData}<span className={`data-label-small ${isDegree && 'degree'}`}>{getUnitLabel(id, units)}</span></span>
        </div>
    );
}