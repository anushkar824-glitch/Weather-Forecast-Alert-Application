
"use client";

import { useEffect, useState } from "react";
import {
  Cloud, CloudRain, Sun, Wind, Droplets, Thermometer,
  Gauge, MapPin, Search, RefreshCw, Download,
  AlertTriangle, Eye, Sunrise, Sunset, CloudSun,
  Activity, CalendarDays, ShieldCheck
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar
} from "recharts";

const API = "http://127.0.0.1:8000";

type WeatherData = {
  location: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  current: Record<string, any>;
  hourly: Record<string, any>;
  daily: Record<string, any>;
  alerts: {
    title: string;
    message: string;
    severity: string;
    icon: string;
  }[];
};

function weatherIcon(code: number) {
  if (code === 0) return <Sun size={28} />;
  if (code <= 3) return <CloudSun size={28} />;
  if (code <= 48) return <Cloud size={28} />;
  if (code <= 67) return <CloudRain size={28} />;
  if (code <= 82) return <CloudRain size={28} />;
  return <Cloud size={28} />;
}

function weatherDescription(code: number) {
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snowfall",
    80: "Rain showers",
    81: "Moderate showers",
    82: "Heavy showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Heavy thunderstorm"
  };
  return descriptions[code] || "Weather conditions";
}

function formatHour(time: string) {
  return new Date(time).toLocaleTimeString("en-IN", {
    hour: "numeric",
    hour12: true
  });
}

function formatDay(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("en-IN", {
    weekday: "short"
  });
}

export default function Home() {
  const [city, setCity] = useState("Chennai");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [savedLocations, setSavedLocations] = useState<string[]>([]);
  const [simulation, setSimulation] = useState(false);

  async function loadWeather(selectedCity = city, demo = simulation) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/api/weather?city=${encodeURIComponent(selectedCity)}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.detail || "Unable to load weather.");
      }

      const result = await response.json();
      setData(result);
      setCity(result.location.name);
      setLastUpdated(new Date().toLocaleTimeString("en-IN"));
    } catch (err: any) {
      setError(err.message || "Could not connect to the weather server.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadLocations() {
    try {
      const response = await fetch(`${API}/api/locations`);
      if (response.ok) {
        const result = await response.json();
        setSavedLocations(result.locations || []);
      }
    } catch {
      // Locations will load when the backend is available.
    }
  }

  async function addLocation() {
    const value = search.trim();
    if (!value) return;

    try {
      const response = await fetch(`${API}/api/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: value })
      });

      if (!response.ok) throw new Error("Could not save this location.");

      setSearch("");
      await loadLocations();
      await loadWeather(value);
    } catch (err: any) {
      setError(err.message);
    }
  }

  function downloadReport() {
    window.open(
      `${API}/api/report?city=${encodeURIComponent(city)}`,
      "_blank"
    );
  }

  useEffect(() => {
    loadWeather("Chennai");
    loadLocations();
    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = data?.current;
  const daily = data?.daily;
  const hourly = data?.hourly;

  const hourlyData = hourly?.time
    ?.slice(0, 24)
    .filter((_: string, index: number) => index % 3 === 0)
    .map((time: string) => {
      const index = hourly.time.indexOf(time);
      return {
        time: formatHour(time),
        temperature: hourly.temperature_2m[index],
        rain: hourly.precipitation_probability[index] ?? 0
      };
    }) || [];

  const dailyData = daily?.time?.map((date: string, index: number) => ({
    day: formatDay(date),
    max: daily.temperature_2m_max[index],
    min: daily.temperature_2m_min[index],
    rain: daily.precipitation_sum[index]
  })) || [];

  const mapUrl = data
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${data.location.longitude - 0.12}%2C${data.location.latitude - 0.08}%2C${data.location.longitude + 0.12}%2C${data.location.latitude + 0.08}&layer=mapnik&marker=${data.location.latitude}%2C${data.location.longitude}`
    : "";

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="mx-auto max-w-[1500px] px-5 py-7 md:px-9">

        {/* HEADER */}
        <header className="mb-9 flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-500/15 p-3 text-blue-400">
              <CloudSun size={30} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                SkyPulse
              </h1>
              <p className="text-xs text-slate-400">
                Weather Intelligence Dashboard
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#111f31] px-3 py-2">
              <MapPin size={16} className="text-blue-400" />
              <span className="text-sm">{city}, India</span>
            </div>

            <button
              onClick={() => loadWeather(city)}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </header>

        {/* SEARCH */}
        <section className="mb-7 flex flex-wrap gap-3">
          <div className="flex min-w-[240px] flex-1 items-center gap-3 rounded-xl border border-white/10 bg-[#111f31] px-4">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addLocation();
              }}
              placeholder="Search any city..."
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-500"
            />
          </div>

          <button
            onClick={addLocation}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
          >
            Search & Save
          </button>

          <button
            onClick={downloadReport}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#111f31] px-4 py-3 text-sm hover:bg-[#1a2b40]"
          >
            <Download size={16} />
            Export CSV
          </button>
        </section>

        {/* SAVED LOCATIONS */}
        {savedLocations.length > 0 && (
          <div className="mb-7 flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs text-slate-500">SAVED LOCATIONS</span>
            {savedLocations.map((location) => (
              <button
                key={location}
                onClick={() => loadWeather(location)}
                className={`rounded-full border px-4 py-1.5 text-xs ${
                  city.toLowerCase() === location.toLowerCase()
                    ? "border-blue-500 bg-blue-500/20 text-blue-300"
                    : "border-white/10 bg-[#111f31] text-slate-300 hover:border-blue-400"
                }`}
              >
                {location}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
            <p className="mt-1 text-xs text-red-200/70">
              Make sure the backend server is running.
            </p>
          </div>
        )}

        {loading && !data && (
          <div className="rounded-2xl border border-white/10 bg-[#111f31] p-16 text-center">
            <RefreshCw className="mx-auto mb-4 animate-spin text-blue-400" size={32} />
            <p className="text-slate-300">Loading weather information...</p>
          </div>
        )}

        {data && current && (
          <>
            {/* MAIN WEATHER */}
            <section className="mb-7 grid gap-5 lg:grid-cols-[1.5fr_1fr]">

              <div className="relative overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-[#153c69] via-[#102b4b] to-[#111d32] p-7 md:p-9">
                <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

                <div className="relative flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <p className="mb-2 text-sm text-blue-200">
                      CURRENT WEATHER
                    </p>
                    <h2 className="text-3xl font-bold">
                      {data.location.name}
                    </h2>
                    <p className="mt-1 text-sm text-blue-200/70">
                      {data.location.country} · {data.location.timezone}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4 text-yellow-300">
                    {weatherIcon(current.weather_code)}
                  </div>
                </div>

                <div className="relative mt-8 flex flex-wrap items-end gap-6">
                  <div>
                    <div className="text-7xl font-light tracking-tighter">
                      {Math.round(current.temperature_2m)}°
                    </div>
                    <p className="mt-2 text-lg text-blue-100">
                      {weatherDescription(current.weather_code)}
                    </p>
                  </div>
                  <div className="mb-2 space-y-1 text-sm text-blue-100/80">
                    <p>
                      Feels like {current.apparent_temperature}°C
                    </p>
                    <p>
                      H: {Math.round(daily.temperature_2m_max[0])}° ·
                      L: {Math.round(daily.temperature_2m_min[0])}°
                    </p>
                  </div>
                </div>

                <div className="relative mt-8 border-t border-white/10 pt-4 text-xs text-blue-100/60">
                  Last updated: {lastUpdated}
                </div>
              </div>

              {/* WEATHER METRICS */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: "Humidity",
                    value: `${current.relative_humidity_2m}%`,
                    icon: <Droplets />,
                    color: "text-cyan-400"
                  },
                  {
                    label: "Wind Speed",
                    value: `${current.wind_speed_10m} km/h`,
                    icon: <Wind />,
                    color: "text-blue-400"
                  },
                  {
                    label: "UV Index",
                    value: current.uv_index,
                    icon: <Sun />,
                    color: "text-yellow-400"
                  },
                  {
                    label: "Pressure",
                    value: `${current.pressure_msl} hPa`,
                    icon: <Gauge />,
                    color: "text-purple-400"
                  },
                  {
                    label: "Cloud Cover",
                    value: `${current.cloud_cover}%`,
                    icon: <Cloud />,
                    color: "text-slate-300"
                  },
                  {
                    label: "Rainfall",
                    value: `${current.precipitation} mm`,
                    icon: <CloudRain />,
                    color: "text-cyan-300"
                  }
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-white/10 bg-[#111f31] p-4"
                  >
                    <div className={`mb-3 ${metric.color}`}>
                      {metric.icon}
                    </div>
                    <p className="text-xl font-semibold">{metric.value}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* ALERTS */}
            <section className="mb-7 rounded-2xl border border-white/10 bg-[#111f31] p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-orange-500/15 p-2 text-orange-400">
                    <ShieldCheck size={21} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Weather Alerts</h3>
                    <p className="text-xs text-slate-400">
                      Automated weather risk monitoring
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-300">
                  {data.alerts.length} alerts
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {data.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`rounded-xl border p-4 ${
                      alert.severity === "critical"
                        ? "border-red-500/30 bg-red-500/10"
                        : alert.severity === "warning"
                        ? "border-orange-500/30 bg-orange-500/10"
                        : "border-emerald-500/20 bg-emerald-500/10"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <AlertTriangle size={17} />
                      <span className="text-sm font-semibold">
                        {alert.title}
                      </span>
                      <span className="ml-auto text-[10px] uppercase tracking-wider opacity-70">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs leading-5 text-slate-300">
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* HOURLY CHART */}
            <section className="mb-7 grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#111f31] p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-xl bg-blue-500/15 p-2 text-blue-400">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Hourly Temperature</h3>
                    <p className="text-xs text-slate-400">
                      Temperature trend for the next 24 hours
                    </p>
                  </div>
                </div>

                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlyData}>
                      <defs>
                        <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#26364b" strokeDasharray="4 4" />
                      <XAxis dataKey="time" stroke="#8292a8" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#8292a8" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#13243a", border: "1px solid #334155", borderRadius: 10 }} />
                      <Area type="monotone" dataKey="temperature" stroke="#38bdf8" strokeWidth={3} fill="url(#tempGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* RAIN CHART */}
              <div className="rounded-2xl border border-white/10 bg-[#111f31] p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-500/15 p-2 text-cyan-400">
                    <CloudRain size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Rain Probability</h3>
                    <p className="text-xs text-slate-400">
                      Chance of precipitation by hour
                    </p>
                  </div>
                </div>

                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData}>
                      <CartesianGrid stroke="#26364b" strokeDasharray="4 4" />
                      <XAxis dataKey="time" stroke="#8292a8" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#8292a8" tick={{ fontSize: 11 }} unit="%" />
                      <Tooltip contentStyle={{ background: "#13243a", border: "1px solid #334155", borderRadius: 10 }} />
                      <Bar dataKey="rain" fill="#22d3ee" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* 7 DAY FORECAST */}
            <section className="mb-7 rounded-2xl border border-white/10 bg-[#111f31] p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-purple-500/15 p-2 text-purple-400">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">7-Day Forecast</h3>
                  <p className="text-xs text-slate-400">
                    Upcoming weather outlook
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {dailyData.map((day: any, index: number) => (
                  <div
                    key={index}
                    className="rounded-xl border border-white/5 bg-[#17283d] p-4 text-center"
                  >
                    <p className="text-sm font-semibold">{day.day}</p>
                    <div className="my-4 flex justify-center text-blue-300">
                      {weatherIcon(daily.weather_code[index])}
                    </div>
                    <p className="text-sm font-semibold">
                      {Math.round(day.max)}°
                      <span className="ml-2 text-slate-400">
                        {Math.round(day.min)}°
                      </span>
                    </p>
                    <p className="mt-2 text-xs text-cyan-300">
                      {day.rain} mm rain
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* SUNRISE AND SUNSET */}
            <section className="mb-7 grid gap-5 sm:grid-cols-2">
              <div className="flex items-center gap-5 rounded-2xl border border-white/10 bg-[#111f31] p-6">
                <div className="rounded-2xl bg-orange-500/15 p-4 text-orange-400">
                  <Sunrise size={28} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">SUNRISE</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {new Date(daily.sunrise[0]).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 rounded-2xl border border-white/10 bg-[#111f31] p-6">
                <div className="rounded-2xl bg-purple-500/15 p-4 text-purple-400">
                  <Sunset size={28} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">SUNSET</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {new Date(daily.sunset[0]).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            </section>

            {/* MAP */}
            <section className="mb-7 overflow-hidden rounded-2xl border border-white/10 bg-[#111f31]">
              <div className="p-6">
                <div className="mb-2 flex items-center gap-3">
                  <MapPin className="text-blue-400" />
                  <h3 className="font-semibold">Location Map</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Geographic position of {data.location.name}
                </p>
              </div>
              <iframe
                title="Weather location map"
                src={mapUrl}
                className="h-[320px] w-full border-0"
                loading="lazy"
              />
            </section>

            {/* FOOTER */}
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-slate-500">
              <p>SkyPulse · Weather Forecast & Alert Application</p>
              <p>Weather data powered by Open-Meteo</p>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
