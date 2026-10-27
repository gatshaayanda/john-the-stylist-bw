import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 1800;

const GABORONE = { latitude: "-24.6282", longitude: "25.9231" };

export async function GET() {
  try {
    // Open-Meteo's standard endpoint is free for non-commercial use.
    // Before JTS is used commercially, switch this route to the licensed
    // customer API and a server-only API key (see AGENTS.md).
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", GABORONE.latitude);
    url.searchParams.set("longitude", GABORONE.longitude);
    url.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m");
    url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max");
    url.searchParams.set("forecast_days", "7");
    url.searchParams.set("timezone", "Africa/Gaborone");
    const response = await fetch(url, { next: { revalidate: 1800 } });
    if (!response.ok) {
      return NextResponse.json({ error: "The weather provider could not return a forecast." }, { status: 502 });
    }
    const data = await response.json();
    if (!data.current || typeof data.current.temperature_2m !== "number" || !data.daily || !Array.isArray(data.daily.time)) {
      return NextResponse.json({ error: "The weather provider returned incomplete conditions." }, { status: 502 });
    }
    return NextResponse.json({
      current: data.current,
      daily: data.daily,
      timezone: data.timezone || "Africa/Gaborone",
      attribution: "Weather data by Open-Meteo (CC BY 4.0)",
    }, { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } });
  } catch {
    return NextResponse.json({ error: "Gaborone weather is temporarily unavailable." }, { status: 502 });
  }
}
