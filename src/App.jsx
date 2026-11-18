import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  describeWeather,
  getWeather,
  validateCoordinates,
  windDirection,
} from "./api/weather.js";
import WeatherIcon from "./WeatherIcon.jsx";

export default function App() {
  const [mode, setMode] = useState("city");
  const [city, setCity] = useState("Kyiv");
  const [latitude, setLatitude] = useState("50.4501");
  const [longitude, setLongitude] = useState("30.5234");
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState({
    mode: "coordinates",
    latitude: 50.4501,
    longitude: 30.5234,
    label: "Kyiv",
  });

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["weather", search],
    queryFn: ({ signal }) => getWeather(search, signal),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  function submit(event) {
    event.preventDefault();
    setFormError("");
    if (mode === "city") {
      if (city.trim().length < 2) {
        setFormError("Enter at least two characters for a city name.");
        return;
      }
      setSearch({ mode: "city", city: city.trim() });
      return;
    }

    try {
      const coordinates = validateCoordinates(latitude, longitude);
      setSearch({ mode: "coordinates", ...coordinates });
    } catch (validationError) {
      setFormError(validationError.message);
    }
  }

  return (
    <div className="app">
      <header>
        <a href="./" className="brand">
          <span aria-hidden="true">◒</span> weather
        </a>
        <span className="header-label">A MOMENT OUTSIDE</span>
      </header>
      <main>
        <section className="intro">
          <p className="eyebrow">YOUR DAILY WEATHER CHECK</p>
          <h1>
            What's the sky
            <br />
            up to today?
          </h1>
          <p>Current conditions, wherever you are curious about.</p>
        </section>
        <div className="dashboard">
          <section className="search-panel" aria-labelledby="search-title">
            <p className="eyebrow">FIND A PLACE</p>
            <h2 id="search-title">Explore the weather.</h2>
            <div className="switch" role="group" aria-label="Search method">
              <button
                type="button"
                aria-pressed={mode === "city"}
                onClick={() => {
                  setMode("city");
                  setFormError("");
                }}
              >
                City name
              </button>
              <button
                type="button"
                aria-pressed={mode === "coordinates"}
                onClick={() => {
                  setMode("coordinates");
                  setFormError("");
                }}
              >
                Coordinates
              </button>
            </div>
            <form onSubmit={submit}>
              {mode === "city" ? (
                <div className="field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="Try Kyiv, London or Berlin"
                    minLength="2"
                    maxLength="100"
                    required
                  />
                  <span className="hint">
                    We find the city, then check its weather.
                  </span>
                </div>
              ) : (
                <>
                  <div className="field">
                    <label htmlFor="latitude">Latitude</label>
                    <input
                      id="latitude"
                      type="number"
                      step="any"
                      min="-90"
                      max="90"
                      value={latitude}
                      onChange={(event) => setLatitude(event.target.value)}
                      required
                    />
                    <span className="hint">From -90 to 90</span>
                  </div>
                  <div className="field">
                    <label htmlFor="longitude">Longitude</label>
                    <input
                      id="longitude"
                      type="number"
                      step="any"
                      min="-180"
                      max="180"
                      value={longitude}
                      onChange={(event) => setLongitude(event.target.value)}
                      required
                    />
                    <span className="hint">From -180 to 180</span>
                  </div>
                </>
              )}
              {formError && (
                <p className="error-text" role="alert">
                  {formError}
                </p>
              )}
              <button className="search-button" type="submit">
                Check weather <span aria-hidden="true">↗</span>
              </button>
            </form>
            <p className="search-note">
              No account. No API key.
              <br />
              Just a little perspective on the day.
            </p>
          </section>
          <section
            className="weather-panel"
            aria-live="polite"
            aria-busy={isFetching}
          >
            {isPending ? (
              <div className="status">
                <span className="loader" aria-hidden="true" />
                <h2>Looking at the sky...</h2>
                <p>Fetching the latest conditions.</p>
              </div>
            ) : isError ? (
              <div className="status error-status" role="alert">
                <p className="eyebrow">COULD NOT LOAD WEATHER</p>
                <h2>Let's try that again.</h2>
                <p>{error.message}</p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => refetch()}
                >
                  Try again
                </button>
              </div>
            ) : (
              <>
                <div className="location">
                  <div>
                    <p className="eyebrow">CURRENT WEATHER</p>
                    <h2>{data.location.label}</h2>
                    <p>{data.location.country}</p>
                  </div>
                  <button
                    className="refresh"
                    type="button"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    aria-label="Refresh weather"
                  >
                    {isFetching ? "..." : "↻"}
                  </button>
                </div>
                <div className="conditions">
                  <div>
                    <p className="temperature">
                      {Math.round(data.current.temperature)}
                      <span>°</span>
                    </p>
                    <p className="condition-label">
                      {describeWeather(data.current.weathercode)}
                    </p>
                  </div>
                  <WeatherIcon
                    code={data.current.weathercode}
                    isDay={data.current.is_day === 1}
                  />
                </div>
                <div className="weather-stats">
                  <div>
                    <span className="stat-label">WIND SPEED</span>
                    <strong>
                      {data.current.windspeed}
                      <small> {data.units.windspeed || "km/h"}</small>
                    </strong>
                  </div>
                  <div>
                    <span className="stat-label">WIND DIRECTION</span>
                    <strong>
                      {windDirection(data.current.winddirection)}
                      <small> {data.current.winddirection}°</small>
                    </strong>
                  </div>
                  <div>
                    <span className="stat-label">TIME OF DAY</span>
                    <strong>
                      {data.current.is_day === 1 ? "Daylight" : "Night"}
                    </strong>
                  </div>
                </div>
                <div className="location-meta">
                  <span>
                    {data.location.latitude.toFixed(4)}°,{" "}
                    {data.location.longitude.toFixed(4)}°
                  </span>
                  <span>
                    Updated {data.current.time.replace("T", " · ")}
                    <br />
                    {data.timezone}
                  </span>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
      <footer>
        <span>Small forecast. Big world.</span>
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Weather data by Open-Meteo ↗
        </a>
      </footer>
    </div>
  );
}
