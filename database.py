import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "weather.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def get_connection():
    return sqlite3.connect(DB_PATH)


def initialize_database():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS weather_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                city TEXT NOT NULL,
                temperature REAL,
                humidity REAL,
                wind_speed REAL,
                recorded_at TEXT NOT NULL
            )
        """)

        connection.execute("""
            CREATE TABLE IF NOT EXISTS saved_locations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                city TEXT NOT NULL UNIQUE
            )
        """)

        connection.execute(
            "INSERT OR IGNORE INTO saved_locations (city) VALUES (?)",
            ("Chennai",)
        )


def save_weather_history(city, current):
    with get_connection() as connection:
        connection.execute("""
            INSERT INTO weather_history
            (city, temperature, humidity, wind_speed, recorded_at)
            VALUES (?, ?, ?, ?, ?)
        """, (
            city,
            current.get("temperature_2m"),
            current.get("relative_humidity_2m"),
            current.get("wind_speed_10m"),
            datetime.now().isoformat(timespec="seconds")
        ))


def get_weather_history(city):
    with get_connection() as connection:
        rows = connection.execute("""
            SELECT temperature, humidity, wind_speed, recorded_at
            FROM weather_history
            WHERE city = ?
            ORDER BY id DESC
            LIMIT 50
        """, (city,)).fetchall()

    return [
        {
            "temperature": row[0],
            "humidity": row[1],
            "wind_speed": row[2],
            "recorded_at": row[3]
        }
        for row in rows
    ]


def get_saved_locations():
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT city FROM saved_locations ORDER BY city"
        ).fetchall()

    return [row[0] for row in rows]


def save_location(city):
    with get_connection() as connection:
        connection.execute(
            "INSERT OR IGNORE INTO saved_locations (city) VALUES (?)",
            (city,)
        )