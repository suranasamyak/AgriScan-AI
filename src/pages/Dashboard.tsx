import React, { useEffect, useState } from 'react';
import {
  Sprout,
  ScanLine,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CloudSun,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles,
  RefreshCw,
  Droplets,
  Wind,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { WeatherData, DiseaseRiskData } from '../types';
import { ConfidenceGuardBadge } from '../components/ConfidenceGuardBadge';

interface DashboardProps {
  onNavigate: (tab: any) => void;
  onOpenNewScan: () => void;
  onOpenNewField: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenNewScan,
  onOpenNewField
}) => {
  const { fields, scans, alerts, activeField, isDemoMode, refreshData, t } = useApp();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [risk, setRisk] = useState<DiseaseRiskData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Load weather and risk for active field
  useEffect(() => {
    if (activeField) {
      setLoadingWeather(true);
      Promise.all([
        api.getFieldWeather(activeField.id).catch(() => null),
        api.getDiseaseRisk(activeField.id).catch(() => null)
      ]).then(([wData, rData]) => {
        if (wData) setWeather(wData);
        if (rData) setRisk(rData);
        setLoadingWeather(false);
      });
    }
  }, [activeField]);

  const urgentFields = fields.filter(
    (f) => f.healthStatus === 'critical' || f.healthStatus === 'moderate'
  );
  const totalScansCount = scans.length;
  const recentScans = scans.slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Welcome card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#143324] via-[#1b4332] to-[#2d6a4f] text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                Kisan AI Field Station
              </span>
              {isDemoMode && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  DEMO DATA LOADED
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              AgroScan AI Field Monitor
            </h2>
            <p className="text-emerald-100/90 text-sm leading-relaxed">
              Detect foliar diseases early, track historical symptom trajectory, and receive real-time epidemiological weather risk warnings calibrated for Indian agriculture.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewScan}
              className="px-5 py-3 rounded-2xl bg-white text-emerald-950 font-bold text-sm hover:bg-emerald-50 active:scale-95 shadow-lg shadow-black/20 flex items-center gap-2 transition-transform"
            >
              <ScanLine className="w-4 h-4 text-emerald-700" />
              Start Crop Scan
            </button>
            <button
              onClick={onOpenNewField}
              className="px-4 py-3 rounded-2xl bg-emerald-900/60 hover:bg-emerald-900 text-white font-semibold text-sm border border-emerald-600/40 flex items-center gap-2 transition-colors"
            >
              <Sprout className="w-4 h-4" />
              + Register Field
            </button>
          </div>
        </div>

        {/* Subtle decorative leaf pattern */}
        <div className="absolute -right-8 -bottom-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Key KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Registered Fields
            </p>
            <p className="text-2xl font-bold text-slate-900">{fields.length}</p>
            <p className="text-[11px] text-slate-500">
              Total {fields.reduce((acc, f) => acc + f.area, 0).toFixed(1)} acres monitored
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total AI Scans
            </p>
            <p className="text-2xl font-bold text-slate-900">{totalScansCount}</p>
            <p className="text-[11px] text-emerald-600 font-medium">Vision & Gemini Guard</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <ScanLine className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Urgent Attention
            </p>
            <p className="text-2xl font-bold text-rose-600">{urgentFields.length}</p>
            <p className="text-[11px] text-slate-500">Fields requiring inspection</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Disease Risk Level
            </p>
            <p
              className={`text-2xl font-bold ${
                risk?.riskCategory === 'HIGH'
                  ? 'text-rose-600'
                  : risk?.riskCategory === 'MODERATE'
                  ? 'text-amber-600'
                  : 'text-emerald-700'
              }`}
            >
              {risk?.riskCategory || 'NORMAL'}
            </p>
            <p className="text-[11px] text-slate-500">Open-Meteo Microclimate</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CloudSun className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Weather & Risk Summary + Recent Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Registered Fields & Recent Scans */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent AI Crop Scans */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Crop Diagnostic Scans</h3>
                <p className="text-xs text-slate-500">Latest disease predictions & confidence levels</p>
              </div>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                View All Scans <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentScans.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <ScanLine className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No crop scans recorded yet</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                  Take a photo of crop foliage or select a sample image to diagnose diseases.
                </p>
                <button
                  onClick={onOpenNewScan}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                >
                  Start First Scan
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    onClick={() => onNavigate('timeline')}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-2xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-mono text-[10px] overflow-hidden shrink-0">
                        {scan.imagePath && scan.imagePath.startsWith('data:image') ? (
                          <img
                            src={scan.imagePath}
                            alt={scan.cropType}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Sprout className="w-6 h-6 text-emerald-700" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {scan.predictedCondition}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            • {scan.cropType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{scan.fieldName}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <ConfidenceGuardBadge
                            confidence={scan.confidence}
                            status={scan.predictionStatus}
                            isDemo={scan.isDemo}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">
                        Severity: {scan.severity}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Registered Fields Overview */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Monitored Fields</h3>
                <p className="text-xs text-slate-500">Spatial acreage & current health status</p>
              </div>
              <button
                onClick={() => onNavigate('live_tracking')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                Open Live Map <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {fields.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-sm font-semibold text-slate-600 mb-2">No fields registered</p>
                <button
                  onClick={onOpenNewField}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
                >
                  Register First Field
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    onClick={() => onNavigate('live_tracking')}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          field.healthStatus === 'critical'
                            ? 'bg-rose-100 text-rose-700'
                            : field.healthStatus === 'moderate'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {field.healthStatus || 'Healthy'}
                      </span>
                      <span className="text-xs font-bold text-slate-700">{field.area} ac</span>
                    </div>
                    <p className="font-bold text-sm text-slate-900 truncate">{field.name}</p>
                    <p className="text-xs text-slate-500 mb-2">{field.cropType} Crop</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{field.latitude.toFixed(4)}, {field.longitude.toFixed(4)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Weather Summary & Agronomic Risk */}
        <div className="space-y-6">
          {/* Live Microclimate Weather Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Live Microclimate</h3>
                <p className="text-xs text-slate-500">{activeField?.name || 'Local Field Station'}</p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                Open-Meteo
              </span>
            </div>

            {weather ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100">
                  <div>
                    <span className="text-3xl font-extrabold text-slate-900">
                      {weather.current.temperature_2m.toFixed(1)}°C
                    </span>
                    <p className="text-xs text-slate-500 font-medium">Air Temperature</p>
                  </div>
                  <CloudSun className="w-10 h-10 text-emerald-700" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" /> Humidity
                    </span>
                    <p className="text-base font-bold text-slate-800 mt-0.5">
                      {weather.current.relative_humidity_2m}%
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-teal-500" /> Wind Speed
                    </span>
                    <p className="text-base font-bold text-slate-800 mt-0.5">
                      {weather.current.wind_speed_10m} km/h
                    </p>
                  </div>
                </div>

                {/* 3-day forecast mini strip */}
                {weather.daily && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-700 mb-2">3-Day Forecast</p>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {weather.daily.time.slice(0, 3).map((day, idx) => (
                        <div key={day} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-[10px] text-slate-500 font-medium">{day.slice(5)}</p>
                          <p className="font-bold text-slate-800 mt-0.5">
                            {weather.daily.temperature_2m_max[idx]}°
                          </p>
                          <p className="text-[10px] text-blue-600 font-medium">
                            {weather.daily.precipitation_sum[idx]} mm
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                {loadingWeather ? 'Fetching Open-Meteo weather...' : 'Select a field to view live weather.'}
              </div>
            )}

            <button
              onClick={() => onNavigate('risk')}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
            >
              Epidemiological Risk Model <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action Reminders & KVK Advisory */}
          <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm">Agronomic Protection Note</h3>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed">
              High atmospheric moisture (&gt;80%) increases fungal sporulation. Avoid overhead spraying late in the afternoon to prevent prolonged leaf wetness.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                onClick={() => onNavigate('treatment')}
                className="text-emerald-300 hover:text-white font-semibold underline"
              >
                Open Treatment Advisor →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
