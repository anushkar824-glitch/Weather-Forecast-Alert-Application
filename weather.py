import httpx


async def get_weather(city: str):
    async with httpx.AsyncClient(timeout=20) as client:
        # Find the city's coordinates
        geo_url = "https://geocoding-api.open-meteo.com/v1/search"
        geo_response = await client.get(
            geo_url,
            params={"name": city, "count": 1, "language": "en", "format": "json"}
        )
        geo_response.raise_for_status()

        locations = geo_response.json().get("results", [])
        if not locations:
            raise ValueError(f"Location '{city}' was not found.")

        place = locations[0]
        latitude = place["latitude"]
        longitude = place["longitude"]

        # Fetch current weather and forecasts
        weather_url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": (
                "temperature_2m,relative_humidity_2m,apparent_temperature,"
                "precipitation,weather_code,cloud_cover,pressure_msl,"
                "wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index"
            ),
            "hourly": (
                "temperature_2m,relative_humidity_2m,precipitation_probability,"
                "precipitation,wind_speed_10m,uv_index,weather_code"
            ),
            "daily": (
                "weather_code,temperature_2m_max,temperature_2m_min,"
                "sunrise,sunset,uv_index_max,precipitation_sum,"
                "precipitation_probability_max,wind_speed_10m_max"
            ),
            "forecast_days": 7,
            "timezone": "auto"
        }

        response = await client.get(weather_url, params=params)
        response.raise_for_status()

        return {
            "location": {
                "name": place["name"],
                "admin": place.get("admin1", ""),
                "country": place.get("country", ""),
                "latitude": latitude,
                "longitude": longitude,
                "timezone": response.json().get("timezone", "")
            },
            **response.json()
        }