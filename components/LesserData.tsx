import { useWeather } from '@/providers/WeatherProvider';

import DataCardLesser from "./DataCardLesser";
import { useEffect, useState } from "react";

export default function LesserData() {

    const { weatherData } = useWeather();
    const [isSnow, setIsSnow] = useState<boolean>(false);
    const [isRain, setIsRain] = useState<boolean>(false);

    useEffect(() => {
        setIsSnow(!!weatherData?.current?.snow);
        setIsRain(!!weatherData?.current?.rain);
    }, [weatherData])

    if (!weatherData) return;


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
                                data={weatherData.current?.rain['1h']}
                                data2={weatherData.current?.weather[0].description}
                            />
                        }

                        {isSnow &&
                            <DataCardLesser
                                id={"rain"}
                                title={"Rain"}
                                className={"data-container"}
                                data={weatherData.current?.snow['1h']}
                                data2={weatherData.current?.weather[0].description}
                            />
                        }

                    </div>

                </>
            }
        </>
    );
}