import assert from "node:assert/strict";
import { test } from "node:test";
import {
  describeWeather,
  getWeather,
  validateCoordinates,
  windDirection,
} from "./weather.js";

const forecast = {
  current_weather: {
    temperature: 11.5,
    windspeed: 7.2,
    winddirection: 225,
    weathercode: 2,
    is_day: 1,
    time: "2026-11-17T12:00",
  },
  timezone: "Europe/Kyiv",
  current_weather_units: { temperature: "°C", windspeed: "km/h" },
};

test("coordinates accept zero and boundary values", () => {
  assert.deepEqual(validateCoordinates("0", "0"), {
    latitude: 0,
    longitude: 0,
  });
  assert.deepEqual(validateCoordinates("-90", "180"), {
    latitude: -90,
    longitude: 180,
  });
});

test("coordinates reject blanks, non-numeric values and values outside the ranges", () => {
  for (const [latitude, longitude] of [
    ["", 10],
    [10, " "],
    ["abc", 10],
    [91, 10],
    [0, -181],
    [Infinity, 0],
  ]) {
    assert.throws(() => validateCoordinates(latitude, longitude));
  }
});

test("coordinate search requests current weather and forwards the abort signal", async (context) => {
  const signal = new AbortController().signal;
  context.mock.method(globalThis, "fetch", async (url, options) => {
    const request = new URL(url);
    assert.equal(request.hostname, "api.open-meteo.com");
    assert.equal(request.searchParams.get("current_weather"), "true");
    assert.equal(request.searchParams.get("latitude"), "0");
    assert.equal(request.searchParams.get("longitude"), "0");
    assert.equal(options.signal, signal);
    return { ok: true, json: async () => forecast };
  });
  const data = await getWeather(
    { mode: "coordinates", latitude: 0, longitude: 0 },
    signal,
  );
  assert.equal(data.current.temperature, 11.5);
  assert.equal(data.location.label, "Selected coordinates");
});

test("city search resolves the city before requesting its weather", async (context) => {
  const urls = [];
  context.mock.method(globalThis, "fetch", async (url) => {
    urls.push(new URL(url));
    const data =
      urls.length === 1
        ? {
            results: [
              {
                name: "Paris",
                country: "France",
                latitude: 48.85,
                longitude: 2.35,
              },
            ],
          }
        : forecast;
    return { ok: true, json: async () => data };
  });
  const data = await getWeather({ mode: "city", city: " Paris " });
  assert.equal(urls[0].searchParams.get("name"), "Paris");
  assert.equal(urls[1].searchParams.get("latitude"), "48.85");
  assert.equal(urls[1].searchParams.get("longitude"), "2.35");
  assert.equal(data.location.label, "Paris");
  assert.equal(data.location.country, "France");
});

test("an unknown city reports an error and does not request a forecast", async (context) => {
  let calls = 0;
  context.mock.method(globalThis, "fetch", async () => {
    calls++;
    return { ok: true, json: async () => ({}) };
  });
  await assert.rejects(
    getWeather({ mode: "city", city: "Unknown city" }),
    /City not found/,
  );
  assert.equal(calls, 1);
});

test("an HTTP error is reported to the user", async (context) => {
  context.mock.method(globalThis, "fetch", async () => ({
    ok: false,
    status: 503,
  }));
  await assert.rejects(
    getWeather({ mode: "coordinates", latitude: 50, longitude: 30 }),
    /503/,
  );
});

test("incomplete API data is rejected", async (context) => {
  context.mock.method(globalThis, "fetch", async () => ({
    ok: true,
    json: async () => ({ current_weather: { temperature: 10 } }),
  }));
  await assert.rejects(
    getWeather({ mode: "coordinates", latitude: 50, longitude: 30 }),
    /incomplete weather data/,
  );
});

test("weather codes and wind directions are translated correctly", () => {
  assert.equal(describeWeather(0), "Clear sky");
  assert.equal(describeWeather(95), "Thunderstorm");
  assert.equal(describeWeather(73), "Snow");
  assert.equal(describeWeather(999), "Unknown conditions");
  assert.equal(windDirection(225), "SW");
  assert.equal(windDirection(360), "N");
});
