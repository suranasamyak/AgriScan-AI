import React, { useState } from 'react';
import {
  History,
  Search,
  Trash2,
  Eye,
  Sprout,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Scan } from '../types';
import { ConfidenceGuardBadge } from '../components/ConfidenceGuardBadge';

export const ScanHistory: React.FC = () => {
  const { scans, refreshData, t, tCrop, tDisease, tSeverity, tSymptom } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [activeModalScan, setActiveModalScan] = useState<Scan | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      scan.predictedCondition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.cropType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCrop = selectedCrop === 'ALL' || scan.cropType === selectedCrop;
    const matchesSeverity = selectedSeverity === 'ALL' || scan.severity === selectedSeverity;

    return matchesSearch && matchesCrop && matchesSeverity;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(t('delete_scan_confirm'))) return;
    try {
      setDeletingId(id);
      await api.deleteField(id);
      await fetch(`/api/scans/${id}`, { method: 'DELETE' });
      await refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const crops = Array.from(new Set(scans.map((s) => s.cropType)));

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {t('scan_history_title')}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              {scans.length} {t('total')}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {t('scan_history_sub')}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">{t('all_crops')}</option>
            {crops.map((c) => (
              <option key={c} value={c}>
                {tCrop(c)}
              </option>
            ))}
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">{t('all_severities')}</option>
            <option value="None">{t('none_healthy')}</option>
            <option value="Mild">{t('mild')}</option>
            <option value="Moderate">{t('moderate')}</option>
            <option value="Severe">{t('severe')}</option>
          </select>
        </div>
      </div>

      {/* Scans Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredScans.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            {t('no_matching_scans')}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredScans.map((scan) => (
              <div
                key={scan.id}
                onClick={() => setActiveModalScan(scan)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 overflow-hidden border border-slate-200 flex items-center justify-center shrink-0">
                    {scan.imagePath && scan.imagePath.startsWith('data:image') ? (
                      <img
                        src={scan.imagePath}
                        alt={scan.cropType}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Sprout className="w-7 h-7 text-emerald-500" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">
                        {tDisease(scan.predictedCondition)}
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">• {tCrop(scan.cropType)}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          scan.severity === 'Severe'
                            ? 'bg-rose-100 text-rose-700'
                            : scan.severity === 'Moderate'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {tSeverity(scan.severity)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium">{scan.fieldName}</p>

                    <div className="pt-1">
                      <ConfidenceGuardBadge
                        confidence={scan.confidence}
                        status={scan.predictionStatus}
                        isDemo={scan.isDemo}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between text-xs text-slate-400 gap-2">
                  <span className="font-mono text-[11px] text-slate-500">
                    {new Date(scan.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModalScan(scan);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 cursor-pointer"
                      title={t('view_details')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(scan.id, e)}
                      disabled={deletingId === scan.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer disabled:opacity-50"
                      title={t('delete_scan')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drill-down Detail Modal */}
      {activeModalScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
            <div className="bg-[#143324] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{tDisease(activeModalScan.predictedCondition)}</h3>
                <p className="text-xs text-emerald-300">
                  {tCrop(activeModalScan.cropType)} • {activeModalScan.fieldName}
                </p>
              </div>
              <button
                onClick={() => setActiveModalScan(null)}
                className="text-emerald-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="h-48 rounded-2xl bg-slate-900 overflow-hidden border border-slate-200 flex items-center justify-center">
                {activeModalScan.imagePath && activeModalScan.imagePath.startsWith('data:image') ? (
                  <img
                    src={activeModalScan.imagePath}
                    alt="Scan"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Sprout className="w-12 h-12 text-emerald-500" />
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400">{t('confidence')}</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {activeModalScan.confidence.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400">{t('severity')}</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {tSeverity(activeModalScan.severity)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400">{t('affected_leaf_area')}</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {activeModalScan.affectedAreaPercentage || 0}%
                  </p>
                </div>
              </div>

              {activeModalScan.symptoms && (
                <div className="space-y-1.5 text-xs">
                  <h4 className="font-bold text-slate-700">{t('observed_symptoms_heading')}:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {activeModalScan.symptoms.map((s, i) => (
                      <li key={i}>{tSymptom(s)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeModalScan.recommendedSteps && (
                <div className="space-y-1.5 text-xs">
                  <h4 className="font-bold text-slate-700">{t('recommended_ipm_heading')}:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {activeModalScan.recommendedSteps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
