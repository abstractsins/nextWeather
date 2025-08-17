'use client';

import styles from './page.module.css';

import { IoHome } from "react-icons/io5";

import MiniLoader from '@/components/MiniLoader';
import WeatherReadout from '@/components/WeatherReadout';

import useWeather from '@/hooks/useWeather';

export default function Home() {

    const { locationData } = useWeather();

    return (
        <div>

            <div className={styles.location}>
                <span className={styles.cityState}>
                    <IoHome />
                    {locationData
                        ? <>{locationData.city}, {locationData.state_code}</>
                        : <MiniLoader />
                    }
                </span>
            </div>

            <div className={styles.mainContent}>
                <WeatherReadout className={`${locationData ? 'visible' : 'invisible'}`} />
            </div>

        </div>
    );


}