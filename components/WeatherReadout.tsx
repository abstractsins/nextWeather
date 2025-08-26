import { useWeather } from '@/providers/WeatherProvider';
import styles from './WeatherReadout.module.css'
import HeroData from './HeroData';
import LesserData from './LesserData';
import Assistant from './Assistant';


interface Props {
    className?: string;
}

export default function WeatherReadout({ className }: Props) {

    const {
        locationData,
        specificLocal
    } = useWeather();

    return (
        <div className={`${styles.body} ${className}`}>
            {locationData &&
                <div className={styles.neighborhood}>
                    <span>{specificLocal}</span>
                </div>
            }
            
            <HeroData  />

            <LesserData />

            <Assistant />
                
        </div>
    );
}