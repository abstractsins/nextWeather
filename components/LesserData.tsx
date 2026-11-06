import { useWeather } from '@/providers/WeatherProvider';

import DataCardLesser from "./DataCardLesser";
import { useEffect, useState } from "react";
import { getPrecipitationSummary, toCardinalDirection } from '@/utils/utils';

export default function LesserData() {

    const { weatherData, units } = useWeather();
    const [isSnow, setIsSnow] = useState<boolean>(false);
    const [isRain, setIsRain] = useState<boolean>(false);

    useEffect(() => {
        setIsSnow(!!weatherData?.current?.snow);
        setIsRain(!!weatherData?.current?.rain);
    }, [weatherData])

    if (!weatherData) return;

    const rainSummary = getPrecipitationSummary(weatherData.current?.rain?.['1h'], 'rain', units);
    const snowSummary = getPrecipitationSummary(weatherData.current?.snow?.['1h'], 'snow', units);


    return (
        <>
            {weatherData &&
                <>
                    <div className='flex justify-center'>

                        {weatherData.current?.weather[0].main === 'Clouds' &&
                            <DataCardLesser
                                id={"cloudiness"}
                                title={"Cloudiness"}
                                className={"data-container"}
                                data={weatherData.current?.clouds}
                                data2={weatherData.current?.weather[0].description}
                            />
                        }

                        {isRain &&
                            <DataCardLesser
                                id={"rain"}
                                title={"Rain"}
                                className={"data-container"}
                                data={rainSummary.amountLabel}
                                data2={rainSummary.detail}
                            />
                        }

                        {isSnow &&
                            <DataCardLesser
                                id={"snow"}
                                title={"Snow"}
                                className={"data-container"}
                                data={snowSummary.amountLabel}
                                data2={snowSummary.detail}
                            />
                        }

                        {typeof weatherData.current?.wind_deg === 'number' &&
                            <DataCardLesser
                                id={"wind_direction"}
                                title={"Wind Dir"}
                                className={"data-container"}
                                data={toCardinalDirection(weatherData.current?.wind_deg)}
                                data2={`${Math.round(weatherData.current?.wind_deg ?? 0)}°`}
                            />
                        }

                        {typeof weatherData.current?.wind_gust === 'number' &&
                            <DataCardLesser
                                id={"wind_gust"}
                                title={"Wind Gust"}
                                className={"data-container"}
                                data={weatherData.current?.wind_gust}
                            />
                        }

                    </div>

                </>
            }
        </>
    );
}