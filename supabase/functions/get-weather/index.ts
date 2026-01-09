import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const WEATHER_API_KEY = Deno.env.get('WEATHER_API_KEY');
const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';

interface WeatherRequest {
  lat: number;
  lon: number;
  type: 'current' | 'forecast' | 'predictions';
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

    let apiUrl = '';
    
    if (type === 'current') {
      apiUrl = `${WEATHER_API_BASE}/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=no`;
    } else if (type === 'forecast' || type === 'predictions') {
      apiUrl = `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=3&aqi=no&alerts=no`;
    }

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform data based on type
    let result;
    
    if (type === 'current') {
      result = {
        location: data.location.name,
        temperature: data.current.temp_c,
        condition: data.current.condition.text,
        windSpeed: data.current.wind_kph,
        windDirection: data.current.wind_dir,
        windName: getWindName(data.current.wind_kph),
        pressure: data.current.pressure_mb,
        humidity: data.current.humidity,
        moonPhase: getMoonPhase(data.current),
        moonIllumination: data.current.moon_illumination || 0,
      };
    } else if (type === 'forecast') {
      result = data.forecast.forecastday.map((day: any) => ({
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
    } else if (type === 'predictions') {
      // Generate fishing predictions
      const forecast = data.forecast.forecastday;
      const moonIllumination = data.current.moon_illumination || 50;
      
      result = forecast.map((day: any) => {
        const avgTemp = (day.day.maxtemp_c + day.day.mintemp_c) / 2;
        const score = calculateFishingScore(day, moonIllumination);
        
        return {
          date: day.date,
          timeWindow: getTimeWindow(score),
          score,
          conditions: buildConditions(day, avgTemp),
          temperature: avgTemp,
          moonPhase: day.astro.moon_phase,
          pressure: data.current.pressure_mb,
        };
      }).sort((a: any, b: any) => b.score - a.score);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-weather function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getWindName(windKph: number): string {
  if (windKph < 1) return 'Calm';
  if (windKph < 6) return 'Light Air';
  if (windKph < 12) return 'Light Breeze';
  if (windKph < 20) return 'Gentle Breeze';
  if (windKph < 29) return 'Moderate Breeze';
  if (windKph < 39) return 'Fresh Breeze';
  if (windKph < 50) return 'Strong Breeze';
  if (windKph < 62) return 'Near Gale';
  if (windKph < 75) return 'Gale';
  if (windKph < 89) return 'Strong Gale';
  if (windKph < 103) return 'Storm';
  if (windKph < 118) return 'Violent Storm';
  return 'Hurricane';
}

function getMoonPhase(current: any): string {
  // Try to get moon phase from API or calculate based on date
  if (current.moon_phase) return current.moon_phase;
  
  // Fallback moon phases
  const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
  const illumination = current.moon_illumination || 0;
  
  if (illumination < 6) return 'New Moon';
  if (illumination < 19) return 'Waxing Crescent';
  if (illumination < 31) return 'First Quarter';
  if (illumination < 44) return 'Waxing Gibbous';
  if (illumination < 56) return 'Full Moon';
  if (illumination < 69) return 'Waning Gibbous';
  if (illumination < 81) return 'Last Quarter';
  if (illumination < 94) return 'Waning Crescent';
  return 'New Moon';
}

function calculateFishingScore(day: any, moonIllumination: number): number {
  let score = 50;

  const avgTemp = (day.day.maxtemp_c + day.day.mintemp_c) / 2;
  if (avgTemp >= 15 && avgTemp <= 25) {
    score += 20;
  } else if (avgTemp >= 10 && avgTemp <= 30) {
    score += 10;
  }

  if (day.day.daily_chance_of_rain < 30) {
    score += 15;
  } else if (day.day.daily_chance_of_rain < 60) {
    score += 5;
  } else {
    score -= 10;
  }

  if (day.day.maxwind_kph >= 10 && day.day.maxwind_kph <= 25) {
    score += 10;
  } else if (day.day.maxwind_kph > 35) {
    score -= 15;
  }

  if (moonIllumination > 90 || moonIllumination < 10) {
    score += 15;
  } else if (moonIllumination > 40 && moonIllumination < 60) {
    score += 10;
  }

  if (day.day.avghumidity >= 50 && day.day.avghumidity <= 80) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

function getTimeWindow(score: number): string {
  if (score >= 80) return '06:00 - 09:00';
  if (score >= 60) return '17:00 - 20:00';
  return '05:30 - 08:30';
}

function buildConditions(day: any, avgTemp: number): string {
  const parts: string[] = [];
  
  const moonPhase = day.astro.moon_phase.toLowerCase();
  if (moonPhase.includes('full')) {
    parts.push('Full moon phase');
  } else if (moonPhase.includes('new')) {
    parts.push('New moon phase');
  } else {
    parts.push(`${day.astro.moon_phase} moon`);
  }

  if (avgTemp >= 15 && avgTemp <= 25) {
    parts.push('optimal temperature');
  } else {
    parts.push(`${avgTemp.toFixed(1)}°C`);
  }

  if (day.day.daily_chance_of_rain < 30) {
    parts.push('clear conditions');
  } else if (day.day.daily_chance_of_rain < 60) {
    parts.push('possible light rain');
  } else {
    parts.push('rainy conditions');
  }

  if (day.day.maxwind_kph >= 10 && day.day.maxwind_kph <= 25) {
    parts.push('favorable wind');
  } else if (day.day.maxwind_kph > 35) {
    parts.push('strong winds');
  }

  return parts.join(', ');
}