import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, FileCode, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { CriteriaItem, CriteriaStatus } from '../../types';

interface CriteriaCardProps {
  item: CriteriaItem;
}

export const CriteriaCard: React.FC<CriteriaCardProps> = ({ item }) => {
  const getStatusBadge = (status: CriteriaStatus) => {
    switch (status) {
      case 'fulfilled':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: CheckCircle2,
          text: 'Fulfilled',
        };
      case 'partially_fulfilled':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: AlertTriangle,
          text: 'Partially Fulfilled',
        };
      case 'missing':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: XCircle,
          text: 'Missing',
        };
      case 'unverifiable':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: HelpCircle,
          text: 'Unverifiable in Static Context',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: HelpCircle,
          text: status,
        };
    }
  };

  const badge = getStatusBadge(item.status);
  const Icon = badge.icon;
  const confPercent = Math.round(item.confidence * 100);

  const getEvidenceIcon = (ev: string) => {
    if (ev.endsWith('.png') || ev.endsWith('.jpg') || ev.endsWith('.webp')) return ImageIcon;
    if (ev.endsWith('.tsx') || ev.endsWith('.ts') || ev.endsWith('.jsx') || ev.endsWith('.js') || ev.endsWith('.py') || ev.endsWith('.html')) return FileCode;
    return LinkIcon;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h5 className="font-semibold text-slate-900 text-sm">{item.requirement}</h5>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{badge.text}</span>
          </span>
          <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            {confPercent}% Conf.
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
        <span className="font-semibold text-slate-700">Audit Finding: </span>
        {item.explanation}
      </p>

      {item.evidence && item.evidence.length > 0 && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span className="font-medium text-[11px] text-slate-400 mr-1">Evidence Evaluated:</span>
          {item.evidence.map((ev, i) => {
            const EvIcon = getEvidenceIcon(ev);
            return (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono border border-slate-200">
                <EvIcon className="w-3 h-3 text-slate-500" />
                <span>{ev}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
