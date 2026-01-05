const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  windSpeed: number;
  windDirection: string;
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

interface WeatherAPIForecastDay {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    condition: { text: string };
    daily_chance_of_rain: number;
    avghumidity: number;
    maxwind_kph: number;
  };
  astro: {
    moon_phase: string;
    sunrise: string;
    sunset: string;
  };
}

/**
 * Get current weather for a location
 */
export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const response = await fetch(
      `${WEATHER_API_BASE}/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=no`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();
    
    return {
      location: data.location.name,
      temperature: data.current.temp_c,
      condition: data.current.condition.text,
      windSpeed: data.current.wind_kph,
      windDirection: data.current.wind_dir,
      pressure: data.current.pressure_mb,
      humidity: data.current.humidity,
      moonPhase: data.current.moon_phase || 'Unknown',
      moonIllumination: data.current.moon_illumination || 0,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

/**
 * Get 3-day weather forecast
 */
export async function getWeatherForecast(lat: number, lon: number): Promise<ForecastDay[]> {
  try {
    const response = await fetch(
      `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=3&aqi=no&alerts=no`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch forecast data');
    }

    const data = await response.json();
    
    return data.forecast.forecastday.map((day: WeatherAPIForecastDay) => ({
      date: day.date,
      maxTemp: day.day.maxtemp_c,
      minTemp: day.day.mintemp_c,
      condition: day.day.condition.text,
      chanceOfRain: day.day.daily_chance_of_rain,
      moonPhase: day.astro.moon_phase,
      sunrise: day.astro.sunrise,
      sunset: day.astro.sunset,
      avgHumidity: day.day.avghumidity,
      maxWind: day.day.maxwind_kph,
    }));
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return [];
  }
}

/**
 * Calculate fishing success score based on weather conditions
 */
function calculateFishingScore(forecast: ForecastDay, moonIllumination: number): number {
  let score = 50; // Base score

  // Temperature scoring (optimal: 15-25°C)
  const avgTemp = (forecast.maxTemp + forecast.minTemp) / 2;
  if (avgTemp >= 15 && avgTemp <= 25) {
    score += 20;
  } else if (avgTemp >= 10 && avgTemp <= 30) {
    score += 10;
  }

  // Rain scoring (light rain can be good)
  if (forecast.chanceOfRain < 30) {
    score += 15;
  } else if (forecast.chanceOfRain < 60) {
    score += 5;
  } else {
    score -= 10;
  }

  // Wind scoring (moderate wind is good)
  if (forecast.maxWind >= 10 && forecast.maxWind <= 25) {
    score += 10;
  } else if (forecast.maxWind > 35) {
    score -= 15;
  }

  // Moon phase scoring (full moon and new moon are best)
  if (moonIllumination > 90 || moonIllumination < 10) {
    score += 15;
  } else if (moonIllumination > 40 && moonIllumination < 60) {
    score += 10;
  }

  // Humidity scoring (moderate humidity is good)
  if (forecast.avgHumidity >= 50 && forecast.avgHumidity <= 80) {
    score += 5;
  }

  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate fishing predictions based on weather forecast
 */
export async function getFishingPredictions(lat: number, lon: number): Promise<FishingPrediction[]> {
  try {
    const forecast = await getWeatherForecast(lat, lon);
    const current = await getCurrentWeather(lat, lon);
    
    if (!forecast.length || !current) {
      return [];
    }

    const predictions: FishingPrediction[] = [];

    forecast.forEach((day) => {
      const score = calculateFishingScore(day, current.moonIllumination);
      
      // Determine best time windows based on conditions
      let timeWindow = '06:00 - 09:00'; // Default: early morning
      let conditions = '';

      // Build conditions description
      const conditionParts: string[] = [];
      
      if (day.moonPhase.toLowerCase().includes('full')) {
        conditionParts.push('Full moon phase');
      } else if (day.moonPhase.toLowerCase().includes('new')) {
        conditionParts.push('New moon phase');
      } else {
        conditionParts.push(`${day.moonPhase} moon`);
      }

      const avgTemp = (day.maxTemp + day.minTemp) / 2;
      if (avgTemp >= 15 && avgTemp <= 25) {
        conditionParts.push('optimal temperature');
      } else {
        conditionParts.push(`${avgTemp.toFixed(1)}°C`);
      }

      if (day.chanceOfRain < 30) {
        conditionParts.push('clear conditions');
      } else if (day.chanceOfRain < 60) {
        conditionParts.push('possible light rain');
      } else {
        conditionParts.push('rainy conditions');
      }

      if (day.maxWind >= 10 && day.maxWind <= 25) {
        conditionParts.push('favorable wind');
      } else if (day.maxWind > 35) {
        conditionParts.push('strong winds');
      }

      conditions = conditionParts.join(', ');

      // Adjust time window based on score
      if (score >= 80) {
        timeWindow = '06:00 - 09:00'; // Best: early morning
      } else if (score >= 60) {
        timeWindow = '17:00 - 20:00'; // Good: evening
      } else {
        timeWindow = '05:30 - 08:30'; // Moderate: dawn
      }

      predictions.push({
        date: day.date,
        timeWindow,
        score,
        conditions,
        temperature: avgTemp,
        moonPhase: day.moonPhase,
        pressure: current.pressure,
      });
    });

    // Sort by score (best first)
    return predictions.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error generating predictions:', error);
    return [];
  }
}