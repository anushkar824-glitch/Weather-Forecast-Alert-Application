def generate_alerts(weather):
    current = weather.get("current", {})
    hourly = weather.get("hourly", {})
    alerts = []

    temperature = current.get("temperature_2m", 0)
    humidity = current.get("relative_humidity_2m", 0)
    wind = current.get("wind_speed_10m", 0)
    uv = current.get("uv_index", 0)

    rain_chances = hourly.get("precipitation_probability", [])
    next_rain_chance = max(rain_chances[:6], default=0)

    def add_alert(title, message, severity):
        alerts.append({
            "title": title,
            "message": message,
            "severity": severity
        })

    if temperature >= 40:
        add_alert("Extreme Heat", "Very high temperature. Avoid prolonged outdoor activity.", "critical")
    elif temperature >= 38:
        add_alert("High Temperature", "Stay hydrated and limit direct sun exposure.", "warning")

    if humidity >= 85:
        add_alert("High Humidity", "Humidity is high. Stay hydrated and take breaks outdoors.", "warning")

    if wind >= 50:
        add_alert("Strong Winds", "Very strong winds expected. Take necessary precautions.", "critical")
    elif wind >= 35:
        add_alert("Wind Advisory", "Wind speeds are elevated. Be careful outdoors.", "warning")

    if uv >= 8:
        add_alert("High UV Index", "Use sunscreen and avoid prolonged exposure to direct sunlight.", "warning")

    if next_rain_chance >= 80:
        add_alert("Heavy Rain Possibility", "High chance of rain in the next few hours. Carry an umbrella.", "warning")
    elif next_rain_chance >= 60:
        add_alert("Rain Expected", "Rain is possible in the next few hours.", "info")

    if not alerts:
        add_alert("All Clear", "No weather alerts at the moment.", "success")

    return alerts