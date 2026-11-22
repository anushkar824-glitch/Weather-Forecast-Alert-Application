# SkyPulse – Weather Forecast & Alert Application

SkyPulse is a weather dashboard for current conditions, hourly weather, a 7-day forecast, weather alerts, saved locations, history, and CSV reports. Default location: Chennai, India.

## Features
- Live weather and forecasts from Open-Meteo
- Search and save locations
- Alerts for temperature, rain probability, humidity, wind, and UV
- Hourly temperature and rain-probability charts
- 7-day forecast and weather details
- Location map
- SQLite weather history and saved locations
- Downloadable CSV reports

## Technology
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Recharts, Lucide React
- **Backend:** Python, FastAPI, SQLite
- **Weather API:** Open-Meteo

## Project Structure
```text
Weather-Forecast-Alert-Application/
├── backend/
│   ├── main.py
│   ├── weather.py
│   ├── alerts.py
│   ├── database.py
│   └── requirements.txt
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── next-env.d.ts
│   ├── eslint.config.mjs
│   └── AGENTS.md
├── .gitignore
└── README.md
```

## Run Locally

### Backend
From the project root:
```bash
cd backend
python -m venv venv
```
Activate the environment on Windows PowerShell:
```powershell
.\venv\Scripts\Activate.ps1
```
Install and run:
```bash
pip install -r requirements.txt
python -m uvicorn main:app --reload
```
API: http://127.0.0.1:8000  
Interactive API docs: http://127.0.0.1:8000/docs

### Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:3000.

## Weather Data
Weather data is provided by [Open-Meteo](https://open-meteo.com/); no API key is required for the configured public endpoints.

## Notes
- Run backend and frontend in separate terminals.
- The SQLite database is created locally by the backend.
- Do not commit virtual environments, build output, or local database files.

---
**SkyPulse** – Real-time weather insights and alerts.
