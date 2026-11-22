# SkyPulse – Weather Forecast & Alert Application

A full-stack weather dashboard that displays live weather conditions, forecasts, weather alerts, charts, saved cities, and downloadable CSV reports. Chennai, Tamil Nadu is the default location.

## Features

- Live weather data powered by the [Open-Meteo API](https://open-meteo.com/) (no API key required)
- Search for cities and save locations
- Current weather conditions and atmospheric details
- 24-hour temperature and precipitation probability charts
- 7-day weather forecast
- Rule-based weather alerts
- Interactive location map
- Sunrise and sunset information
- Weather history stored in SQLite
- CSV weather report export
- FastAPI backend with interactive API documentation
- Next.js dashboard with responsive charts

## Tech Stack

**Frontend:** Next.js, React, TypeScript, Tailwind CSS, Recharts, Lucide React  
**Backend:** Python, FastAPI, HTTPX  
**Data:** Open-Meteo Geocoding and Forecast APIs, SQLite, CSV

## Project Structure

```
Weather-Forecast-Alert-Application/
├── backend/
│   ├── main.py
│   ├── weather.py
│   ├── alerts.py
│   ├── database.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   └── app/
│   ├── package.json
│   └── ...
├── data/
├── reports/
├── screenshots/
├── .gitignore
└── README.md
```

## Run Locally

### 1. Backend

From the project root, create and activate a Python virtual environment if desired, then install dependencies:

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

The API runs at http://127.0.0.1:8000. Interactive API documentation is available at http://127.0.0.1:8000/docs.

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

Keep both terminals running while using the application.

## Data Source

Weather and geocoding data are retrieved from Open-Meteo. Availability of individual weather measurements depends on the selected location and the upstream API response.

## Notes

- The SQLite database is created locally when the backend runs; database files are excluded from version control.
- Do not commit virtual environments, `node_modules`, build output, or secret environment files.
- Weather alerts are generated from configurable threshold rules and are intended for informational use.

## Future Improvements

- Scheduled background weather refresh
- Email or Telegram notifications
- More configurable alert thresholds
- Deployment of the frontend and backend
