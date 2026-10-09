from pydantic import BaseModel, EmailStr, Field as PydanticField
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str = PydanticField(..., min_length=6)
    display_name: str
    preferred_language: Optional[str] = "en"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    display_name: str
    preferred_language: str
    isDemoAccount: Optional[bool] = False

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

class FieldCreate(BaseModel):
    name: str
    crop_type: str
    area: float
    planting_date: Optional[str] = None
    latitude: float
    longitude: float
    boundary_json: Optional[str] = None
    notes: Optional[str] = None

class FieldUpdate(BaseModel):
    name: Optional[str] = None
    crop_type: Optional[str] = None
    area: Optional[float] = None
    planting_date: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    boundary_json: Optional[str] = None
    notes: Optional[str] = None
    health_status: Optional[str] = None

class FieldResponse(BaseModel):
    id: str
    name: str
    crop_type: str
    area: float
    planting_date: Optional[str]
    latitude: float
    longitude: float
    boundary_json: Optional[str]
    notes: Optional[str]
    health_status: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ScanCreateRequest(BaseModel):
    field_id: str
    crop_type: str
    image_base64: str
    symptoms_entered: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_demo_mode_requested: Optional[bool] = False

class ScanResponse(BaseModel):
    id: str
    field_id: str
    crop_type: str
    predicted_condition: str
    confidence: float
    severity: str
    affected_area: Optional[float]
    model_name: str
    model_version: str
    prediction_status: str
    created_at: datetime

    class Config:
        from_attributes = True

class TreatmentRequest(BaseModel):
    crop_type: str
    suspected_disease: str
    area: float
    growth_stage: Optional[str] = "Vegetative"
    approach: Optional[str] = "Integrated Pest Management (IPM)"
    local_chemical_price: Optional[float] = 850.0
    local_bio_price: Optional[float] = 320.0

class AssistantRequest(BaseModel):
    message: str
    language: Optional[str] = "en"
    context_data: Optional[Dict[str, Any]] = None
