import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  FileCheck2,
  Scale,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Send,
  Eye
} from 'lucide-react';
import { DashboardNavbar } from '../../components/common/DashboardNavbar';
import { Sidebar } from '../../components/common/Sidebar';
import { ScoreGauge } from '../../components/verification/ScoreGauge';
import { CriteriaCard } from '../../components/verification/CriteriaCard';
import { HumanReviewBanner } from '../../components/verification/HumanReviewBanner';
import { DisputeModal } from '../../components/dispute/DisputeModal';
import { aiApi } from '../../services/aiApi';
import { projectApi } from '../../services/projectApi';
import { VerificationReport, Milestone } from '../../types';

export const ClientReportView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Approval / Revision actions
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      const m = await projectApi.getMilestone(id);
      setMilestone(m);

      try {
        const r = await aiApi.getVerificationReport(id);
        setReport(r);
      } catch (e: any) {
        // If report not yet run, try to trigger verification automatically if submission exists
        if (m.submission_status === 'submitted') {
          setVerifying(true);
          try {
            const newReport = await aiApi.verifyMilestone(id);
            setReport(newReport);
          } catch (verErr: any) {
            setError(verErr.response?.data?.detail || 'No submission uploaded yet to verify.');
          } finally {
            setVerifying(false);
          }
        } else {
          setError('Freelancer has not yet submitted deliverable assets for this milestone.');
        }
      }
    } catch {
      setError('Milestone not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await projectApi.approveMilestone(id);
      setActionSuccess(`Milestone approved! PayPal capture completed: ${res.paypal_capture_id || 'CAPTURED'}`);
      const updated = await projectApi.getMilestone(id);
      setMilestone(updated);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to capture milestone payment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !revisionFeedback.trim()) return;
    setActionLoading(true);
    try {
      await projectApi.requestRevision(id, revisionFeedback);
      setActionSuccess('Revision request sent to freelancer with your comments.');
      setIsRevisionOpen(false);
      setRevisionFeedback('');
      const updated = await projectApi.getMilestone(id);
      setMilestone(updated);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to request revision.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunReverification = async () => {
    if (!id) return;
    setVerifying(true);
    setError(null);
    try {
      const newReport = await aiApi.verifyMilestone(id);
      setReport(newReport);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to run verification analysis.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      <DashboardNavbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Project</span>
              </button>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <span>AI Verification Audit Report</span>
              </h1>
              <p className="text-xs text-slate-500">
                Milestone: <strong className="text-slate-800">{milestone?.title}</strong> &bull; Amount: <strong className="text-slate-800">${Number(milestone?.payment_amount || 0).toFixed(2)} USD</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunReverification}
                disabled={verifying}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-300 transition disabled:opacity-50"
              >
                {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5 text-blue-600" />}
                <span>Re-Run AI Audit</span>
              </button>
            </div>
          </div>

          {actionSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading || verifying ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">Evaluating Deliverable Evidence...</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                AI Verification Engine is inspecting submitted screenshots, source components, and criteria weights.
              </p>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Score Gauge */}
              <ScoreGauge
                score={Number(report.overall_score)}
                requiresHumanReview={report.requires_human_review}
                size="lg"
              />

              {/* Summary Box */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
                <span className="font-bold text-slate-900 block text-sm">Executive Verification Summary</span>
                <p className="text-slate-600 leading-relaxed">{report.summary}</p>
              </div>

              {/* Human Review Banner if flagged */}
              {report.requires_human_review && (
                <HumanReviewBanner
                  limitations={report.details?.limitations}
                  issues={report.details?.potential_issues}
                />
              )}

              {/* Criteria List Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                    Audited Criteria Checklist ({report.details?.criteria.length || 0})
                  </h3>
                  <span className="text-xs text-slate-400">Strict Evidence Matching</span>
                </div>

                <div className="space-y-3">
                  {report.details?.criteria.map((item, idx) => (
                    <CriteriaCard key={idx} item={item} />
                  ))}
                </div>
              </div>

              {/* Missing Requirements / Recommendations */}
              {report.details && (report.details.missing_requirements.length > 0 || report.details.recommendations.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.details.missing_requirements.length > 0 && (
                    <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 text-xs space-y-2">
                      <span className="font-bold text-rose-900 block">Missing Requirements:</span>
                      <ul className="list-disc list-inside space-y-1 text-rose-800">
                        {report.details.missing_requirements.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {report.details.recommendations.length > 0 && (
                    <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs space-y-2">
                      <span className="font-bold text-blue-900 block">AI Strategic Recommendations:</span>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        {report.details.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Client Decision Hub */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Client Decision Hub</h3>
                    <p className="text-xs text-slate-500">
                      As the client, you make the final financial decision. Approving will capture the authorized PayPal payment.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Payment Amount:</span>
                    <span className="font-extrabold text-slate-900 text-base">
                      ${Number(milestone?.payment_amount || 0).toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {milestone?.client_approval_status === 'approved' ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>This milestone deliverable has been approved and payment capture was executed.</span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setIsDisputeOpen(true)}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 transition"
                    >
                      <Scale className="w-4 h-4" />
                      <span>AI Dispute Assistant</span>
                    </button>

                    <button
                      onClick={() => setIsRevisionOpen(true)}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl border border-amber-300 text-amber-800 hover:bg-amber-50 transition"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Request Revisions</span>
                    </button>

                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      <span>Approve & Capture PayPal Payment</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">Awaiting Deliverable Submission</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once the freelancer uploads code, screenshots, or demo URLs, the AI engine will audit them here.
              </p>
            </div>
          )}

          {/* Revision Modal */}
          {isRevisionOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base">Request Revision</h3>
                  <button onClick={() => setIsRevisionOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                    &times;
                  </button>
                </div>

                <form onSubmit={handleRequestRevision} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Explain what changes are needed to satisfy milestone requirements:
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={revisionFeedback}
                      onChange={(e) => setRevisionFeedback(e.target.value)}
                      placeholder="Please adjust the mobile navigation drawer padding and fix the hero CTA alignment on mobile viewports."
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsRevisionOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md transition disabled:opacity-50"
                    >
                      {actionLoading ? 'Sending...' : 'Send Revision Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Dispute Modal */}
          {isDisputeOpen && milestone && (
            <DisputeModal
              milestone={milestone}
              isOpen={isDisputeOpen}
              onClose={() => setIsDisputeOpen(false)}
              onDisputeCreated={loadData}
            />
          )}
        </main>
      </div>
    </div>
  );
};
