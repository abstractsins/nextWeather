export interface LocationObj {
    county?: string;
    city?: string;
    suburb?: string;
    hamlet?: string;
    neighbourhood?: string;
    state_code?: string;
    district?: string;
    iso3166_2?: string;
}

export interface Weather {
    id: number;
    main: string;
    description: string;
    icon: string;
}

export interface ForecastEntry {
    dt: number;
    dt_txt: string;
    main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        sea_level: number;
        grnd_level: number;
        humidity: number;
        temp_kf: number;
    };
    weather: Weather[];
    clouds: {
        all: number;
    };
    wind: {
        speed: number;
        deg: number;
        gust: number;
    };
    visibility: number;
    pop: number;
    sys: {
        pod: string;
    };
}


export interface ForecastResponse {
    cod: string;
    list: ForecastEntry[];
}
