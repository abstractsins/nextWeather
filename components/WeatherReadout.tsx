import useWeather from '@/hooks/useWeather';
import styles from './WeatherReadout.module.css'

interface Props {
    className?: string;
}

export default function WeatherReadout({ className }: Props) {

    const {
        weatherData,
        locationData,
        specificLocal
    } = useWeather();

    return (
        <div className={`${styles.body} ${className && styles[className]}`}>
            {locationData &&
                <div className={styles.neighborhood}>
                    <span>{specificLocal}</span>
                </div>
            }

            {weatherData &&
                <div className={styles.feelsLikeContainer}>
                    <span>{Math.round(weatherData[0].main.feels_like)}&#176;</span>
                </div>
            }
        </div>
    );
}