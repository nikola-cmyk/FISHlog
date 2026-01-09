const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface WeatherData {
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

export interface ForecastDay {
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

export interface FishingPrediction {
  date: string;
  timeWindow: string;
  score: number;
  conditions: string;
  temperature: number;
  moonPhase: string;
  pressure: number;
}

/**
 * Call secure backend weather function
 */
async function callWeatherFunction(lat: number, lon: number, type: 'current' | 'forecast' | 'predictions'): Promise<any> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/get-weather`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ lat, lon, type }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Weather API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling weather function:', error);
    throw error;
  }
}

/**
 * Get current weather for a location (secure - calls backend)
 */
export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    return await callWeatherFunction(lat, lon, 'current');
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

/**
 * Get 3-day weather forecast (secure - calls backend)
 */
export async function getWeatherForecast(lat: number, lon: number): Promise<ForecastDay[]> {
  try {
    return await callWeatherFunction(lat, lon, 'forecast');
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return [];
  }
}

/**
 * Generate fishing predictions based on weather forecast (secure - calls backend)
 */
export async function getFishingPredictions(lat: number, lon: number): Promise<FishingPrediction[]> {
  try {
    return await callWeatherFunction(lat, lon, 'predictions');
  } catch (error) {
    console.error('Error generating predictions:', error);
    return [];
  }
}