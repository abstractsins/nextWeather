'use client';

import styles from './page.module.css';

import { useEffect, useState } from "react";

import { IoHome } from "react-icons/io5";

import MiniLoader from '@/components/MiniLoader';
import WeatherReadout from '@/components/WeatherReadout';

export interface LocationObj {
    county?: string;
    city?: string;
    suburb?: string;
    state_code?: string;
    district?: string;
    iso3166_2?: string;
}

export default function Home() {

    const [lat, setLatitude] = useState<number | null>(null);
    const [lon, setLongitude] = useState<number | null>(null);

    const [locationData, setLocationData] = useState<LocationObj | null>(null);
    const [weatherData, setWeatherData] = useState();

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const long = position.coords.longitude;

                    console.log(`Latitude: ${lat}, Longitude: ${lon}`);
                    setLatitude(lat);
                    setLongitude(long);
                },
                (error) => {
                    console.error('Error getting location:', error.message);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    });


    useEffect(() => {

        if (lat && lon) {

            const reverseGeo = () => {
                const url = `/api/reverse-geocode?lat=${lat}&lon=${lon}`;
                fetch(url)
                    .then(response => response.json())
                    .then(result => { console.log(result); setLocationData(result.results[0]) })
                    .catch(error => console.log('error', error));
            }

            const getWeather = () => {
                const url = `/api/weather?lat=${lat}&lon=${lon}`;
                fetch(url) 
                    .then(response => response.json())
                    .then(result => { console.log(result); setWeatherData(result) })
                    .catch(error => console.log('error', error));                
            }

            reverseGeo();
            getWeather();
        }

    }, [lat, lon]);


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
                {locationData &&
                    <WeatherReadout locationData={locationData} />
                }
            </div>

        </div>
    );


}