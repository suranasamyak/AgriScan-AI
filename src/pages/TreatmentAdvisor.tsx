import React, { useState } from 'react';
import {
  ShieldAlert,
  Sprout,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Leaf,
  Droplets,
  DollarSign,
  FileText,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { TreatmentRecommendation } from '../types';

export const TreatmentAdvisor: React.FC = () => {
  const { fields, activeField } = useApp();

  const [cropType, setCropType] = useState(activeField?.cropType || 'Tomato');
  const [suspectedDisease, setSuspectedDisease] = useState('Early Blight');
  const [area, setArea] = useState('3.5');
  const [growthStage, setGrowthStage] = useState('Vegetative');
  const [approach, setApproach] = useState('Integrated Pest Management (IPM)');
  const [localChemicalPrice, setLocalChemicalPrice] = useState('850');
  const [localBioPrice, setLocalBioPrice] = useState('320');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<TreatmentRecommendation | null>(null);

  const crops = ['Tomato', 'Cotton', 'Soybean', 'Wheat', 'Rice', 'Potato', 'Maize', 'Chilli'];
  const stages = ['Seedling / Nursery', 'Vegetative Flush', 'Flowering / Square Formation', 'Fruit / Pod Setting', 'Maturity & Pre-Harvest'];

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
          Treatment Decision Support & Cost Calculator
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
            IPM Framework
          </span>
        </h2>
        <p className="text-xs text-slate-500">
          Integrated Pest Management recommendations balancing biological efficacy, environmental safety, and farmer expenditure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Treatment Parameters Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-700" />
            Field & Price Parameters
          </h3>

          <form onSubmit={handleGeneratePlan} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Crop Type
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:border-emerald-600"
              >
                {crops.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Target / Suspected Pathogen
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
                  Field Area (Acres)
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
                  Growth Stage
                </label>
                <select
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:border-emerald-600"
                >
                  {stages.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-700 block">
                Local Input Market Prices (INR)
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-500 font-medium">
                    Chemical Fungicide (₹/L or Kg)
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
                    Bio-Agent / Neem (₹/L or Kg)
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
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? 'Evaluating IPM Strategy...' : 'Generate Decision Support Plan'}
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
                    {plan.crop} • {plan.disease} Management Plan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Growth Stage: {plan.growthStage} • Coverage: {plan.costEstimator.acreage} Acres
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  KVK Standard Package
                </span>
              </div>

              {/* Estimated Costs Comparison Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-200/70 space-y-2">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
                  Estimated Intervention Cost Comparison
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
                    <span className="text-[10px] text-slate-500 font-semibold">Biological / Bio</span>
                    <p className="text-base font-extrabold text-emerald-700 mt-0.5">
                      ₹{plan.costEstimator.bioApproachCostINR}
                    </p>
                    <p className="text-[9px] text-emerald-600">Zero residue</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
                    <span className="text-[10px] text-slate-500 font-semibold">Integrated (IPM)</span>
                    <p className="text-base font-extrabold text-teal-700 mt-0.5">
                      ₹{plan.costEstimator.integratedApproachCostINR}
                    </p>
                    <p className="text-[9px] text-teal-600">Recommended</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
                    <span className="text-[10px] text-slate-500 font-semibold">Full Chemical</span>
                    <p className="text-base font-extrabold text-slate-800 mt-0.5">
                      ₹{plan.costEstimator.chemicalApproachCostINR}
                    </p>
                    <p className="text-[9px] text-amber-700">Strict PHI required</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 pt-1">
                  Estimated spray volume required: ~{plan.costEstimator.estimatedWaterVolumeLiters} Liters water.
                </p>
              </div>

              {/* Three-Tier Strategy (Cultural, Bio, Chemical) */}
              <div className="space-y-3">
                {/* Cultural */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    Tier 1: Cultural & Agronomic Sanitization
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
                    Tier 2: Biological & Bio-Fungicide Control
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
                    Tier 3: Targeted Chemical Options (Threshold Exceeded)
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
                  Mandatory Safety & Environmental Buffer Guidelines
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
                Integrated Pest Management Advisor
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Configure your plot parameters on the left to compute realistic IPM dosage strategies, spray volume requirements, and cost estimates for your acreage.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
