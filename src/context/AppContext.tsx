import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Field, Scan, Alert, Language } from '../types';
import { api } from '../services/api';
import { getPendingSyncItems, clearPendingSyncQueue } from '../services/offlineDb';

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
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | null>(null);

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    app_name: 'AgroScan AI',
    tagline: 'Detect Early. Track Smart. Protect Every Crop.',
    dashboard: 'Dashboard',
    crop_scanner: 'AI Crop Scanner',
    live_tracking: 'Live Field Tracking',
    health_timeline: 'Crop Health Timeline',
    risk_forecast: 'Disease Risk Forecast',
    treatment_advisor: 'Treatment Advisor',
    farmer_assistant: 'AI Farmer Assistant',
    community_alerts: 'Community Alerts',
    scan_history: 'Scan History',
    reports: 'Reports & Analytics',
    settings: 'Settings',
    registered_fields: 'Registered Fields',
    total_scans: 'Total Crop Scans',
    inspections_needed: 'Action Needed',
    healthy_crops: 'Healthy Foliage',
    demo_badge: 'DEMO DATA',
    demo_mode_active: 'Demonstration Account Active',
    offline_mode: 'Offline Mode Active',
    sync_now: 'Sync Pending Actions',
    register_field: 'Register Field',
    start_scan: 'New Crop Scan',
    ask_ai: 'Ask Kisan Assistant'
  },
  hi: {
    app_name: 'एग्रोस्कैन एआई',
    tagline: 'समय पर पहचानें. स्मार्ट ट्रैक करें. हर फसल बचाएं.',
    dashboard: 'डैशबोर्ड',
    crop_scanner: 'एआई फसल स्कैनर',
    live_tracking: 'लाइव खेत ट्रैकिंग',
    health_timeline: 'फसल स्वास्थ्य टाइमलाइन',
    risk_forecast: 'रोग जोखिम पूर्वानुमान',
    treatment_advisor: 'उपचार सलाहकार',
    farmer_assistant: 'किसान एआई मित्र',
    community_alerts: 'सामुदायिक अलर्ट',
    scan_history: 'स्कैन इतिहास',
    reports: 'रिपोर्ट एवं विश्लेषण',
    settings: 'सेटिंग्स',
    registered_fields: 'पंजीकृत खेत',
    total_scans: 'कुल फसल स्कैन',
    inspections_needed: 'निरीक्षण आवश्यक',
    healthy_crops: 'स्वस्थ फसलें',
    demo_badge: 'डेमो डेटा',
    demo_mode_active: 'प्रदर्शन खाता सक्रिय',
    offline_mode: 'ऑफ़लाइन मोड सक्रिय',
    sync_now: 'सिंक करें',
    register_field: 'खेत जोड़ें',
    start_scan: 'नया स्कैन करें',
    ask_ai: 'किसान मित्र से पूछें'
  },
  mr: {
    app_name: 'ॲग्रोस्कॅन एआय',
    tagline: 'लवकर ओळखा. स्मार्ट ट्रॅक करा. प्रत्येक पीक वाचवा.',
    dashboard: 'डॅशबोर्ड',
    crop_scanner: 'एआय पीक स्कॅनर',
    live_tracking: 'थेट शेत ट्रॅकिंग',
    health_timeline: 'पीक आरोग्य टाइमलाइन',
    risk_forecast: 'रोग जोखीम अंदाज',
    treatment_advisor: 'उपचार सल्लागार',
    farmer_assistant: 'शेतकरी एआय मित्र',
    community_alerts: 'समुदाय सूचना',
    scan_history: 'स्कॅन इतिहास',
    reports: 'अहवाल आणि विश्लेषण',
    settings: 'सेटिंग्ज',
    registered_fields: 'नोंदणीकृत शेतं',
    total_scans: 'एकूण पीक स्कॅन्स',
    inspections_needed: 'तपासणी आवश्यक',
    healthy_crops: 'निरोगी पिके',
    demo_badge: 'डेमो डेटा',
    demo_mode_active: 'डेमो खाते सक्रिय',
    offline_mode: 'ऑफलाइन मोड',
    sync_now: 'माहिती सिंक करा',
    register_field: 'शेत नोंदणी करा',
    start_scan: 'नवीन स्कॅन करा',
    ask_ai: 'शेतकरी मित्राशी बोला'
  }
};

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

  const t = useCallback((key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
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
        t
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
