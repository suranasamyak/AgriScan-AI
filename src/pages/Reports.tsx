import React, { useEffect, useState } from 'react';
import {
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const Reports: React.FC = () => {
  const { fields, scans, isDemoMode, t, tCrop, tDisease, tSeverity } = useApp();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const res = await api.getReportsSummary();
      setSummary(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (scans.length === 0) return;

    const headers = [
      'Scan_ID',
      'Date',
      'Field_Name',
      'Crop_Type',
      'Condition_Diagnosed',
      'Confidence_Score',
      'Severity_Estimate',
      'Affected_Area_Pct',
      'Model_Version',
      'Is_Demo_Data'
    ];

    const rows = scans.map((s) => [
      s.id,
      s.createdAt,
      `"${s.fieldName}"`,
      s.cropType,
      `"${s.predictedCondition}"`,
      s.confidence.toFixed(1),
      s.severity,
      s.affectedAreaPercentage || 0,
      s.modelVersion,
      s.isDemo ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AgroScan_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 print:p-0 print:space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {t('reports_title')}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              v2.4
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {t('reports_sub')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>{t('export_csv')}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t('print_report')}</span>
          </button>
        </div>
      </div>

      {/* Main Printable Dossier Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-emerald-950">{t('app_name')}</span>
              <span className="text-xs text-slate-400 font-mono">{t('audit_report')}</span>
              {isDemoMode && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  {t('demo_badge')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('audit_sub')}
            </p>
          </div>
          <div className="text-right text-xs text-slate-400 font-mono">
            {t('generated_date', { date: new Date().toLocaleDateString() })}
          </div>
        </div>

        {/* 4 Summary Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-semibold uppercase">{t('total_acreage')}</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {summary?.totalAreaAcres?.toFixed(1) || fields.reduce((a, b) => a + b.area, 0).toFixed(1)} {t('ac')}
            </p>
            <p className="text-[11px] text-slate-400">{t('registered_plots', { count: fields.length })}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-semibold uppercase">{t('total_scans')}</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{scans.length}</p>
            <p className="text-[11px] text-slate-400">{t('diagnostic_checkpoints')}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-semibold uppercase">{t('avg_confidence')}</span>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">
              {summary?.averageConfidence || 90.2}%
            </p>
            <p className="text-[11px] text-slate-400">{t('vision_guard')}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-semibold uppercase">{t('inspections_needed')}</span>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">
              {fields.filter((f) => f.healthStatus === 'critical' || f.healthStatus === 'moderate').length}
            </p>
            <p className="text-[11px] text-slate-400">{t('active_high_risk')}</p>
          </div>
        </div>

        {/* Disease Condition Distribution */}
        {summary?.conditionsDistribution && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {t('condition_breakdown')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(summary.conditionsDistribution).map(([cond, count]: any) => (
                <div
                  key={cond}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-slate-800">{tDisease(cond)}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (count / (scans.length || 1)) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-600">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Table of Recent Records */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {t('detailed_audit')}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 font-semibold">{t('date_col')}</th>
                  <th className="py-2.5 font-semibold">{t('field_col')}</th>
                  <th className="py-2.5 font-semibold">{t('crop_col')}</th>
                  <th className="py-2.5 font-semibold">{t('condition_col')}</th>
                  <th className="py-2.5 font-semibold">{t('severity_col')}</th>
                  <th className="py-2.5 font-semibold">{t('confidence_col')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {scans.slice(0, 6).map((s) => (
                  <tr key={s.id}>
                    <td className="py-2.5 font-mono text-slate-500">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 font-medium">{s.fieldName}</td>
                    <td className="py-2.5">{tCrop(s.cropType)}</td>
                    <td className="py-2.5 font-bold text-slate-900">{tDisease(s.predictedCondition)}</td>
                    <td className="py-2.5 font-semibold">{tSeverity(s.severity)}</td>
                    <td className="py-2.5 font-mono">{s.confidence.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification and Regulatory Statement */}
        <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed">
          <p>
            {t('compliance_notice')}
          </p>
        </div>
      </div>
    </div>
  );
};
