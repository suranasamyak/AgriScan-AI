import React, { useEffect, useState } from 'react';
import {
  Users,
  MapPin,
  Plus,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { CommunityObservation } from '../types';

export const CommunityAlerts: React.FC = () => {
  const { t, tCrop, tDisease } = useApp();
  const [alerts, setAlerts] = useState<CommunityObservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Form states
  const [cropType, setCropType] = useState('Tomato');
  const [suspectedDisease, setSuspectedDisease] = useState('');
  const [district, setDistrict] = useState('Nashik');
  const [state, setState] = useState('Maharashtra');
  const [notes, setNotes] = useState('');
  const [reporterAlias, setReporterAlias] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const crops = ['Tomato', 'Cotton', 'Soybean', 'Wheat', 'Rice', 'Potato', 'Maize', 'Sugarcane', 'Chilli', 'Onion', 'Grape'];

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.getCommunityAlerts();
      setAlerts(res.observations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspectedDisease.trim() || !district.trim()) return;

    try {
      setSubmitting(true);
      await api.submitCommunityReport({
        cropType,
        suspectedDisease: suspectedDisease.trim(),
        district: district.trim(),
        state,
        notes: notes.trim(),
        reporterAlias: reporterAlias.trim() || 'Farmer (Anonymous)'
      });
      setShowSubmitModal(false);
      setSuspectedDisease('');
      setNotes('');
      await loadAlerts();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Group alerts by district to identify regional clusters
  const clusterCounts: Record<string, number> = {};
  alerts.forEach((a) => {
    clusterCounts[a.district] = (clusterCounts[a.district] || 0) + 1;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {t('community_title')}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              {t('community_alerts')}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {t('community_sub')}
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('report_sighting')}</span>
        </button>
      </div>

      {/* Cluster Indicator Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(clusterCounts).map(([dist, count]) => (
          <div
            key={dist}
            className={`p-4 rounded-2xl border shadow-xs space-y-1 ${
              count >= 2
                ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {dist} {t('district_suffix')}
              </span>
              {count >= 2 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                  {t('cluster_watch')}
                </span>
              )}
            </div>
            <p className="text-xl font-extrabold text-slate-900">
              {t('reported_sightings', { count })}
            </p>
            <p className="text-[11px] text-slate-500">
              {count >= 2
                ? t('cluster_warning')
                : t('isolated_sighting')}
            </p>
          </div>
        ))}
      </div>

      {/* Privacy Guarantee Notice */}
      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-emerald-950 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <b>{t('privacy_notice_title')}</b> {t('privacy_notice_text')}
        </p>
      </div>

      {/* Observation Feed Cards */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900">{t('recent_sightings')}</h3>

        {alerts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            {t('no_active_alerts')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {tDisease(item.suspectedDisease)}
                      </span>
                      <span className="text-xs text-slate-500">• {tCrop(item.cropType)}</span>
                    </div>
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        {item.district}, {item.state}
                      </span>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.verified
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.verified ? t('kvk_verified') : t('unverified_report')}
                  </span>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    "{item.notes}"
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>{t('reported_by', { name: item.reporterAlias })}</span>
                  <span>{new Date(item.observationDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sighting Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-[#143324] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{t('submit_report_title')}</h3>
                <p className="text-xs text-emerald-300">
                  {t('submit_report_sub')}
                </p>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-emerald-300 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('crop_type_label')} *</label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white cursor-pointer"
                >
                  {crops.map((c) => (
                    <option key={c} value={c}>
                      {tCrop(c)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('target_pathogen')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yellow stripe rust on wheat foliage"
                  value={suspectedDisease}
                  onChange={(e) => setSuspectedDisease(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('district_label')}</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('state_label')}</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('field_obs_label')}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 4 neighboring farms reported rust spots after continuous morning fog."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('alias_label')}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Progressive Farmer (Nashik)"
                  value={reporterAlias}
                  onChange={(e) => setReporterAlias(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? t('posting') : t('post_report')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
