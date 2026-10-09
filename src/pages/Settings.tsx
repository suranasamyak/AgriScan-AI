import React, { useEffect, useState } from 'react';
import {
  User,
  Globe,
  Sparkles,
  ShieldCheck,
  Server,
  RefreshCw,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Language } from '../types';

export const Settings: React.FC = () => {
  const { user, language, setLanguage, isDemoMode, setIsDemoMode, refreshData, t } = useApp();
  const [health, setHealth] = useState<any>(null);
  const [resetting, setResetting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(70);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(() => {});
  }, []);

  const handleReloadDemo = async () => {
    try {
      setSeeding(true);
      await api.seedDemoData();
      await refreshData();
      setStatusMessage('✓ ' + (language === 'mr' ? 'डेटासेट यशस्वीरित्या लोड झाला.' : language === 'hi' ? 'डेटासेट सफलतापूर्वक लोड हो गया।' : 'Demonstration dataset reloaded successfully.'));
    } catch (err: any) {
      setStatusMessage(`Error reloading demo: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm(language === 'mr' ? 'सर्व नोंदी पुसून टाकायच्या आहेत का?' : language === 'hi' ? 'क्या आप सभी रिकॉर्ड्स हटाना चाहते हैं?' : 'Reset all user scans and observation records?')) return;
    try {
      setResetting(true);
      await api.resetData();
      await refreshData();
      setStatusMessage('✓ ' + (language === 'mr' ? 'नोंदी पुसून टाकल्या.' : language === 'hi' ? 'रिकॉर्ड्स रीसेट कर दिए गए।' : 'Records reset successfully.'));
    } catch (err: any) {
      setStatusMessage(`Error resetting: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  const languagesList: { code: Language; name: string; native: string; subtitle: string }[] = [
    { code: 'en', name: 'English', native: 'English', subtitle: 'Standard English interface' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', subtitle: 'सम्पूर्ण वेबसाइट हिन्दी में' },
    { code: 'mr', name: 'Marathi', native: 'मराठी', subtitle: 'संपूर्ण वेबसाइट मराठीमध्ये' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {t('settings_title')}
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
            v2.4
          </span>
        </h2>
        <p className="text-xs text-slate-500">
          {t('settings_sub')}
        </p>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Language Selector Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-700" />
          {t('language_settings')}
        </h3>
        <p className="text-xs text-slate-500">
          {t('select_preferred_lang')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {languagesList.map((item) => {
            const isSelected = language === item.code;
            return (
              <button
                key={item.code}
                onClick={() => setLanguage(item.code)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-base font-bold text-slate-900">{item.native}</span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                      ✓
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-600">{item.name}</span>
                <span className="text-[11px] text-slate-400 mt-1">{item.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Account Details */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-700" />
          {t('farmer_profile')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 uppercase font-semibold text-[10px]">{t('display_name')}</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {user?.displayName || 'Ramesh Patil (Nashik)'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 uppercase font-semibold text-[10px]">{t('email_address')}</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5 font-mono">
              {user?.email || 'farmer_ramesh@agroscan.in'}
            </p>
          </div>
        </div>
      </div>

      {/* AI Confidence Guard Sensitivity */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            {t('ai_guard_threshold')}
          </h3>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {t('trigger_level', { threshold: confidenceThreshold })}
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {t('guard_explanation')}
        </p>

        <div className="space-y-2 pt-2">
          <input
            type="range"
            min="50"
            max="90"
            step="5"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
            <span>{t('permissive')}</span>
            <span>{t('standard_icar')}</span>
            <span>{t('strict_macro')}</span>
          </div>
        </div>
      </div>

      {/* Demonstration Mode & Dataset Reset */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {t('demo_dataset_title')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('demo_dataset_sub')}
            </p>
          </div>
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDemoMode
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isDemoMode ? t('demo_mode_btn_active') : t('real_mode_btn')}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleReloadDemo}
            disabled={seeding}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-200 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            <span>{t('reload_demo_btn')}</span>
          </button>

          <button
            onClick={handleResetData}
            disabled={resetting}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-2 transition-colors border border-rose-200 disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('clear_records_btn')}</span>
          </button>
        </div>
      </div>

      {/* Backend & Model Integration Status */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-700" />
          {t('backend_arch_title')}
        </h3>

        {health ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400">{t('db_engine')}</span>
              <p className="font-bold text-slate-800 mt-0.5">{health.database?.driver || 'SQLite3'}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400">{t('gemini_cloud_api')}</span>
              <p className={`font-bold mt-0.5 ${health.geminiConfigured ? 'text-emerald-700' : 'text-amber-600'}`}>
                {health.geminiConfigured ? t('connected') : t('local_fallback')}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400">{t('weather_service')}</span>
              <p className="font-bold text-slate-800 mt-0.5">Open-Meteo Live</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400">{t('pwa_cache')}</span>
              <p className="font-bold text-emerald-700 mt-0.5">IndexedDB Active</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Checking backend status...</p>
        )}
      </div>
    </div>
  );
};
