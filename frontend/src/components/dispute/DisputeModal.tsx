import React, { useState } from 'react';
import { Scale, AlertCircle, Loader2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { aiApi } from '../../services/aiApi';
import { Milestone, Dispute } from '../../types';

interface DisputeModalProps {
  milestone: Milestone;
  isOpen: boolean;
  onClose: () => void;
  onDisputeCreated?: (dispute: Dispute) => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  milestone,
  isOpen,
  onClose,
  onDisputeCreated,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultDispute, setResultDispute] = useState<Dispute | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a detailed explanation of your concern.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const dispute = await aiApi.createDispute(milestone.id, reason);
      setResultDispute(dispute);
      if (onDisputeCreated) onDisputeCreated(dispute);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to initiate dispute mediation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">AI Dispute & Revision Mediation</h3>
              <p className="text-xs text-slate-500">Neutral Analysis &bull; Scope Verification</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">
            &times;
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!resultDispute ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-900 block">Milestone: {milestone.title}</span>
              <p className="text-slate-500">
                The AI Dispute Assistant acts as an objective mediator. It compares your stated rejection feedback against the initial project agreement and submitted deliverables to find constructive resolutions without legal escalation.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Explain what requirements were not met or require modification:
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                required
                placeholder="E.g., The mobile navigation drawer fails to expand on smaller screen sizes (375px width), and the CTA button is partially clipped."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-teal-300" />}
                <span>Generate Neutral AI Mediation</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>AI Objective Mediation Summary</span>
              </div>
              <p className="text-xs text-purple-900 leading-relaxed">
                {resultDispute.ai_summary}
              </p>
            </div>

            {resultDispute.disagreements && resultDispute.disagreements.length > 0 && (
              <div className="space-y-1.5">
                <h5 className="font-semibold text-xs text-slate-900">Points of Divergence:</h5>
                <ul className="text-xs space-y-1 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {resultDispute.disagreements.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold">&bull;</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {resultDispute.suggested_revisions && resultDispute.suggested_revisions.length > 0 && (
              <div className="space-y-1.5">
                <h5 className="font-semibold text-xs text-slate-900">Recommended Actionable Revisions:</h5>
                <ul className="text-xs space-y-1 text-slate-700 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200">
                  {resultDispute.suggested_revisions.map((rev, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{rev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={onClose}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md transition"
              >
                Close & Return to Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
