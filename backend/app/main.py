from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json
import base64

from .core.config import settings
from .core.security import verify_password, get_password_hash, create_access_token
from .database.session import engine, get_db, Base
from .models.models import User, Field, Scan, Observation, Alert, CommunityObservation
from .schemas.schemas import (
    UserRegister, UserLogin, UserResponse, TokenResponse,
    FieldCreate, FieldUpdate, FieldResponse,
    ScanCreateRequest, ScanResponse,
    TreatmentRequest, AssistantRequest
)
from .ml.classifier import classifier
from .services.weather_service import fetch_open_meteo_weather, calculate_disease_risk

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="AgroScan AI - Agricultural Disease Detection, Microclimate Tracking & Decision Support API",
    version="2.4.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed demo user and sample fields on startup
@app.on_event("startup")
def startup_populate():
    db = next(get_db())
    demo_user = db.query(User).filter(User.email == "farmer_ramesh@agroscan.in").first()
    if not demo_user:
        demo_user = User(
            id="demo-farmer-ramesh",
            email="farmer_ramesh@agroscan.in",
            password_hash=get_password_hash("Kisan@2026"),
            display_name="Ramesh Patil (Nashik)",
            preferred_language="en"
        )
        db.add(demo_user)
        db.commit()

        # Seed sample field
        sample_field = Field(
            id="f-1",
            owner_id=demo_user.id,
            name="North Acre - Tomato Block A",
            crop_type="Tomato",
            area=3.5,
            planting_date="2026-08-15",
            latitude=19.9975,
            longitude=73.7898,
            health_status="moderate",
            notes="Drip irrigated Arka Rakshak variety."
        )
        db.add(sample_field)
        db.commit()
    db.close()

# 1. HEALTH
@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    fields_count = db.query(Field).count()
    scans_count = db.query(Scan).count()
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": "2.4.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": {
            "driver": "SQLite / PostgreSQL Compatible SQLAlchemy Engine",
            "fields_count": fields_count,
            "scans_count": scans_count
        }
    }

# 2. AUTHENTICATION
@app.post("/api/auth/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Account with this email already exists.")

    new_user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        display_name=user_in.display_name,
        preferred_language=user_in.preferred_language or "en"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(new_user.id)
    return {
        "token": token,
        "user": UserResponse(
            id=new_user.id,
            email=new_user.email,
            display_name=new_user.display_name,
            preferred_language=new_user.preferred_language,
            isDemoAccount=False
        )
    }

@app.post("/api/auth/login", response_model=TokenResponse)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        # Demo bypass
        if user_in.email in ["demo", "farmer_ramesh@agroscan.in"]:
            demo_user = db.query(User).filter(User.email == "farmer_ramesh@agroscan.in").first()
            if demo_user:
                token = create_access_token(demo_user.id)
                return {
                    "token": token,
                    "user": UserResponse(
                        id=demo_user.id,
                        email=demo_user.email,
                        display_name=demo_user.display_name,
                        preferred_language=demo_user.preferred_language,
                        isDemoAccount=True
                    )
                }
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token(user.id)
    return {
        "token": token,
        "user": UserResponse(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            preferred_language=user.preferred_language,
            isDemoAccount=(user.id == "demo-farmer-ramesh")
        )
    }

@app.get("/api/auth/me")
def get_me(db: Session = Depends(get_db)):
    demo = db.query(User).filter(User.email == "farmer_ramesh@agroscan.in").first()
    return {
        "user": {
            "id": demo.id,
            "email": demo.email,
            "displayName": demo.display_name,
            "preferredLanguage": demo.preferred_language,
            "isDemoAccount": True
        }
    }

# 3. FIELDS
@app.get("/api/fields")
def get_fields(db: Session = Depends(get_db)):
    fields = db.query(Field).all()
    return {
        "fields": [
            {
                "id": f.id,
                "name": f.name,
                "cropType": f.crop_type,
                "area": f.area,
                "plantingDate": f.planting_date,
                "latitude": f.latitude,
                "longitude": f.longitude,
                "boundaryJson": f.boundary_json,
                "notes": f.notes,
                "healthStatus": f.health_status,
                "createdAt": f.created_at.isoformat(),
                "updatedAt": f.updated_at.isoformat()
            }
            for f in fields
        ]
    }

@app.post("/api/fields")
def create_field(payload: FieldCreate, db: Session = Depends(get_db)):
    new_field = Field(
        owner_id="demo-farmer-ramesh",
        name=payload.name,
        crop_type=payload.crop_type,
        area=payload.area,
        planting_date=payload.planting_date or datetime.now().strftime("%Y-%m-%d"),
        latitude=payload.latitude,
        longitude=payload.longitude,
        boundary_json=payload.boundary_json,
        notes=payload.notes,
        health_status="uninspected"
    )
    db.add(new_field)
    db.commit()
    db.refresh(new_field)
    return {
        "field": {
            "id": new_field.id,
            "name": new_field.name,
            "cropType": new_field.crop_type,
            "area": new_field.area,
            "latitude": new_field.latitude,
            "longitude": new_field.longitude,
            "createdAt": new_field.created_at.isoformat()
        }
    }

@app.get("/api/fields/{field_id}")
def get_single_field(field_id: str, db: Session = Depends(get_db)):
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found.")
    return {"field": field}

# 4. SCANS & ML VISION
@app.post("/api/scans")
def execute_scan(payload: ScanCreateRequest, db: Session = Depends(get_db)):
    field = db.query(Field).filter(Field.id == payload.field_id).first()
    if not field:
        field = db.query(Field).first()

    prediction = classifier.predict(
        crop_type=payload.crop_type,
        image_bytes=payload.image_base64.encode("utf-8") if payload.image_base64 else None,
        symptoms_entered=payload.symptoms_entered,
        is_demo=payload.is_demo_mode_requested or False
    )

    if "error" in prediction:
        raise HTTPException(status_code=400, detail=prediction["error"])

    new_scan = Scan(
        owner_id="demo-farmer-ramesh",
        field_id=field.id if field else "unassigned",
        image_path=payload.image_base64[:50000] if payload.image_base64 else "sample",
        crop_type=payload.crop_type,
        predicted_condition=prediction["predicted_condition"],
        confidence=prediction["confidence"],
        severity=prediction["severity"],
        affected_area=prediction["affected_area"],
        model_name=prediction["model_name"],
        model_version=prediction["model_version"],
        prediction_status=prediction["prediction_status"],
        symptoms_json=json.dumps(prediction["symptoms"]),
        alternatives_json=json.dumps(prediction["alternatives"]),
        recommendations_json=json.dumps(prediction["recommendations"]),
        safety_json=json.dumps(prediction["safety"]),
        latitude=payload.latitude or (field.latitude if field else 19.9975),
        longitude=payload.longitude or (field.longitude if field else 73.7898)
    )
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)

    return {
        "scan": {
            "id": new_scan.id,
            "fieldId": new_scan.field_id,
            "fieldName": field.name if field else payload.crop_type,
            "cropType": new_scan.crop_type,
            "predictedCondition": new_scan.predicted_condition,
            "confidence": new_scan.confidence,
            "severity": new_scan.severity,
            "affectedAreaPercentage": new_scan.affected_area,
            "modelName": new_scan.model_name,
            "modelVersion": new_scan.model_version,
            "predictionStatus": new_scan.prediction_status,
            "symptoms": prediction["symptoms"],
            "alternativeDiagnoses": prediction["alternatives"],
            "recommendedSteps": prediction["recommendations"],
            "safetyGuidance": prediction["safety"],
            "createdAt": new_scan.created_at.isoformat()
        }
    }

# 5. WEATHER & RISK
@app.get("/api/fields/{field_id}/weather")
async def get_weather(field_id: str, db: Session = Depends(get_db)):
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    try:
        data = await fetch_open_meteo_weather(field.latitude, field.longitude)
        return {
            "location": {"fieldName": field.name, "latitude": field.latitude, "longitude": field.longitude},
            "current": data.get("current", {}),
            "daily": data.get("daily", {}),
            "source": "Open-Meteo Live API"
        }
    except Exception as e:
        return {
            "location": {"fieldName": field.name, "latitude": field.latitude, "longitude": field.longitude},
            "current": {"temperature_2m": 27.5, "relative_humidity_2m": 82, "precipitation": 1.5, "wind_speed_10m": 12},
            "source": "Fallback Offline Meteorological Baseline"
        }

# 6. TREATMENT ADVISOR
@app.post("/api/treatment/recommendations")
def get_treatment(payload: TreatmentRequest):
    area = payload.area or 1.0
    bio_cost = int(area * payload.local_bio_price * 1.5)
    chem_cost = int(area * payload.local_chemical_price * 1.2)
    return {
        "crop": payload.crop_type,
        "disease": payload.suspected_disease,
        "growthStage": payload.growth_stage,
        "managementStrategy": {
            "cultural": [
                "Prune lower infected leaves using sanitized shears to improve canopy airflow",
                "Sanitize pruning tools between passes to stop mechanical spore inoculation"
            ],
            "biological": [
                "Foliar spray of Trichoderma harzianum (2% WP) at 5 g/L during late evening",
                "Soil drenching with Pseudomonas fluorescens to stimulate systemic resistance"
            ],
            "chemical": [
                "Targeted application of Copper Oxychloride 50 WP (2.5 g/L) if disease coverage exceeds 20%",
                "Comply strictly with Pre-Harvest Intervals (PHI)"
            ]
        },
        "costEstimator": {
            "acreage": area,
            "estimatedWaterVolumeLiters": int(area * 200),
            "bioApproachCostINR": bio_cost,
            "chemicalApproachCostINR": chem_cost,
            "integratedApproachCostINR": int((bio_cost + chem_cost) * 0.5)
        },
        "safetyPrecautions": [
            "Wear protective face mask, rubber boots, and gloves during spraying",
            "Maintain at least 15m safe buffer from open drinking wells and farm ponds"
        ],
        "kvkNotice": "Verify chemical approvals with your local Krishi Vigyan Kendra (KVK) extension."
    }

# 7. COMMUNITY OBSERVATIONS
@app.get("/api/community/observations")
def get_community(db: Session = Depends(get_db)):
    obs = db.query(CommunityObservation).all()
    return {"observations": obs}
