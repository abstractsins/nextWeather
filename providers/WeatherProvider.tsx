'use client';

import { createContext, useContext, useMemo, PropsWithChildren } from 'react';
import useWeatherInternal from '@/hooks/useWeather';


type WeatherCtx = ReturnType<typeof useWeatherInternal>;
const WeatherContext = createContext<WeatherCtx | null>(null);


export function WeatherProvider({ children }: PropsWithChildren) {

    const value = useWeatherInternal();
    const memo = useMemo(() => value, [value]);

    return (
        <WeatherContext.Provider value={memo}>
            {children}
        </WeatherContext.Provider>
    );
}

export function useWeather() {
    const ctx = useContext(WeatherContext);
    if (!ctx) throw new Error('useWeather must be used within <WeatherProvider>');
    return ctx;
}
