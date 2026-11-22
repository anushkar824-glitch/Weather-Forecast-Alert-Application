from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from io import StringIO
import csv

from weather import get_weather
from alerts import generate_alerts
from database import (
    initialize_database,
    save_weather_history,
    get_weather_history,
    get_saved_locations,
    save_location
)

app = FastAPI(
    title="Weather Forecast & Alert API",
    description="Live weather, forecasts and weather alerts.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

initialize_database()


class LocationRequest(BaseModel):
    city: str


@app.get("/")
def home():
    return {"message": "Weather Forecast & Alert API is running."}


@app.get("/api/health")
def health():
    return {"status": "healthy"}


@app.get("/api/weather")
async def weather(city: str = "Chennai"):
    try:
        data = await get_weather(city)
        current = data.get("current", {})

        save_weather_history(data["location"]["name"], current)

        data["alerts"] = generate_alerts(data)
        return data

    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"Weather service error: {error}")


@app.get("/api/locations")
def locations():
    return {"locations": get_saved_locations()}


@app.post("/api/locations")
def add_location(request: LocationRequest):
    city = request.city.strip()

    if not city:
        raise HTTPException(status_code=400, detail="Enter a city name.")

    save_location(city)
    return {"message": f"{city} saved successfully."}


@app.get("/api/history")
def history(city: str = "Chennai"):
    return {"history": get_weather_history(city)}


@app.get("/api/report")
def download_report(city: str = "Chennai"):
    records = get_weather_history(city)

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Temperature (°C)", "Humidity (%)", "Wind Speed (km/h)", "Recorded At"])

    for record in records:
        writer.writerow([
            record["temperature"],
            record["humidity"],
            record["wind_speed"],
            record["recorded_at"]
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{city}_weather_report.csv"'
        }
    )