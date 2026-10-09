import httpx
from typing import Dict, Any

async def fetch_open_meteo_weather(lat: float, lon: float) -> Dict[str, Any]:
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.json()

def calculate_disease_risk(crop_type: str, weather_data: Dict[str, Any]) -> Dict[str, Any]:
    current = weather_data.get("current", {})
    temp = current.get("temperature_2m", 25.0)
    humidity = current.get("relative_humidity_2m", 60)
    rain = current.get("precipitation", 0.0)

    risk_category = "LOW"
    primary_pathogen = "General Foliar Spot"
    factors = []
    actions = []

    if humidity >= 80 and 20 <= temp <= 29:
        risk_category = "HIGH"
        primary_pathogen = "Late Blight / Fungal Mildew" if crop_type == "Tomato" else "Bacterial Blight"
        factors.append(f"High relative humidity ({humidity}%) ensures sustained leaf surface wetness.")
        factors.append(f"Temperature window ({temp}°C) accelerates fungal sporulation.")
        actions.append("Inspect lower canopy undersides within 24 hours.")
        actions.append("Avoid overhead irrigation; schedule preventive bio-fungicide.")
    elif humidity >= 65 or rain > 0:
        risk_category = "MODERATE"
        factors.append(f"Moderate moisture ({humidity}% RH).")
        actions.append("Scout border rows for early lesion onset.")
    else:
        factors.append("Atmospheric humidity and temperature within safe baseline.")
        actions.append("Routine scheduled field scouting.")

    return {
        "risk_category": risk_category,
        "primary_pathogen": primary_pathogen,
        "weather_factors": factors,
        "action_items": actions,
        "scientific_disclaimer": "This is an epidemiological risk model based on atmospheric parameters and does not constitute a confirmed lab diagnosis."
    }
