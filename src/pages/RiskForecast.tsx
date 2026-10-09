import React, { useEffect, useState } from 'react';
import {
  CloudRain,
  Droplets,
  Wind,
  Thermometer,
  AlertTriangle,
  ShieldCheck,
  Info,
  Calendar,
  RefreshCw,
  Sun,
  CloudLightning,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { WeatherData, DiseaseRiskData } from '../types';

export const RiskForecast: React.FC = () => {
  const { fields, activeField, setActiveField } = useApp();
  const [selectedFieldId, setSelectedFieldId] = useState<string>(activeField?.id || (fields[0]?.id || ''));
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [risk, setRisk] = useState<DiseaseRiskData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedFieldId) {
      setLoading(true);
      Promise.all([
        api.getFieldWeather(selectedFieldId).catch(() => null),
        api.getDiseaseRisk(selectedFieldId).catch(() => null)
      ]).then(([wRes, rRes]) => {
        if (wRes) setWeather(wRes);
        if (rRes) setRisk(rRes);
        setLoading(false);
      });
    }
  }, [selectedFieldId]);

  const targetField = fields.find((f) => f.id === selectedFieldId) || fields[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Disease Risk Forecast & Microclimate
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              Open-Meteo Live API
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time atmospheric humidity, temperature, and rainfall correlation for disease outbreak early warning.
          </p>
        </div>

        {/* Field Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Select Field:</label>
          <select
            value={selectedFieldId}
            onChange={(e) => {
              setSelectedFieldId(e.target.value);
              const f = fields.find((item) => item.id === e.target.value);
              if (f) setActiveField(f);
            }}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:border-emerald-600"
          >
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.cropType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Epidemiological Risk Card */}
      {risk && (
        <div
          className={`rounded-3xl p-6 sm:p-8 border shadow-sm space-y-6 ${
            risk.riskCategory === 'HIGH' || risk.riskCategory === 'CRITICAL'
              ? 'bg-rose-50/70 border-rose-200 text-rose-950'
              : risk.riskCategory === 'MODERATE'
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full ${
                    risk.riskCategory === 'HIGH' || risk.riskCategory === 'CRITICAL'
                      ? 'bg-rose-600 text-white'
                      : risk.riskCategory === 'MODERATE'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {risk.riskCategory} OUTBREAK RISK
                </span>
                <span className="text-xs font-bold text-slate-600 font-mono">
                  {targetField?.name} ({targetField?.cropType})
                </span>
              </div>
              <h3 className="text-2xl font-black mt-2 tracking-tight">
                Watch Pathogen: {risk.primaryRiskPathogen}
              </h3>
            </div>

            <div className="text-left sm:text-right text-xs">
              <span className="text-slate-500">Evaluation Timestamp</span>
              <p className="font-mono font-medium text-slate-700">
                {new Date(risk.assessmentTimestamp).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Risk Factors Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-black/5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Contributing Meteorological Factors
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {risk.riskFactors.map((rf, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold">•</span>
                    <span>{rf}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-black/5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Proactive Agricultural Actions
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {risk.actionItems.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mandatory Scientific Disclaimer from prompt */}
          <div className="p-3.5 rounded-2xl bg-white/60 border border-black/5 text-xs text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <b>Important:</b> {risk.scientificDisclaimer}
            </p>
          </div>
        </div>
      )}

      {/* Live Open-Meteo Current & Weekly Strip */}
      {weather && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Live Field Microclimate Station
              </h3>
              <p className="text-xs text-slate-500">
                Coordinates: {weather.location.latitude.toFixed(4)}° N,{' '}
                {weather.location.longitude.toFixed(4)}° E
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {weather.source}
            </span>
          </div>

          {/* 4 Cards for Weather Elements */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <Thermometer className="w-6 h-6 text-rose-500 mx-auto mb-1" />
              <span className="text-xs text-slate-500">Air Temp</span>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {weather.current.temperature_2m.toFixed(1)}°C
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <span className="text-xs text-slate-500">Relative Humidity</span>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {weather.current.relative_humidity_2m}%
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <CloudRain className="w-6 h-6 text-teal-500 mx-auto mb-1" />
              <span className="text-xs text-slate-500">Precipitation</span>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {weather.current.precipitation} mm
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <Wind className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
              <span className="text-xs text-slate-500">Wind Speed</span>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {weather.current.wind_speed_10m} km/h
              </p>
            </div>
          </div>

          {/* 7-Day Agronomic Forecast Table */}
          {weather.daily && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                7-Day Agronomic Outlook
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {weather.daily.time.map((day, idx) => (
                  <div
                    key={day}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs space-y-1"
                  >
                    <p className="font-semibold text-slate-600">{day.slice(5)}</p>
                    <p className="font-extrabold text-slate-900">
                      {weather.daily.temperature_2m_max[idx]}° / {weather.daily.temperature_2m_min[idx]}°
                    </p>
                    <p className="text-[11px] text-blue-600 font-medium">
                      Rain: {weather.daily.precipitation_sum[idx]} mm
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
