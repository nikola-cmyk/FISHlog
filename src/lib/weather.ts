const WEATHER_API_KEY = 'd794e839737d4176941164621260501';
const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';

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

const getWindName = (speed: number): string => {
  if (speed < 1) return 'Calm';
  if (speed < 6) return 'Light Air';
  if (speed < 12) return 'Light Breeze';
  if (speed < 20) return 'Gentle Breeze';
  if (speed < 29) return 'Moderate Breeze';
  if (speed < 39) return 'Fresh Breeze';
  if (speed < 50) return 'Strong Breeze';
  if (speed < 62) return 'Near Gale';
  if (speed < 75) return 'Gale';
  if (speed < 89) return 'Strong Gale';
  if (speed < 103) return 'Storm';
  if (speed < 118) return 'Violent Storm';
  return 'Hurricane';
};

const calculateFishingScore = (temp: number, moonPhase: string, pressure: number, windSpeed: number): number => {
  let score = 50;
  
  if (temp >= 15 && temp <= 25) score += 20;
  else if (temp >= 10 && temp < 15) score += 10;
  else if (temp > 25 && temp <= 30) score += 10;
  
  if (moonPhase.includes('Full') || moonPhase.includes('New')) score += 15;
  else if (moonPhase.includes('Quarter')) score += 10;
  
  if (pressure >= 1010 && pressure <= 1020) score += 15;
  else if (pressure >= 1005 && pressure < 1010) score += 10;
  
  if (windSpeed >= 5 && windSpeed <= 20) score += 10;
  else if (windSpeed > 20 && windSpeed <= 30) score += 5;
  
  return Math.min(100, Math.max(0, score));
};

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const response = await fetch(
      `${WEATHER_API_BASE}/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=no`
    );
    
    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();
    
    const forecastResponse = await fetch(
      `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=1&aqi=no`
    );
    
    const forecastData = await forecastResponse.json();
    const moonPhase = forecastData.forecast.forecastday[0]?.astro.moon_phase || 'Unknown';
    const moonIllumination = parseInt(forecastData.forecast.forecastday[0]?.astro.moon_illumination || '0');

    return {
      location: `${data.location.name}, ${data.location.country}`,
      temperature: data.current.temp_c,
      condition: data.current.condition.text,
      windSpeed: data.current.wind_kph,
      windDirection: data.current.wind_dir,
      windName: getWindName(data.current.wind_kph),
      pressure: data.current.pressure_mb,
      humidity: data.current.humidity,
      moonPhase,
      moonIllumination,
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    return null;
  }
}

export async function getWeatherForecast(lat: number, lon: number): Promise<ForecastDay[]> {
  try {
    const response = await fetch(
      `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=7&aqi=no`
    );
    
    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();
    
    const forecast = data.forecast.forecastday.map((day: any) => ({
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

    return forecast;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return [];
  }
}

export async function getFishingPredictions(lat: number, lon: number): Promise<FishingPrediction[]> {
  try {
    const response = await fetch(
      `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=7&aqi=no`
    );
    
    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();
    
    const predictions = data.forecast.forecastday.map((day: any) => {
      const avgTemp = (day.day.maxtemp_c + day.day.mintemp_c) / 2;
      const score = calculateFishingScore(
        avgTemp,
        day.astro.moon_phase,
        1013,
        day.day.maxwind_kph
      );

      let timeWindow = 'All Day';
      if (score >= 80) {
        timeWindow = 'Dawn & Dusk (Best)';
      } else if (score >= 60) {
        timeWindow = 'Morning & Evening';
      }

      let conditions = 'Good';
      if (score >= 80) conditions = 'Excellent';
      else if (score >= 60) conditions = 'Very Good';
      else if (score < 40) conditions = 'Poor';

      return {
        date: day.date,
        timeWindow,
        score,
        conditions,
        temperature: avgTemp,
        moonPhase: day.astro.moon_phase,
        pressure: 1013,
      };
    });

    return predictions;
  } catch (error) {
    console.error('Error fetching fishing predictions:', error);
    return [];
  }
}