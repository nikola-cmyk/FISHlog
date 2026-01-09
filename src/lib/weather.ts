import { supabase } from './supabase-client';

const SUPABASE_FUNCTION_URL = `${supabase.supabaseUrl}/functions/v1/get-weather`;

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  windSpeed: number;
  windDirection: string;
  windName: string;
  pressure: number;
  humidity: number;
  moonPhase: string;
  moonIllumination: number;
}

interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  chanceOfRain: number;
  moonPhase: string;
  sunrise: string;
  sunset: string;
  avgHumidity: number;
  maxWind: number;
}

interface FishingPrediction {
  date: string;
  timeWindow: string;
  score: number;
  conditions: string;
  temperature: number;
  moonPhase: string;
  pressure: number;
}

async function callWeatherFunction(lat: number, lon: number, type: 'current' | 'forecast' | 'predictions'): Promise<unknown> {
  const { data, error } = await supabase.functions.invoke('get-weather', {
    body: { lat, lon, type }
  });

  if (error) throw error;
  return data;
}

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const data = await callWeatherFunction(lat, lon, 'current') as WeatherData;
    return data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    return null;
  }
}

export async function getWeatherForecast(lat: number, lon: number): Promise<ForecastDay[]> {
  try {
    const data = await callWeatherFunction(lat, lon, 'forecast') as ForecastDay[];
    return data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return [];
  }
}

export async function getFishingPredictions(lat: number, lon: number): Promise<FishingPrediction[]> {
  try {
    const data = await callWeatherFunction(lat, lon, 'predictions') as FishingPrediction[];
    return data;
  } catch (error) {
    console.error('Error fetching fishing predictions:', error);
    return [];
  }
}