import styles from './CustomGPS.module.css';

import { useWeather } from '@/providers/WeatherProvider';

interface Props {
    setShow: (_: boolean) => void;
}

export default function CustomGPS({ setShow }: Props) {

    const {
        setCoords,
        setCustomCoords
    } = useWeather();


    const handleSubmitCustomGPS = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const lat = formData.get("lat") as string;
        const lon = formData.get("lon") as string;

        const coords = {
            lat: parseFloat(lat),
            lon: parseFloat(lon),
        };

        setShow(false);
        setCoords({ lat: coords.lat, lon: coords.lon });
        setCustomCoords(true);
    }


    return (
        <div className={styles.container}>
            <span>Custom GPS</span>
            <form onSubmit={handleSubmitCustomGPS}>
                <div className='flex gap-5'>

                    <input
                        className={styles.gpsInput}
                        name="lat"
                        type="number"
                        placeholder="latitude"
                        step={.00000000000001}
                    />
                    <input
                        className={styles.gpsInput}
                        name="lon"
                        type="number"
                        placeholder="longitude"
                        step={.00000000000001}
                    />

                    <input
                        className={styles.submit}
                        type='submit'
                        value={'Set'}
                    />
                </div>
            </form>
        </div>
    );
}