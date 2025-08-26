import { useWeather } from '@/providers/WeatherProvider';

import DataCardBasic from "./DataCardBasic";
import LesserData from "./LesserData";

export default function HeroData() {

    const { weatherData } = useWeather();

    if (!weatherData) return;

    const heroCards = [
        {
            id: "temp",
            title: "Temp",
            className: "data-container hero",
            data: weatherData.current?.temp
        },
        {
            id: "humidity",
            title: "Humidity",
            className: "data-container hero",
            data: weatherData.current?.humidity
        },
        {
            id: "wind",
            title: "Wind",
            className: "data-container hero",
            data: weatherData.current?.wind_speed
        }
    ]

    return (
        <>
            {weatherData &&
                <>
                    <div className='flex justify-center'>
                        {heroCards.map(({ id, title, className, data }) =>
                            <DataCardBasic
                                key={id}
                                id={id}
                                title={title}
                                className={className}
                                data={data}
                            />
                        )}
                    </div>

                </>
            }
        </>
    );
}