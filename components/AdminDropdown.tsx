'use client';

import { useState, useRef } from 'react';
import styles from './AdminDropdown.module.css';
import CustomGPS from './CustomGPS';

export default function AdminDropdown() {


    const [isShowing, setShowing] = useState<boolean>(false);
    const ref = useRef(null);

    const handleSlide = () => setShowing(prev => !prev);

    return (
        <div ref={ref} className={`${styles.container} ${isShowing && styles.visible}`}>
            <div className={styles.body}>
                <span className={styles.title}>Admin Tools</span>
                <CustomGPS setShow={(_) => setShowing(_)} />
                <div className={`${styles.tab}`} onClick={handleSlide}>{isShowing ? '^' : 'v'}</div>
            </div>

        </div>
    );
}
