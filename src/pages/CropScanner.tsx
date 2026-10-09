import React, { useState, useRef } from 'react';
import {
  Upload,
  ScanLine,
  Sprout,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Camera,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Scan } from '../types';
import { ConfidenceGuardBadge } from '../components/ConfidenceGuardBadge';

// Sample agricultural disease images with realistic SVG leaf textures for rapid hackathon testing
const SAMPLE_TEST_CASES = [
  {
    nameKey: 'Tomato Early Blight',
    crop: 'Tomato',
    symptom: 'Concentric target rings on lower leaves, yellow halo',
    svgColor: '#92400e',
    accentColor: '#ca8a04',
    lesionStyle: 'circles'
  },
  {
    nameKey: 'Cotton Bacterial Blight',
    crop: 'Cotton',
    symptom: 'Angular water-soaked spots bounded by veins, black vein arm',
    svgColor: '#1c1917',
    accentColor: '#451a03',
    lesionStyle: 'angular'
  },
  {
    nameKey: 'Soybean Asian Rust',
    crop: 'Soybean',
    symptom: 'Small brown pustules on leaf undersides, premature defoliation',
    svgColor: '#78350f',
    accentColor: '#d97706',
    lesionStyle: 'pustules'
  },
  {
    nameKey: 'Wheat Yellow Stripe Rust',
    crop: 'Wheat',
    symptom: 'Parallel linear yellow stripes on leaves, powdery rub-off',
    svgColor: '#ca8a04',
    accentColor: '#eab308',
    lesionStyle: 'stripes'
  },
  {
    nameKey: 'Healthy Tomato Leaf',
    crop: 'Tomato',
    symptom: 'Vibrant green, no spots, uniform chlorophyll',
    svgColor: '#15803d',
    accentColor: '#22c55e',
    lesionStyle: 'clean'
  }
];

function generateSampleImageDataUrl(testCase: typeof SAMPLE_TEST_CASES[0]): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = testCase.lesionStyle === 'clean' ? '#166534' : '#22543d';
  ctx.fillRect(0, 0, 400, 400);

  ctx.strokeStyle = '#48bb78';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(200, 380);
  ctx.bezierCurveTo(200, 200, 190, 100, 200, 20);
  ctx.stroke();

  ctx.lineWidth = 2.5;
  for (let y = 60; y < 360; y += 40) {
    ctx.beginPath();
    ctx.moveTo(200, y);
    ctx.lineTo(80, y - 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(200, y);
    ctx.lineTo(320, y - 30);
    ctx.stroke();
  }

  if (testCase.lesionStyle === 'circles') {
    for (const [cx, cy, r] of [[140, 160, 28], [270, 220, 36], [180, 280, 24]]) {
      ctx.fillStyle = 'rgba(234, 179, 8, 0.45)';
      ctx.beginPath();
      ctx.arc(cx, cy, r + 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (testCase.lesionStyle === 'angular') {
    ctx.fillStyle = '#451a03';
    for (const [x, y, w, h] of [[110, 120, 40, 30], [250, 180, 50, 40], [160, 240, 35, 25]]) {
      ctx.fillRect(x, y, w, h);
    }
  } else if (testCase.lesionStyle === 'pustules') {
    ctx.fillStyle = '#b45309';
    for (let i = 0; i < 40; i++) {
      const rx = 100 + (i * 37) % 200;
      const ry = 80 + (i * 47) % 240;
      ctx.beginPath();
      ctx.arc(rx, ry, 4 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (testCase.lesionStyle === 'stripes') {
    ctx.fillStyle = '#eab308';
    ctx.fillRect(150, 40, 8, 300);
    ctx.fillRect(170, 60, 6, 260);
    ctx.fillRect(230, 80, 10, 280);
    ctx.fillRect(255, 100, 7, 240);
  }

  return canvas.toDataURL('image/png');
}

export const CropScanner: React.FC<{ onNavigate?: (tab: any) => void }> = ({ onNavigate }) => {
  const { fields, activeField, isDemoMode, refreshData, t, tCrop, tDisease, tSymptom } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFieldId, setSelectedFieldId] = useState<string>(activeField?.id || '');
  const [cropType, setCropType] = useState<string>(activeField?.cropType || 'Tomato');
  const [symptomsEntered, setSymptomsEntered] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<Scan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const crops = ['Tomato', 'Cotton', 'Soybean', 'Wheat', 'Rice', 'Potato', 'Maize', 'Sugarcane', 'Chilli', 'Onion', 'Grape'];

  const getSeverityLabel = (sev: string) => {
    switch (sev) {
      case 'Severe':
        return t('severe');
      case 'Moderate':
        return t('moderate');
      case 'Mild':
        return t('mild');
      default:
        return t('none_healthy');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload a JPEG, PNG, or WebP crop image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Maximum supported size is 10 MB.');
      return;
    }

    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof SAMPLE_TEST_CASES[0]) => {
    const dataUrl = generateSampleImageDataUrl(sample);
    setImagePreview(dataUrl);
    setFileName(`${sample.nameKey.replace(/\s+/g, '_')}.png`);
    setCropType(sample.crop);
    setSymptomsEntered(sample.symptom);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) {
      setError('Please upload a leaf photograph or select a sample image above.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      const targetField = fields.find((f) => f.id === selectedFieldId) || fields[0];

      const res = await api.submitScan({
        fieldId: targetField?.id || 'unassigned',
        cropType,
        imageBase64: imagePreview,
        symptomsEntered,
        latitude: targetField?.latitude,
        longitude: targetField?.longitude,
        isDemoModeRequested: isDemoMode
      });

      setCurrentResult(res.scan);
      //await refreshData();
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please check network connectivity.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {t('nav_title_scanner')}
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
              Vision Model + Gemini Guard
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {t('scanner_subtitle')}
          </p>
        </div>

        {isDemoMode && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('judge_demo_active')}</span>
          </div>
        )}
      </div>

      {/* Main Analysis Workflow Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Input Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-700" />
              {t('leaf_image_input')}
            </h3>

            {/* Quick Sample Selector for Judging / Fast Demo */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                {t('quick_test_samples')}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {SAMPLE_TEST_CASES.map((sample) => (
                  <button
                    key={sample.nameKey}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="p-2 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50 text-left transition-all text-xs font-medium text-slate-800 cursor-pointer"
                  >
                    <span className="font-bold block truncate">{tDisease(sample.nameKey)}</span>
                    <span className="text-[10px] text-slate-500">{tCrop(sample.crop)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300/80 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer bg-emerald-50/20 hover:bg-emerald-50/40 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />

              {imagePreview ? (
                <div className="space-y-2">
                  <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative group">
                    <img
                      src={imagePreview}
                      alt="Crop Preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                      {t('click_to_change')}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-mono truncate">{fileName || 'Leaf Photo'}</p>
                </div>
              ) : (
                <div className="py-6 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {t('upload_box_title')}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {t('upload_box_sub')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Crop & Field Meta Controls */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    {t('crop_type')}
                  </label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:border-emerald-600"
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
                    {t('associate_field')}
                  </label>
                  <select
                    value={selectedFieldId}
                    onChange={(e) => setSelectedFieldId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="">{t('select_field')}</option>
                    {fields.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  {t('observed_symptoms_opt')}
                </label>
                <input
                  type="text"
                  placeholder={t('symptoms_placeholder')}
                  value={symptomsEntered}
                  onChange={(e) => setSymptomsEntered(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !imagePreview}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-emerald-900/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('analyzing_leaf')}</span>
                </>
              ) : (
                <>
                  <ScanLine className="w-4 h-4" />
                  <span>{t('execute_scan')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Diagnostic Results & Treatment Guidance */}
        <div className="lg:col-span-7 space-y-4">
          {currentResult ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5 animate-in fade-in">
              {/* Header result banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('diagnostic_diagnosis')}
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {tDisease(currentResult.predictedCondition)}
                  </h3>
                  {currentResult.scientificName && (
                    <p className="text-xs text-emerald-800 font-serif italic">
                      {t('pathogen')}: {currentResult.scientificName}
                    </p>
                  )}
                </div>

                <ConfidenceGuardBadge
                  confidence={currentResult.confidence}
                  status={currentResult.predictionStatus}
                  isDemo={currentResult.isDemo}
                />
              </div>

              {/* Confidence Guard Alert if uncertain */}
              {currentResult.predictionStatus === 'needs_confirmation' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    {t('confidence_guard_triggered')}
                  </div>
                  <p>
                    {t('confidence_guard_desc')}
                  </p>
                </div>
              )}

              {/* Core Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium">{t('severity')}</span>
                  <p
                    className={`text-base font-extrabold mt-0.5 ${
                      currentResult.severity === 'Severe'
                        ? 'text-rose-600'
                        : currentResult.severity === 'Moderate'
                        ? 'text-amber-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    {getSeverityLabel(currentResult.severity)}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium">{t('affected_leaf_area')}</span>
                  <p className="text-base font-extrabold text-slate-800 mt-0.5">
                    {currentResult.affectedAreaPercentage
                      ? `${currentResult.affectedAreaPercentage.toFixed(1)}%`
                      : 'N/A'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium">{t('model_pipeline')}</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5 truncate font-mono">
                    {currentResult.modelName}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium">{t('version')}</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5 font-mono">
                    {currentResult.modelVersion}
                  </p>
                </div>
              </div>

              {/* Identified Symptoms */}
              {currentResult.symptoms && currentResult.symptoms.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {t('observed_symptoms_heading')}
                  </h4>
                  <ul className="space-y-1.5">
                    {currentResult.symptoms.map((s, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-700 flex items-start gap-2 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/60"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{tSymptom(s)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alternative Diagnoses */}
              {currentResult.alternativeDiagnoses &&
                currentResult.alternativeDiagnoses.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      {t('differential_diagnoses')}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentResult.alternativeDiagnoses.map((alt, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                        >
                          <span className="text-slate-800 font-medium">{tDisease(alt.condition)}</span>
                          <span className="font-mono text-slate-500 text-[11px]">
                            {alt.confidence.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Recommended Steps (IPM) */}
              {currentResult.recommendedSteps && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {t('recommended_ipm_heading')}
                  </h4>
                  <div className="space-y-1.5">
                    {currentResult.recommendedSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Farmer Safety Guidance */}
              {currentResult.safetyGuidance && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>{t('farmer_safety_heading')}</span>
                  </div>
                  <ul className="text-xs text-amber-950 space-y-1 list-disc list-inside">
                    {currentResult.safetyGuidance.map((sg, idx) => (
                      <li key={idx}>{sg}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Link to Timeline & Treatment Advisor */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 font-mono">
                  {t('scan_id')} {currentResult.id}
                </span>
                <div className="flex items-center gap-3">
                  {onNavigate && (
                    <>
                      <button
                        onClick={() => onNavigate('treatment')}
                        className="font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        {t('calculate_treatment_cost')}
                      </button>
                      <button
                        onClick={() => onNavigate('timeline')}
                        className="font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        {t('track_in_timeline')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <ScanLine className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base text-slate-800">{t('diagnostic_station_ready')}</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {t('diagnostic_station_desc')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
