import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const WEATHER_API_KEY = Deno.env.get('WEATHER_API_KEY');
const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';

interface WeatherRequest {
  lat: number;
  lon: number;
  type: 'current' | 'forecast' | 'predictions';
}

interface WeatherApiResponse {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
    };
    wind_kph: number;
    wind_dir: string;
    pressure_mb: number;
    humidity: number;
  };
}

interface ForecastApiResponse {
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
        };
        daily_chance_of_rain: number;
        avghumidity: number;
        maxwind_kph: number;
      };
      astro: {
        moon_phase: string;
        sunrise: string;
        sunset: string;
        moon_illumination: string;
      };
    }>;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { lat, lon, type = 'current' }: WeatherRequest = await req.json();

    if (!lat || !lon) {
      return new Response(
        JSON.stringify({ error: 'Missing latitude or longitude' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!WEATHER_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Weather API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

    if (type === 'current') {
      const response = await fetch(
        `${WEATHER_API_BASE}/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=no`
      );
      
      if (!response.ok) {
        throw new Error('Weather API request failed');
      }

      const data = await response.json() as WeatherApiResponse;
      
      const forecastResponse = await fetch(
        `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=1&aqi=no`
      );
      
      const forecastData = await forecastResponse.json() as ForecastApiResponse;
      const moonPhase = forecastData.forecast.forecastday[0]?.astro.moon_phase || 'Unknown';
      const moonIllumination = parseInt(forecastData.forecast.forecastday[0]?.astro.moon_illumination || '0');

      return new Response(
        JSON.stringify({
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
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'forecast') {
      const response = await fetch(
        `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=7&aqi=no`
      );
      
      if (!response.ok) {
        throw new Error('Weather API request failed');
      }

      const data = await response.json() as ForecastApiResponse;
      
      const forecast = data.forecast.forecastday.map((day) => ({
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

      return new Response(
        JSON.stringify(forecast),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'predictions') {
      const response = await fetch(
        `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=7&aqi=no`
      );
      
      if (!response.ok) {
        throw new Error('Weather API request failed');
      }

      const data = await response.json() as ForecastApiResponse;
      
      const predictions = data.forecast.forecastday.map((day) => {
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

      return new Response(
        JSON.stringify(predictions),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});