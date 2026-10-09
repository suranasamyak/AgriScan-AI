import { Field, Scan, Observation, Alert, WeatherData, DiseaseRiskData, TreatmentRecommendation, CommunityObservation, User } from '../types';
import { addPendingSyncItem, getFieldsFromOfflineCache, saveFieldsToOfflineCache } from './offlineDb';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('agroscan_token');
  const isDemo = localStorage.getItem('agroscan_demo_mode') === 'true';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (isDemo) {
    headers['x-demo-user'] = 'true';
  }
  return headers;
}

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Auth
  async login(email: string, password?: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: password || 'Kisan@2026' })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(email: string, password: string, displayName: string, preferredLanguage: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName, preferredLanguage })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async logout() {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    localStorage.removeItem('agroscan_token');
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to get current user');
    return res.json();
  },

  // Fields
  async getFields(): Promise<{ fields: Field[] }> {
    try {
      const res = await fetch(`${API_BASE}/fields`, {
        headers: getAuthHeader()
      });
      if (res.ok) {
        const data = await res.json();
        // cache in IndexedDB for offline use
        if (data.fields) {
          saveFieldsToOfflineCache(data.fields);
        }
        return data;
      }
      throw new Error('Server returned ' + res.status);
    } catch (err) {
      // Offline fallback: load from IndexedDB
      const cached = await getFieldsFromOfflineCache();
      if (cached && cached.length > 0) {
        return { fields: cached };
      }
      throw err;
    }
  },

  async createField(fieldData: Partial<Field>): Promise<{ field: Field }> {
    try {
      const res = await fetch(`${API_BASE}/fields`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(fieldData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create field');
      }
      return res.json();
    } catch (err) {
      if (!navigator.onLine) {
        await addPendingSyncItem('field', fieldData);
        // Return optimistic local field
        const localField: Field = {
          id: `offline-${Date.now()}`,
          ownerId: 'local',
          name: fieldData.name || 'Untitled Field',
          cropType: fieldData.cropType || 'Tomato',
          area: fieldData.area || 1,
          plantingDate: fieldData.plantingDate || new Date().toISOString().split('T')[0],
          latitude: fieldData.latitude || 19.9975,
          longitude: fieldData.longitude || 73.7898,
          boundaryJson: fieldData.boundaryJson,
          notes: fieldData.notes,
          healthStatus: 'uninspected',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return { field: localField };
      }
      throw err;
    }
  },

  async updateField(id: string, updates: Partial<Field>): Promise<{ field: Field }> {
    const res = await fetch(`${API_BASE}/fields/${id}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update field');
    }
    return res.json();
  },

  async deleteField(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/fields/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete field');
  },

  // Scans
  async getScans(): Promise<{ scans: Scan[] }> {
    const res = await fetch(`${API_BASE}/scans`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch scans');
    return res.json();
  },

  async submitScan(payload: {
    fieldId: string;
    cropType: string;
    imageBase64: string;
    symptomsEntered?: string;
    latitude?: number;
    longitude?: number;
    isDemoModeRequested?: boolean;
  }): Promise<{ scan: Scan }> {
    const res = await fetch(`${API_BASE}/scans`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Scan analysis failed');
    }
    return res.json();
  },

  // Timeline
  async getFieldTimeline(fieldId: string): Promise<{
    field: Field;
    scans: Scan[];
    observations: Observation[];
    totalScans: number;
    initialObservationDate: string;
    latestObservationDate: string;
  }> {
    const res = await fetch(`${API_BASE}/fields/${fieldId}/timeline`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch timeline');
    return res.json();
  },

  async compareFieldScans(fieldId: string): Promise<{
    canCompare: boolean;
    scanA?: Scan;
    scanB?: Scan;
    daysDifference?: number;
    severityShift?: number;
    trajectory?: 'improving' | 'worsening' | 'stable';
    disclaimer?: string;
    message?: string;
  }> {
    const res = await fetch(`${API_BASE}/fields/${fieldId}/compare`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch comparison');
    return res.json();
  },

  // Weather & Risk
  async getFieldWeather(fieldId: string): Promise<WeatherData> {
    const res = await fetch(`${API_BASE}/fields/${fieldId}/weather`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Weather data unavailable');
    return res.json();
  },

  async getDiseaseRisk(fieldId: string): Promise<DiseaseRiskData> {
    const res = await fetch(`${API_BASE}/fields/${fieldId}/risk`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Risk assessment failed');
    return res.json();
  },

  // Treatment Advisor
  async getTreatmentPlan(payload: {
    cropType: string;
    suspectedDisease: string;
    area: number;
    growthStage?: string;
    approach?: string;
    localChemicalPrice?: number;
    localBioPrice?: number;
  }): Promise<TreatmentRecommendation> {
    const res = await fetch(`${API_BASE}/treatment/recommendations`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to generate treatment plan');
    return res.json();
  },

  // AI Assistant (Gemini)
  async askAssistant(message: string, language: string, contextData?: any): Promise<{
    reply: string;
    language: string;
    model: string;
    timestamp: string;
  }> {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ message, language, contextData })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Assistant service unavailable');
    }
    return res.json();
  },

  // Alerts
  async getAlerts(): Promise<{ alerts: Alert[] }> {
    const res = await fetch(`${API_BASE}/alerts`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async markAlertRead(alertId: string): Promise<void> {
    await fetch(`${API_BASE}/alerts/${alertId}/read`, {
      method: 'PATCH',
      headers: getAuthHeader()
    });
  },

  // Reports Summary
  async getReportsSummary(): Promise<{
    totalFields: number;
    totalAreaAcres: number;
    totalScans: number;
    fieldsNeedingInspectionCount: number;
    conditionsDistribution: Record<string, number>;
    severityDistribution: Record<string, number>;
    averageConfidence: number;
    generatedAt: string;
  }> {
    const res = await fetch(`${API_BASE}/reports/summary`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to generate reports summary');
    return res.json();
  },

  // Community
  async getCommunityAlerts(): Promise<{ observations: CommunityObservation[] }> {
    const res = await fetch(`${API_BASE}/community/observations`);
    if (!res.ok) throw new Error('Failed to load community alerts');
    return res.json();
  },

  async submitCommunityReport(report: Partial<CommunityObservation>): Promise<{ observation: CommunityObservation }> {
    const res = await fetch(`${API_BASE}/community/observations`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(report)
    });
    if (!res.ok) throw new Error('Failed to submit community observation');
    return res.json();
  },

  // Demo management
  async seedDemoData(): Promise<void> {
    await fetch(`${API_BASE}/demo/seed`, {
      method: 'POST',
      headers: getAuthHeader()
    });
  },

  async resetData(): Promise<void> {
    await fetch(`${API_BASE}/demo/reset`, {
      method: 'POST',
      headers: getAuthHeader()
    });
  }
};
