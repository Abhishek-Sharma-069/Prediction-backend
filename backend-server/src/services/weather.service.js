import axios from 'axios';

const TIMEOUT_MS = 10000;

/**
 * Fetch current weather from Open-Meteo for given lat/lon.
 * Returns raw values suitable for mapping to ML features.
 * @param {{ latitude: number, longitude: number, timezone?: string }}
 * @returns {Promise<{ temperature_2m: number, relative_humidity_2m: number, precipitation: number, surface_pressure: number, wind_speed_10m: number }>}
 */
export async function fetchCurrentWeather({ latitude, longitude, timezone = 'auto' }) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,relative_humidity_2m,precipitation,surface_pressure,wind_speed_10m',
    timezone,
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const { data } = await axios.get(url, { timeout: TIMEOUT_MS });
  const c = data?.current;
  if (!c) throw new Error('Open-Meteo: missing current weather');
  return {
    temperature_2m: c.temperature_2m ?? 0,
    relative_humidity_2m: c.relative_humidity_2m ?? 0,
    precipitation: c.precipitation ?? 0,
    surface_pressure: c.surface_pressure ?? 1013,
    wind_speed_10m: c.wind_speed_10m ?? 0,
  };
}

/**
 * Map Open-Meteo current weather to ML model feature row (raw values).
 * ML expects: TOTRF, RD, RH, DBT, MWS, MSLP.
 * Open-Meteo: precipitation (mm), relative_humidity (%), temperature_2m (°C), wind_speed_10m (km/h), surface_pressure (hPa).
 * RD (rainfall duration) is not provided by Open-Meteo; use 0.
 */
export function weatherToMlFeatures(weather) {
  return {
    TOTRF: Number(weather.precipitation) || 0,
    RD: 0,
    RH: Number(weather.relative_humidity_2m) || 0,
    DBT: Number(weather.temperature_2m) ?? 0,
    MWS: Number(weather.wind_speed_10m) || 0,
    MSLP: Number(weather.surface_pressure) || 1013,
  };
}
