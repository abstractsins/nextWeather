import styles from './Assistant.module.css';
import ReactMarkdown from 'react-markdown';

import { useWeather } from '@/providers/WeatherProvider';
import MiniLoader from './MiniLoader';

export default function Assistant() {

    const { assistantResponse, assistantWaiting } = useWeather();

    return (
        <div className={`${styles.wrapper}`}>
            <div className={styles.body}>
                {assistantWaiting
                    ? <MiniLoader />
                    : (
                        <div className={styles.markdown}>
                            <ReactMarkdown>{assistantResponse ?? ''}</ReactMarkdown>
                        </div>
                    )
                }
            </div>
        </div>
    );
}