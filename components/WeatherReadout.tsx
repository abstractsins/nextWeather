import styles from './WeatherReadout.module.css'

import { LocationObj } from "@/app/page";

interface Props {
    locationData: LocationObj
}

export default function WeatherReadout({ locationData }: Props) {
    return (
        <div className={styles.body}>
            <div className={styles.neighborhood}><span>{locationData.suburb}</span></div>
        </div>
    );
}