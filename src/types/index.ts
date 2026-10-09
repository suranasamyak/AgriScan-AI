export type Language = 'en' | 'hi' | 'mr';

export interface User {
  id: string;
  email: string;
  displayName: string;
  preferredLanguage: Language;
  isDemoAccount?: boolean;
}

export interface Field {
  id: string;
  ownerId: string;
  name: string;
  cropType: string;
  area: number; // acres
  plantingDate: string;
  latitude: number;
  longitude: number;
  boundaryJson?: string;
  notes?: string;
  healthStatus?: 'healthy' | 'moderate' | 'critical' | 'uninspected';
  createdAt: string;
  updatedAt: string;
}

export interface Scan {
  id: string;
  ownerId: string;
  fieldId: string;
  fieldName: string;
  imagePath: string;
  cropType: string;
  predictedCondition: string;
  scientificName?: string;
  confidence: number;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'None';
  affectedAreaPercentage?: number;
  modelName: string;
  modelVersion: string;
  predictionStatus: 'analysed' | 'needs_confirmation' | 'expert_reviewed' | 'demo_simulation';
  isDemo: boolean;
  symptoms: string[];
  alternativeDiagnoses: { condition: string; confidence: number }[];
  recommendedSteps: string[];
  safetyGuidance: string[];
  notes?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface Observation {
  id: string;
  ownerId: string;
  fieldId: string;
  scanId?: string;
  observationType: 'visual_scouting' | 'ai_scan' | 'pest_trap' | 'soil_moisture' | 'leaf_sampling';
  status: 'normal' | 'watchlist' | 'urgent_action_required';
  notes: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface Alert {
  id: string;
  ownerId: string;
  fieldId?: string;
  alertType: 'disease_outbreak' | 'weather_risk' | 'inspection_due' | 'system';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  readAt?: string;
  createdAt: string;
}

export interface WeatherData {
  location: {
    fieldName: string;
    latitude: number;
    longitude: number;
  };
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
  };
  source: string;
  timestamp: string;
  note?: string;
}

export interface DiseaseRiskData {
  field: {
    id: string;
    name: string;
    cropType: string;
  };
  riskCategory: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  primaryRiskPathogen: string;
  weatherFactors: {
    temperature: number;
    relativeHumidity: number;
    precipitation: number;
  };
  riskFactors: string[];
  actionItems: string[];
  assessmentTimestamp: string;
  scientificDisclaimer: string;
}

export interface TreatmentRecommendation {
  crop: string;
  disease: string;
  growthStage: string;
  managementStrategy: {
    cultural: string[];
    biological: string[];
    chemical: string[];
  };
  costEstimator: {
    acreage: number;
    estimatedWaterVolumeLiters: number;
    bioApproachCostINR: number;
    chemicalApproachCostINR: number;
    integratedApproachCostINR: number;
  };
  safetyPrecautions: string[];
  kvkNotice: string;
}

export interface CommunityObservation {
  id: string;
  cropType: string;
  suspectedDisease: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  observationDate: string;
  verified: boolean;
  reporterAlias: string;
  notes: string;
  createdAt: string;
}
