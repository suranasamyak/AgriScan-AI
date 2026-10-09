import React from 'react';
import { ShieldCheck, AlertTriangle, HelpCircle, CheckCircle } from 'lucide-react';

interface ConfidenceGuardBadgeProps {
  confidence: number;
  status: 'analysed' | 'needs_confirmation' | 'expert_reviewed' | 'demo_simulation';
  isDemo?: boolean;
}

export const ConfidenceGuardBadge: React.FC<ConfidenceGuardBadgeProps> = ({
  confidence,
  status,
  isDemo
}) => {
  const isHighConfidence = confidence >= 80;
  const isModerate = confidence >= 70 && confidence < 80;
  const isUncertain = confidence < 70 || status === 'needs_confirmation';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Confidence Pill */}
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          isUncertain
            ? 'bg-amber-100 text-amber-900 border border-amber-300'
            : isModerate
            ? 'bg-blue-100 text-blue-900 border border-blue-200'
            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
        }`}
      >
        {isUncertain ? (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        ) : (
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
        )}
        <span>Confidence: {confidence.toFixed(1)}%</span>
      </div>

      {/* Guard Status */}
      <div
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
          status === 'needs_confirmation'
            ? 'bg-rose-100 text-rose-800 border border-rose-200'
            : status === 'expert_reviewed'
            ? 'bg-purple-100 text-purple-800 border border-purple-200'
            : status === 'demo_simulation'
            ? 'bg-amber-50 text-amber-800 border border-amber-200'
            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}
      >
        <span>
          {status === 'needs_confirmation'
            ? 'Needs Confirmation (Low Confidence)'
            : status === 'expert_reviewed'
            ? 'Expert Reviewed'
            : status === 'demo_simulation'
            ? 'Demo Simulation'
            : 'AI Analysed'}
        </span>
      </div>

      {isDemo && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-white">
          DEMO DATA
        </span>
      )}
    </div>
  );
};
