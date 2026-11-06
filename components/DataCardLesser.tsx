
import { DataCardLesserProps } from "@/types/types";
import { getUnitLabel } from "@/utils/utils";
import { useWeather } from "@/providers/WeatherProvider";

export default function DataCardLesser({ id, title, className, data, data2 }: DataCardLesserProps) {
    const { units } = useWeather();
    const processedData = typeof data === 'number'
        ? (units === 'c' && id === 'wind_gust' ? Math.round(data * 3.6) : Math.round(data))
        : data;

    return (
        <>
            <div id={id} className={className}>
                <span className={'data-label'}>{title}</span>
                <span className={'data-value-big'}>{processedData}<span className={`data-label-small ${id === 'temp' && 'degree'}`}>{getUnitLabel(id, units)}</span></span>
                <span className={'data-description'}>{data2}</span>
            </div>
        </>
    );
}