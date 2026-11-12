import React from 'react';
import { Award, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

interface ScoreGaugeProps {
  score: number;
  requiresHumanReview: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, requiresHumanReview, size = 'md' }) => {
  const getColor = (s: number) => {
    if (s >= 80) return { stroke: '#18B6A4', text: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', label: 'Strong Alignment' };
    if (s >= 50) return { stroke: '#F59E0B', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Partial Alignment' };
    return { stroke: '#EF4444', text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', label: 'Significant Gaps' };
  };

  const color = getColor(score);
  const strokeWidth = size === 'lg' ? 10 : 8;
  const radius = size === 'lg' ? 60 : 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const dimension = (radius + strokeWidth) * 2;

  return (
    <div className={`flex items-center gap-6 p-6 rounded-2xl border ${color.border} ${color.bg} shadow-xs`}>
      <div className="relative flex items-center justify-center shrink-0">
        <svg width={dimension} height={dimension} className="rotate-[-90deg]">
          {/* Background circle */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-extrabold ${size === 'lg' ? 'text-3xl' : 'text-2xl'} ${color.text} tracking-tight`}>
            {score}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 -mt-1">/ 100</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${color.bg} ${color.text} border ${color.border}`}>
            {color.label}
          </span>
          {requiresHumanReview && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Human Review Needed
            </span>
          )}
        </div>
        <h4 className="text-base font-bold text-slate-900 tracking-tight">AI Objective Verification Score</h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          Mathematically computed across all verified milestone criteria weights. Reflects strict visual and static code evidence.
        </p>
      </div>
    </div>
  );
};
