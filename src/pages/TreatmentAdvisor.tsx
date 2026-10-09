import React, { useState } from 'react';
import {
  ShieldAlert,
  Sprout,
  Calculator,
  AlertTriangle,
  Leaf,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { TreatmentRecommendation } from '../types';

export const TreatmentAdvisor: React.FC = () => {
  const { fields, activeField, t, tCrop, tDisease, tStage, tApproach } = useApp();

  const [cropType, setCropType] = useState(activeField?.cropType || 'Tomato');
  const [suspectedDisease, setSuspectedDisease] = useState('Early Blight');
  const [area, setArea] = useState('3.5');
  const [growthStage, setGrowthStage] = useState('Vegetative Flush');
  const [approach, setApproach] = useState('Integrated Pest Management (IPM)');
  const [localChemicalPrice, setLocalChemicalPrice] = useState('850');
  const [localBioPrice, setLocalBioPrice] = useState('320');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<TreatmentRecommendation | null>(null);

  const crops = ['Tomato', 'Cotton', 'Soybean', 'Wheat', 'Rice', 'Potato', 'Maize', 'Chilli', 'Sugarcane', 'Onion', 'Grape'];
  const stages = [
    'Seedling / Nursery',
    'Vegetative Flush',
    'Flowering / Square Formation',
    'Fruit / Pod Setting',
    'Maturity & Pre-Harvest'
  ];

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.getTreatmentPlan({
        cropType,
        suspectedDisease,
        area: parseFloat(area) || 1,
        growthStage,
        approach,
        localChemicalPrice: parseFloat(localChemicalPrice) || 850,
        localBioPrice: parseFloat(localBioPrice) || 320
      });
      setPlan(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {t('treatment_title')}
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
            {t('badge_ipm')}
          </span>
        </h2>
        <p className="text-xs text-slate-500">
          {t('treatment_sub')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Treatment Parameters Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-700" />
            {t('parameters_heading')}
          </h3>

          <form onSubmit={handleGeneratePlan} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                {t('crop_type_label')}
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                {crops.map((c) => (
                  <option key={c} value={c}>
                    {tCrop(c)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                {t('target_pathogen')}
              </label>
              <input
                type="text"
                value={suspectedDisease}
                onChange={(e) => setSuspectedDisease(e.target.value)}
                placeholder="e.g. Early Blight / Alternaria"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  {t('field_area_acres')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  {t('growth_stage')}
                </label>
                <select
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:border-emerald-600 cursor-pointer"
                >
                  {stages.map((s) => (
                    <option key={s} value={s}>
                      {tStage(s)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-700 block">
                {t('local_prices_inr')}
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-500 font-medium">
                    {t('chemical_price_label')}
                  </label>
                  <input
                    type="number"
                    value={localChemicalPrice}
                    onChange={(e) => setLocalChemicalPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-medium">
                    {t('bio_price_label')}
                  </label>
                  <input
                    type="number"
                    value={localBioPrice}
                    onChange={(e) => setLocalBioPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? t('evaluating_plan') : t('generate_plan_btn')}
            </button>
          </form>
        </div>

        {/* Right: Multi-Tier Strategy & Cost Output */}
        <div className="lg:col-span-7 space-y-5">
          {plan ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    {tCrop(plan.crop)} • {tDisease(plan.disease)}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('growth_stage')}: {tStage(plan.growthStage)} • {plan.costEstimator.acreage} {t('acres')}
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {t('kvk_standard_badge')}
                </span>
              </div>

              {/* Estimated Costs Comparison Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-200/70 space-y-2">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
                  {t('cost_comparison_title')}
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
                    <span className="text-[10px] text-slate-500 font-semibold">{t('bio_approach')}</span>
                    <p className="text-base font-extrabold text-emerald-700 mt-0.5">
                      ₹{plan.costEstimator.bioApproachCostINR}
                    </p>
                    <p className="text-[9px] text-emerald-600">{t('zero_residue')}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
                    <span className="text-[10px] text-slate-500 font-semibold">{t('integrated_ipm')}</span>
                    <p className="text-base font-extrabold text-teal-700 mt-0.5">
                      ₹{plan.costEstimator.integratedApproachCostINR}
                    </p>
                    <p className="text-[9px] text-teal-600">{t('recommended')}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
                    <span className="text-[10px] text-slate-500 font-semibold">{t('full_chemical')}</span>
                    <p className="text-base font-extrabold text-slate-800 mt-0.5">
                      ₹{plan.costEstimator.chemicalApproachCostINR}
                    </p>
                    <p className="text-[9px] text-amber-700">{t('strict_phi')}</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 pt-1">
                  {t('spray_volume', { liters: plan.costEstimator.estimatedWaterVolumeLiters })}
                </p>
              </div>

              {/* Three-Tier Strategy (Cultural, Bio, Chemical) */}
              <div className="space-y-3">
                {/* Cultural */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    {t('tier1_cultural')}
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {plan.managementStrategy.cultural.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Biological */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-teal-600" />
                    {t('tier2_biological')}
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {plan.managementStrategy.biological.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Chemical */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    {t('tier3_chemical')}
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {plan.managementStrategy.chemical.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Farmer Safety Precautions */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950 text-xs space-y-1.5">
                <span className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  {t('mandatory_safety')}
                </span>
                <ul className="list-disc list-inside space-y-0.5">
                  {plan.safetyPrecautions.map((sp, idx) => (
                    <li key={idx}>{sp}</li>
                  ))}
                </ul>
              </div>

              {/* KVK Notice */}
              <div className="text-[11px] text-slate-500 italic p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{plan.kvkNotice}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm space-y-3">
              <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">
                {t('advisor_ready_title')}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {t('advisor_ready_desc')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
