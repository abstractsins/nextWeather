export interface LocationObj {
    county?: string;
    city?: string;
    name?: string;
    suburb?: string;
    hamlet?: string;
    neighbourhood?: string;
    state?: string;
    state_code?: string;
    district?: string;
    region?: string;
    iso3166_2?: string;
    country?: string;
    ocean?: string;
}

export interface DataCardHeroProps {
    key: number | string;
    id: string;
    className: string;
    title: string;
    data: number | undefined;
}

export interface DataCardLesserProps {
    id: string;
    className: string;
    title: string;
    data: number | string | undefined;
    data2?: number | string | undefined;
}

export interface ForecastResponse {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current?: CurrentWeather;
  minutely?: MinutelyForecast[];
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
  alerts?: Alert[];
}

export interface CurrentWeather {
  dt?: number;
  sunrise?: number;
  sunset?: number;
  temp?: number;
  feels_like?: number;
  pressure?: number;
  humidity?: number;
  dew_point?: number;
  uvi?: number;
  clouds?: number;
  visibility?: number;
  wind_speed?: number;
  wind_deg?: number;
  wind_gust?: number;
  weather: Weather[];
  rain?: { [key: string]: number };
  snow?: { [key: string]: number };
}

export interface MinutelyForecast {
  dt?: number;
  precipitation?: number;
}

export interface HourlyForecast {
  dt?: number;
  temp?: number;
  feels_like?: number;
  pressure?: number;
  humidity?: number;
  dew_point?: number;
  uvi?: number;
  clouds?: number;
  visibility?: number;
  wind_speed?: number;
  wind_deg?: number;
  wind_gust?: number;
  weather?: Weather[];
  pop?: number;
  rain?: { [key: string]: number };
  snow?: { [key: string]: number };
}

export interface DailyForecast {
  dt?: number;
  sunrise?: number;
  sunset?: number;
  moonrise?: number;
  moonset?: number;
  moon_phase?: number;
  summary?: string;
  temp?: {
    day?: number;
    min?: number;
    max?: number;
    night?: number;
    eve?: number;
    morn?: number;
  };
  feels_like?: {
    day?: number;
    night?: number;
    eve?: number;
    morn?: number;
  };
  pressure?: number;
  humidity?: number;
  dew_point?: number;
  wind_speed?: number;
  wind_deg?: number;
  wind_gust?: number;
  weather?: Weather[];
  clouds?: number;
  pop?: number;
  rain?: number;
  snow?: number;
  uvi?: number;
}

export interface Alert {
  sender_name?: string;
  event?: string;
  start?: number;
  end?: number;
  description?: string;
  tags?: string[];
}

export interface Weather {
  id?: number;
  main?: string;
  description?: string;
  icon?: string;
}

export type TempUnit = 'f' | 'c';