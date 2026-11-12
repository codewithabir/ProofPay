import React, { useState, useEffect } from 'react';
import { Scale, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { DashboardNavbar } from '../../components/common/DashboardNavbar';
import { Sidebar } from '../../components/common/Sidebar';
import { aiApi } from '../../services/aiApi';
import { Dispute } from '../../types';

export const ClientDisputes: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDisputes = async () => {
      try {
        const data = await aiApi.listDisputes();
        setDisputes(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadDisputes();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      <DashboardNavbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Scale className="w-6 h-6 text-purple-600" />
              <span>AI Dispute & Mediation Assistant</span>
            </h1>
            <p className="text-xs text-slate-500">
              Objective, evidence-backed mediation to resolve deliverable disagreements without escalating to legal arbitration.
            </p>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              Loading disputes...
            </div>
          ) : disputes.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <Scale className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No Open Disputes</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All projects are proceeding smoothly without contested milestones.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {disputes.map((d) => (
                <div key={d.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-semibold text-slate-500">
                      Dispute ID: <strong className="font-mono text-slate-800">{d.id.slice(0, 8)}</strong>
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      Status: {d.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-700 block">Client Feedback:</span>
                    <p className="text-slate-600 italic">"{d.client_reason}"</p>
                  </div>

                  {d.ai_summary && (
                    <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-purple-900">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>AI Neutral Mediation Summary</span>
                      </div>
                      <p className="text-purple-900 leading-relaxed">{d.ai_summary}</p>
                    </div>
                  )}

                  {d.disagreements && d.disagreements.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <span className="font-bold text-slate-800">Points of Divergence:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                        {d.disagreements.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {d.suggested_revisions && d.suggested_revisions.length > 0 && (
                    <div className="space-y-1 text-xs bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200">
                      <span className="font-bold text-emerald-900 block">Recommended Actionable Revisions:</span>
                      <ul className="space-y-1 text-emerald-800">
                        {d.suggested_revisions.map((rev, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{rev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
