// Weather API integration

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
  };
}

export interface FormattedWeather {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

export interface GameWeather {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  forecastTime: string;
}

export async function fetchWeather(location: string = "New York"): Promise<FormattedWeather | null> {
  const apiKey = process.env.WEATHER_API_KEY;
  
  if (!apiKey) {
    console.warn("Weather API key not found");
    return null;
  }

  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&aqi=no`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!res.ok) {
      console.error("Weather API error:", res.status);
      return null;
    }

    const data: WeatherData = await res.json();
    
    return {
      location: `${data.location.name}, ${data.location.region}`,
      temperature: Math.round(data.current.temp_f),
      condition: data.current.condition.text,
      icon: data.current.condition.icon,
      humidity: data.current.humidity,
      windSpeed: Math.round(data.current.wind_mph),
      feelsLike: Math.round(data.current.feelslike_f),
    };
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return null;
  }
}

/**
 * Fetch weather forecast for a specific game time and location
 * Used for outdoor sports (NFL, Soccer, etc.) to show weather at match time
 */
export async function fetchGameWeather(
  location: string,
  gameDateTime: string | Date
): Promise<GameWeather | null> {
  const apiKey = process.env.WEATHER_API_KEY;
  
  if (!apiKey) {
    return null;
  }

  try {
    const gameDate = typeof gameDateTime === 'string' ? new Date(gameDateTime) : gameDateTime;
    const dateStr = gameDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Use forecast API to get weather for specific date
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(location)}&days=3&aqi=no&alerts=no`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!res.ok) {
      console.error("Weather forecast API error:", res.status);
      return null;
    }

    const data = await res.json();
    
    // Find the forecast day matching game date
    const forecastDay = data.forecast?.forecastday?.find((day: any) => day.date === dateStr);
    
    if (!forecastDay) {
      // Fallback to current day if forecast not available
      return {
        temperature: Math.round(data.current.temp_f),
        condition: data.current.condition.text,
        icon: data.current.condition.icon,
        humidity: data.current.humidity,
        windSpeed: Math.round(data.current.wind_mph),
        rainProbability: data.current.precip_in > 0 ? 50 : 0, // Estimate
        forecastTime: gameDate.toLocaleString(),
      };
    }

    // Get hour closest to game time
    const gameHour = gameDate.getHours();
    const hourlyForecast = forecastDay.hour?.find((h: any) => {
      const hour = new Date(h.time).getHours();
      return Math.abs(hour - gameHour) <= 1; // Within 1 hour
    }) || forecastDay.hour?.[Math.floor(gameHour / 3) * 3] || forecastDay.hour?.[0];

    if (!hourlyForecast) {
      // Fallback to day average
      return {
        temperature: Math.round(forecastDay.day.avgtemp_f),
        condition: forecastDay.day.condition.text,
        icon: forecastDay.day.condition.icon,
        humidity: forecastDay.day.avghumidity,
        windSpeed: Math.round(forecastDay.day.maxwind_mph),
        rainProbability: forecastDay.day.daily_chance_of_rain || 0,
        forecastTime: gameDate.toLocaleString(),
      };
    }

    return {
      temperature: Math.round(hourlyForecast.temp_f),
      condition: hourlyForecast.condition.text,
      icon: hourlyForecast.condition.icon,
      humidity: hourlyForecast.humidity,
      windSpeed: Math.round(hourlyForecast.wind_mph),
      rainProbability: hourlyForecast.chance_of_rain || 0,
      forecastTime: new Date(hourlyForecast.time).toLocaleString(),
    };
  } catch (error) {
    console.error("Failed to fetch game weather:", error);
    return null;
  }
}

