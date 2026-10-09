import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Globe,
  Sparkles,
  ShieldCheck,
  Server,
  RefreshCw,
  Trash2,
  Key,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  const { user, language, setLanguage, isDemoMode, setIsDemoMode, refreshData } = useApp();
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
      setStatusMessage('✓ Demonstration dataset reloaded successfully.');
    } catch (err: any) {
      setStatusMessage(`Error reloading demo: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset all user scans and observation records?')) return;
    try {
      setResetting(true);
      await api.resetData();
      await refreshData();
      setStatusMessage('✓ Records reset successfully.');
    } catch (err: any) {
      setStatusMessage(`Error resetting: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          System Configuration & Profile
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
            Control Center
          </span>
        </h2>
        <p className="text-xs text-slate-500">
          Manage user session, AI guard sensitivity, judge demonstration modes, and database health.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* User Account Details */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-700" />
          Farmer Account Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Display Name</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {user?.displayName || 'Ramesh Patil (Nashik)'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Email Address</span>
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
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            AI Confidence Guard Safety Threshold
          </h3>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {confidenceThreshold}% Trigger Level
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          When an image prediction confidence falls below this threshold, AgroScan AI flags the result as "Needs Confirmation", instructs the farmer to take a higher-resolution photograph, and cautions against unnecessary chemical spraying.
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
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>50% (Permissive)</span>
            <span>70% (Standard ICAR Guard)</span>
            <span>90% (Strict Macro-Only)</span>
          </div>
        </div>
      </div>

      {/* Demonstration Mode & Dataset Reset */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Hackathon Demonstration Dataset
            </h3>
            <p className="text-xs text-slate-500">
              Provide judges and reviewers with calibrated field, scan, and weather records.
            </p>
          </div>
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isDemoMode
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isDemoMode ? 'Demo Mode Active' : 'Real Mode'}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleReloadDemo}
            disabled={seeding}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            <span>Reload Demonstration Dataset</span>
          </button>

          <button
            onClick={handleResetData}
            disabled={resetting}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-2 transition-colors border border-rose-200 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear User Records</span>
          </button>
        </div>
      </div>

      {/* Backend & Model Integration Status */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-700" />
          Backend Architecture & Services
        </h3>

        {health ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400">Database Engine</span>
              <p className="font-bold text-slate-800 mt-0.5">{health.database?.driver}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400">Gemini Cloud API</span>
              <p className={`font-bold mt-0.5 ${health.geminiConfigured ? 'text-emerald-700' : 'text-amber-600'}`}>
                {health.geminiConfigured ? 'Connected' : 'Local Fallback'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400">Weather Service</span>
              <p className="font-bold text-slate-800 mt-0.5">Open-Meteo Live</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400">PWA Offline Cache</span>
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
