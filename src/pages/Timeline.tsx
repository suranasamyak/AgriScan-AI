import React, { useEffect, useState } from 'react';
import {
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Calendar,
  CheckCircle2,
  CalendarPlus,
  Info,
  ChevronRight,
  Layers,
  Sprout
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Field, Scan } from '../types';

export const Timeline: React.FC<{ onOpenNewScan: () => void }> = ({ onOpenNewScan }) => {
  const { fields, activeField, setActiveField } = useApp();
  const [selectedFieldId, setSelectedFieldId] = useState<string>(activeField?.id || (fields[0]?.id || ''));
  const [timelineData, setTimelineData] = useState<{
    field: Field;
    scans: Scan[];
    observations: any[];
  } | null>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [inspectionReminderSet, setInspectionReminderSet] = useState(false);

  useEffect(() => {
    if (selectedFieldId) {
      setLoading(true);
      Promise.all([
        api.getFieldTimeline(selectedFieldId).catch(() => null),
        api.compareFieldScans(selectedFieldId).catch(() => null)
      ]).then(([tRes, cRes]) => {
        if (tRes) setTimelineData(tRes);
        if (cRes) setComparison(cRes);
        setLoading(false);
      });
    }
  }, [selectedFieldId]);

  const targetField = fields.find((f) => f.id === selectedFieldId);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Crop Disease Progress Tracker
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              Temporal Timeline
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Compare past vs present foliar scans from the same field plot to evaluate treatment response.
          </p>
        </div>

        {/* Field Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Select Plot:</label>
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

      {/* Side-by-Side Comparison Module */}
      {comparison && comparison.canCompare ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Side-by-Side Diagnostic Comparison
              </h3>
              <p className="text-xs text-slate-500">
                Evaluation across {comparison.daysDifference} days of crop progression
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                  comparison.trajectory === 'improving'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : comparison.trajectory === 'worsening'
                    ? 'bg-rose-100 text-rose-900 border border-rose-300'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {comparison.trajectory === 'improving' ? (
                  <TrendingDown className="w-4 h-4 text-emerald-700" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-rose-600" />
                )}
                <span>Trajectory: {comparison.trajectory.toUpperCase()}</span>
              </span>
            </div>
          </div>

          {/* Cards for Scan A vs Scan B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scan A (Baseline / Earlier Scan) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider">
                  Baseline (Day 1)
                </span>
                <span className="text-slate-500">
                  {new Date(comparison.scanA.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="h-44 rounded-xl bg-slate-900 overflow-hidden border border-slate-200 flex items-center justify-center">
                {comparison.scanA.imagePath && comparison.scanA.imagePath.startsWith('data:image') ? (
                  <img
                    src={comparison.scanA.imagePath}
                    alt="Baseline Scan"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-400">
                    <Sprout className="w-8 h-8 mx-auto mb-1 text-emerald-600" />
                    <span className="text-xs">Baseline Image Record</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="font-bold text-sm text-slate-900">
                  {comparison.scanA.predictedCondition}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Confidence: {comparison.scanA.confidence.toFixed(1)}%</span>
                  <span className="font-semibold">Severity: {comparison.scanA.severity}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Affected Leaf Area: ~{comparison.scanA.affectedAreaPercentage || 0}%
                </p>
              </div>
            </div>

            {/* Scan B (Latest / Follow-up Scan) */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 uppercase tracking-wider">
                  Latest Follow-Up (Day {comparison.daysDifference})
                </span>
                <span className="text-slate-500">
                  {new Date(comparison.scanB.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="h-44 rounded-xl bg-slate-900 overflow-hidden border border-slate-200 flex items-center justify-center">
                {comparison.scanB.imagePath && comparison.scanB.imagePath.startsWith('data:image') ? (
                  <img
                    src={comparison.scanB.imagePath}
                    alt="Latest Scan"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-400">
                    <Sprout className="w-8 h-8 mx-auto mb-1 text-emerald-600" />
                    <span className="text-xs">Follow-up Image Record</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="font-bold text-sm text-slate-900">
                  {comparison.scanB.predictedCondition}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Confidence: {comparison.scanB.confidence.toFixed(1)}%</span>
                  <span className="font-semibold">Severity: {comparison.scanB.severity}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Affected Leaf Area: ~{comparison.scanB.affectedAreaPercentage || 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Scientific Disclaimer (Crucial requirement from prompt) */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <b>Agronomic Disclaimer:</b> Image differences may result from variation in camera lighting, angle, foliage expansion, or surface dew. A shift in model output does not constitute definitive laboratory confirmation of pathogen lifecycle arrest. Verify with physical ground scouting.
            </p>
          </div>

          {/* Follow-up reminder button */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setInspectionReminderSet(true)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <CalendarPlus className="w-4 h-4 text-emerald-700" />
              <span>
                {inspectionReminderSet ? '✓ Reminder Scheduled for Day 14' : 'Schedule 7-Day Follow-Up Scouting'}
              </span>
            </button>
            <button
              onClick={onOpenNewScan}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
            >
              Take New Follow-Up Scan
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Need At Least 2 Scans For Comparison</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            To generate a side-by-side progression tracker, perform a follow-up scan on this field after applying recommended cultural or biological management.
          </p>
          <button
            onClick={onOpenNewScan}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
          >
            Start Follow-Up Scan
          </button>
        </div>
      )}

      {/* Historical Timeline Feed */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900">
          Chronological Field Observation Log
        </h3>

        {timelineData?.scans && timelineData.scans.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
            {timelineData.scans.map((scan, idx) => (
              <div key={scan.id} className="relative space-y-1">
                {/* Node icon */}
                <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-sm" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    {scan.predictedCondition}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(scan.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Severity: {scan.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Model: {scan.modelName} ({scan.confidence.toFixed(1)}% confidence)
                </p>
                {scan.notes && <p className="text-xs text-slate-500 italic">{scan.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">No scans recorded for this plot yet.</p>
        )}
      </div>
    </div>
  );
};
