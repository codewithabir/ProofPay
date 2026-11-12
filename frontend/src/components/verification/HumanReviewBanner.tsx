import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface HumanReviewBannerProps {
  limitations?: string[];
  issues?: string[];
}

export const HumanReviewBanner: React.FC<HumanReviewBannerProps> = ({ limitations = [], issues = [] }) => {
  return (
    <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-5 text-amber-900 space-y-3 shadow-xs">
      <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
        <span>Human Review & Dynamic Verification Notice</span>
      </div>
      <p className="text-xs text-amber-900 leading-relaxed">
        The AI Verification Engine evaluated visible layouts and static code patterns. A static screenshot or source component alone cannot guarantee interactive state transitions, live database persistence, or third-party API reliability.
      </p>

      {issues.length > 0 && (
        <div className="bg-white/80 p-3 rounded-lg border border-amber-200 text-xs space-y-1">
          <span className="font-semibold text-amber-950 block">Potential Inconsistencies Detected:</span>
          <ul className="list-disc list-inside space-y-0.5 text-amber-900">
            {issues.map((iss, i) => (
              <li key={i}>{iss}</li>
            ))}
          </ul>
        </div>
      )}

      {limitations.length > 0 && (
        <div className="text-[11px] text-amber-800">
          <span className="font-semibold">Verification Scope Limitation: </span>
          {limitations[0]}
        </div>
      )}
    </div>
  );
};
