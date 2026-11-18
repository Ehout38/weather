export function validateCoordinates(latitude, longitude) {
  if (
    String(latitude).trim() === "" ||
    String(longitude).trim() === "" ||
    !Number.isFinite(Number(latitude)) ||
    !Number.isFinite(Number(longitude)) ||
    Number(latitude) < -90 ||
    Number(latitude) > 90 ||
    Number(longitude) < -180 ||
    Number(longitude) > 180
  ) {
    throw new Error(
      "Latitude must be from -90 to 90 and longitude from -180 to 180.",
    );
  }

  return { latitude: Number(latitude), longitude: Number(longitude) };
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(
      `The weather service is unavailable (${response.status}). Try again.`,
    );
  }
  const data = await response.json();
  if (data.error)
    throw new Error(
      data.reason || "The service could not complete this request.",
    );
  return data;
}

export async function getWeather(search, signal) {
  let location;
  if (search.mode === "city") {
    const params = new URLSearchParams({
      name: search.city.trim(),
      count: "1",
      language: "en",
      format: "json",
    });
    const result = await fetchJson(
      `https://geocoding-api.open-meteo.com/v1/search?${params}`,
      signal,
    );
    const city = result.results?.[0];
    if (!city)
      throw new Error("City not found. Check the spelling or use coordinates.");
    location = {
      ...validateCoordinates(city.latitude, city.longitude),
      label: city.name,
      country: [city.admin1, city.country].filter(Boolean).join(", "),
    };
  } else {
    location = {
      ...validateCoordinates(search.latitude, search.longitude),
      label: search.label || "Selected coordinates",
      country: search.label ? "Ukraine" : "Custom location",
    };
  }

  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current_weather: "true",
    timezone: "auto",
  });
  const data = await fetchJson(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    signal,
  );
  const current = data.current_weather;
  if (
    !current ||
    !Number.isFinite(current.temperature) ||
    !Number.isFinite(current.windspeed) ||
    !Number.isFinite(current.winddirection) ||
    !Number.isFinite(current.weathercode) ||
    typeof current.time !== "string"
  ) {
    throw new Error("The service returned incomplete weather data. Try again.");
  }

  return {
    location,
    current,
    timezone: data.timezone || "Local time",
    units: data.current_weather_units || {
      temperature: "°C",
      windspeed: "km/h",
    },
  };
}

export function describeWeather(code) {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55].includes(code)) return "Drizzle";
  if ([56, 57].includes(code)) return "Freezing drizzle";
  if ([61, 63, 65].includes(code)) return "Rain";
  if ([66, 67].includes(code)) return "Freezing rain";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain showers";
  if ([85, 86].includes(code)) return "Snow showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Unknown conditions";
}

export function windDirection(degrees) {
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
    Math.round(degrees / 45) % 8
  ];
}
