import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface EscrowNoticeProps {
  variant?: 'banner' | 'card';
  expiryDate?: string;
}

export const EscrowNotice: React.FC<EscrowNoticeProps> = ({ variant = 'card', expiryDate }) => {
  if (variant === 'banner') {
    return (
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 text-xs text-amber-900 rounded-r-lg flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">PayPal Authorization & Trust Model: </span>
          ProofPay is an AI-powered verification platform, not an escrow service. Client authorization holds funds for up to 29 days on PayPal without capturing until deliverable verification and explicit client approval.
          {expiryDate && <span className="block mt-1 font-mono text-amber-800">Auth Expiry: {new Date(expiryDate).toLocaleDateString()}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2 text-teal-400 font-semibold text-sm">
        <Info className="w-4 h-4" />
        <span>ProofPay Trust & Payment Guarantee</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">
        ProofPay utilizes <span className="text-white font-medium">PayPal Orders API v2</span> with two-phase authorization.
        Payments are authorized upfront by the client but are <span className="text-white font-medium">never captured</span> until the freelancer submits evidence, the AI analyzes compliance, and the client approves the milestone.
      </p>
      {expiryDate && (
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>PayPal Authorization Expiry:</span>
          <span className="font-mono text-amber-400 font-medium">{new Date(expiryDate).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
};
