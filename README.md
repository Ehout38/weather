# Weather

React weather application for project assignment 30. Requests are loaded and cached with `useQuery` from TanStack Query.

- Current weather for Kyiv on first load.
- Search by city using the Open-Meteo geocoding API.
- Search by latitude and longitude with range validation.
- Temperature, weather description, wind speed and direction, day/night and local update time.
- Loading, error, retry and refresh states.
- Custom responsive CSS and weather icons.
- No API key required.

## Run

Install Node.js 22.12 or newer, then:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite.

```sh
npm test
npm run build
npm run preview
```

Weather requests use `https://api.open-meteo.com/v1/forecast` with `current_weather=true`. City searches use `https://geocoding-api.open-meteo.com/v1/search`. An internet connection is required for live weather.

Data: [Open-Meteo](https://open-meteo.com/), [weather API](https://open-meteo.com/en/docs), [geocoding API](https://open-meteo.com/en/docs/geocoding-api).
