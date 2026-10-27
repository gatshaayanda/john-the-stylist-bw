"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { track } from "@vercel/analytics";

type Current = { temperature_2m: number; apparent_temperature: number; relative_humidity_2m: number; wind_speed_10m: number; weather_code: number; time: string };
type Daily = { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[]; uv_index_max: number[] };
type Forecast = { current: Current; daily: Daily; attribution: string };

function condition(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Some cloud, mostly clear";
  if (code === 45 || code === 48) return "Misty";
  if (code >= 95) return "Thunderstorms possible";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain possible";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Cold conditions";
  return "Cloudy";
}
function symbol(code: number): string {
  if (code === 0) return "☀";
  if (code <= 3) return "◐";
  if (code === 45 || code === 48) return "≋";
  if (code >= 95) return "ϟ";
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return "☂";
  return "☁";
}
function localToday() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Gaborone", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (key: string) => parts.find(part => part.type === key)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function dayName(value: string) {
  return new Date(value + "T12:00:00+02:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Africa/Gaborone" });
}

export default function JtsWeather() {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const response = await fetch("/api/weather", { cache: "no-store" });
      if (!response.ok) throw new Error("Forecast unavailable");
      const data = await response.json() as Forecast;
      if (!data.current || !data.daily?.time?.length) throw new Error("Forecast incomplete");
      setForecast(data);
    } catch {
      setForecast(null); setError(true);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const days = forecast?.daily.time.map((date, index) => ({
    date,
    code: forecast.daily.weather_code[index],
    high: forecast.daily.temperature_2m_max[index],
    low: forecast.daily.temperature_2m_min[index],
    rain: forecast.daily.precipitation_probability_max[index],
    uv: forecast.daily.uv_index_max[index],
  })).filter(day => day.date > localToday()).slice(0, 5) || [];
  const brighter = days.filter(day => day.code <= 3 && day.rain <= 20).slice(0, 2);

  return <section className="jtsWeatherCard" aria-labelledby="jts-weather-title">
    <div className="jtsWeatherHeader"><div><span className="jtsEyebrow">GABORONE · THE WEEK AHEAD</span><h2 id="jts-weather-title">A little forecast for your next look.</h2><p>Plan a salon visit around the days that suit you. Weather is a guide, not a booking guarantee.</p></div><span className="jtsWeatherMark" aria-hidden="true">☀</span></div>
    {loading ? <p className="jtsWeatherStatus" role="status">Checking the Gaborone forecast…</p> : error || !forecast ? <div className="jtsWeatherStatus" role="status"><p>The forecast is unavailable right now. You can still choose a date and request an appointment.</p><button type="button" className="jtsWeatherRetry" onClick={() => void load()}>Try again</button></div> : <>
      <div className="jtsWeatherCurrent"><strong>{Math.round(forecast.current.temperature_2m)}°C</strong><span>{condition(forecast.current.weather_code)}</span><small>Feels like {Math.round(forecast.current.apparent_temperature)}°C · Humidity {Math.round(forecast.current.relative_humidity_2m)}% · Wind {Math.round(forecast.current.wind_speed_10m)} km/h</small></div>
      <div className="jtsWeatherDays">{days.map(day => <article key={day.date} className={day.code <= 3 && day.rain <= 20 ? "jtsWeatherDay jtsWeatherDayBright" : "jtsWeatherDay"}><span>{dayName(day.date)}</span><strong aria-hidden="true">{symbol(day.code)}</strong><b>{Math.round(day.high)}° <small>/ {Math.round(day.low)}°</small></b><small>{condition(day.code)}</small><small>{day.rain}% rain chance</small>{day.uv >= 6 && <small>UV {Math.round(day.uv)} · sun protection</small>}<Link className="jtsWeatherDayLink" href={"/order?date="+day.date} onClick={() => track("jts_weather_day_selected", { outlook: day.code <= 3 && day.rain <= 20 ? "clearer" : "mixed", rain_band: day.rain <= 20 ? "low" : day.rain <= 50 ? "medium" : "high" })}>Request this day ↗</Link></article>)}</div>
      <div className="jtsWeatherSuggestion">{brighter.length ? <p><strong>{brighter.length === 1 ? "A brighter outlook:" : "A couple of clearer outlooks:"}</strong> {brighter.map(day => dayName(day.date)).join(" and ")} {brighter.length === 1 ? "looks" : "look"} relatively clear in the forecast. If one fits your plans, you can request it below.</p> : <p><strong>Your schedule comes first.</strong> Forecasts can change, so choose the date that works for you and check back closer to the day.</p>}<Link href="/order" className="jtsButton jtsButtonGold" onClick={() => track("jts_weather_booking_clicked", { source: "account_forecast" })}>Find a day for my next look ↗</Link></div>
      <small className="jtsWeatherAttribution">Weather data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> (CC BY 4.0) · Updated {forecast.current.time?.slice(11, 16) || "recently"} Gaborone time.</small>
    </>}
    <p className="jtsWeatherTruth">Forecasts do not show salon availability. Appointment requests must be at least one day ahead, and John confirms the slot and deposit separately.</p>
  </section>;
}
