export default function WeatherIcon({ code, isDay }) {
  const rainy = [
    51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99,
  ].includes(code);
  const snowy = [71, 73, 75, 77, 85, 86].includes(code);
  const cloudy = code >= 2;

  return (
    <svg viewBox="0 0 180 150" className="weather-icon" aria-hidden="true">
      {isDay ? (
        <>
          <g stroke="#f0bd4b" strokeWidth="5" strokeLinecap="round">
            <path d="M85 12v10m0 81v10M35 62H25m120 0h-10M43 20l8 8m68 68 8 8M43 104l8-8m68-68 8-8" />
          </g>
          <circle cx="85" cy="62" r="29" fill="#f4ca66" />
        </>
      ) : (
        <path d="M104 27a40 40 0 1 0 28 62 37 37 0 0 1-28-62" fill="#bec8ec" />
      )}
      {cloudy && (
        <path
          d="M48 107a24 24 0 0 1 2-48 34 34 0 0 1 64-9 27 27 0 0 1 23 57Z"
          fill="#fff"
          stroke="#d5e2eb"
          strokeWidth="2"
        />
      )}
      {rainy && (
        <path
          d="m65 119-6 12m30-12-6 12m30-12-6 12"
          stroke="#7199c6"
          strokeWidth="4"
          strokeLinecap="round"
        />
      )}
      {snowy && (
        <g fill="#8aabc8">
          <circle cx="62" cy="124" r="3" />
          <circle cx="87" cy="134" r="3" />
          <circle cx="111" cy="124" r="3" />
        </g>
      )}
      {[45, 48].includes(code) && (
        <path
          d="M40 120h100m-90 13h80"
          stroke="#a7bac8"
          strokeWidth="4"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
