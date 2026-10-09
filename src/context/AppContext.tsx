import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Field, Scan, Alert, Language } from '../types';
import { api } from '../services/api';
import { getPendingSyncItems, clearPendingSyncQueue } from '../services/offlineDb';
import {
  TRANSLATIONS,
  CROP_TRANSLATIONS,
  DISEASE_TRANSLATIONS,
  SEVERITY_TRANSLATIONS,
  STATUS_TRANSLATIONS,
  GROWTH_STAGE_TRANSLATIONS,
  APPROACH_TRANSLATIONS,
  TRAJECTORY_TRANSLATIONS,
  SYMPTOM_TRANSLATIONS
} from '../utils/translations';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  fields: Field[];
  activeField: Field | null;
  setActiveField: (field: Field | null) => void;
  scans: Scan[];
  alerts: Alert[];
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  isOnline: boolean;
  pendingSyncCount: number;
  loading: boolean;
  refreshData: () => Promise<void>;
  syncPendingQueue: () => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  tCrop: (cropName: string) => string;
  tDisease: (diseaseName: string) => string;
  tSeverity: (sev: string) => string;
  tStatus: (status?: string) => string;
  tStage: (stage: string) => string;
  tApproach: (approach: string) => string;
  tTrajectory: (traj: string) => string;
  tSymptom: (symptom: string) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('agroscan_lang') as Language) || 'en';
  });
  const [fields, setFields] = useState<Field[]>([]);
  const [activeField, setActiveField] = useState<Field | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(() => {
    return localStorage.getItem('agroscan_demo_mode') !== 'false'; // default true for hackathon showcase
  });
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('agroscan_lang', lang);
  };

  const setIsDemoMode = (val: boolean) => {
    setIsDemoModeState(val);
    localStorage.setItem('agroscan_demo_mode', val ? 'true' : 'false');
  };

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let text = TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      });
    }
    return text;
  }, [language]);

  const tCrop = useCallback((cropName: string): string => {
    return CROP_TRANSLATIONS[language]?.[cropName] || CROP_TRANSLATIONS['en']?.[cropName] || cropName;
  }, [language]);

  const tDisease = useCallback((diseaseName: string): string => {
    return DISEASE_TRANSLATIONS[language]?.[diseaseName] || DISEASE_TRANSLATIONS['en']?.[diseaseName] || diseaseName;
  }, [language]);

  const tSeverity = useCallback((sev: string): string => {
    return SEVERITY_TRANSLATIONS[language]?.[sev] || SEVERITY_TRANSLATIONS['en']?.[sev] || sev;
  }, [language]);

  const tStatus = useCallback((status?: string): string => {
    if (!status) return STATUS_TRANSLATIONS[language]?.['uninspected'] || 'Uninspected';
    return STATUS_TRANSLATIONS[language]?.[status] || STATUS_TRANSLATIONS['en']?.[status] || status;
  }, [language]);

  const tStage = useCallback((stage: string): string => {
    return GROWTH_STAGE_TRANSLATIONS[language]?.[stage] || GROWTH_STAGE_TRANSLATIONS['en']?.[stage] || stage;
  }, [language]);

  const tApproach = useCallback((approach: string): string => {
    return APPROACH_TRANSLATIONS[language]?.[approach] || APPROACH_TRANSLATIONS['en']?.[approach] || approach;
  }, [language]);

  const tTrajectory = useCallback((traj: string): string => {
    return TRAJECTORY_TRANSLATIONS[language]?.[traj] || TRAJECTORY_TRANSLATIONS['en']?.[traj] || traj;
  }, [language]);

  const tSymptom = useCallback((symptom: string): string => {
    return SYMPTOM_TRANSLATIONS[language]?.[symptom] || SYMPTOM_TRANSLATIONS['en']?.[symptom] || symptom;
  }, [language]);

  const checkPendingSync = useCallback(async () => {
    const queue = await getPendingSyncItems();
    setPendingSyncCount(queue.length);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch user profile
      try {
        const meRes = await api.getMe();
        setUser(meRes.user);
      } catch {
        // Fallback default demo user
        setUser({
          id: 'demo-farmer-ramesh',
          email: 'farmer_ramesh@agroscan.in',
          displayName: 'Ramesh Patil (Nashik)',
          preferredLanguage: language,
          isDemoAccount: true
        });
      }

      // Fetch fields
      const fRes = await api.getFields();
      setFields(fRes.fields || []);
      if (fRes.fields && fRes.fields.length > 0 && !activeField) {
        setActiveField(fRes.fields[0]);
      }

      // Fetch scans
      const sRes = await api.getScans();
      setScans(sRes.scans || []);

      // Fetch alerts
      const aRes = await api.getAlerts();
      setAlerts(aRes.alerts || []);

      await checkPendingSync();
    } catch (err) {
      console.warn('Error loading app data:', err);
    } finally {
      setLoading(false);
    }
  }, [language, activeField, checkPendingSync]);

  const syncPendingQueue = useCallback(async () => {
    if (!navigator.onLine) return;
    const items = await getPendingSyncItems();
    if (items.length === 0) return;

    for (const item of items) {
      try {
        if (item.type === 'field') {
          await api.createField(item.payload);
        }
      } catch (err) {
        console.warn('Failed item sync:', err);
      }
    }
    await clearPendingSyncQueue();
    await checkPendingSync();
    await refreshData();
  }, [checkPendingSync, refreshData]);

  useEffect(() => {
    refreshData();

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker if supported
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration skipped:', err);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        language,
        setLanguage,
        fields,
        activeField,
        setActiveField,
        scans,
        alerts,
        isDemoMode,
        setIsDemoMode,
        isOnline,
        pendingSyncCount,
        loading,
        refreshData,
        syncPendingQueue,
        t,
        tCrop,
        tDisease,
        tSeverity,
        tStatus,
        tStage,
        tApproach,
        tTrajectory,
        tSymptom
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
