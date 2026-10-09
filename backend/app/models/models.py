from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, Boolean, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database.session import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    display_name = Column(String(255), nullable=False)
    preferred_language = Column(String(10), default="en")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    fields = relationship("Field", back_populates="owner", cascade="all, delete-orphan")
    scans = relationship("Scan", back_populates="owner", cascade="all, delete-orphan")
    observations = relationship("Observation", back_populates="owner", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="owner", cascade="all, delete-orphan")

class Field(Base):
    __tablename__ = "fields"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    crop_type = Column(String(100), nullable=False, index=True)
    area = Column(Float, nullable=False)
    planting_date = Column(String(50), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    boundary_json = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    health_status = Column(String(50), default="uninspected")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="fields")
    scans = relationship("Scan", back_populates="field", cascade="all, delete-orphan")
    observations = relationship("Observation", back_populates="field", cascade="all, delete-orphan")

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    field_id = Column(String(36), ForeignKey("fields.id"), nullable=False, index=True)
    image_path = Column(String(500), nullable=False)
    crop_type = Column(String(100), nullable=False)
    predicted_condition = Column(String(255), nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String(50), nullable=False)
    affected_area = Column(Float, nullable=True)
    model_name = Column(String(100), nullable=False)
    model_version = Column(String(50), nullable=False)
    prediction_status = Column(String(50), default="analysed")
    symptoms_json = Column(Text, nullable=True)
    alternatives_json = Column(Text, nullable=True)
    recommendations_json = Column(Text, nullable=True)
    safety_json = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    owner = relationship("User", back_populates="scans")
    field = relationship("Field", back_populates="scans")

class Observation(Base):
    __tablename__ = "observations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    field_id = Column(String(36), ForeignKey("fields.id"), nullable=False, index=True)
    scan_id = Column(String(36), ForeignKey("scans.id"), nullable=True)
    observation_type = Column(String(50), default="visual_scouting")
    status = Column(String(50), default="normal")
    notes = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    owner = relationship("User", back_populates="observations")
    field = relationship("Field", back_populates="observations")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    field_id = Column(String(36), ForeignKey("fields.id"), nullable=True)
    alert_type = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(50), default="low")
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    owner = relationship("User", back_populates="alerts")

class TreatmentPlan(Base):
    __tablename__ = "treatment_plans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    field_id = Column(String(36), ForeignKey("fields.id"), nullable=False)
    scan_id = Column(String(36), ForeignKey("scans.id"), nullable=True)
    options_json = Column(Text, nullable=False)
    estimated_cost = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class CommunityObservation(Base):
    __tablename__ = "community_observations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    crop_type = Column(String(100), nullable=False)
    suspected_disease = Column(String(255), nullable=False)
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), default="Maharashtra")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    observation_date = Column(String(50), nullable=False)
    verified = Column(Boolean, default=False)
    reporter_alias = Column(String(100), default="Local Farmer")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
