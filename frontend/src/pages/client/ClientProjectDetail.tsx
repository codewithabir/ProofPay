import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FolderGit2,
  Plus,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  FileCheck2,
  DollarSign,
  Calendar,
  Clock,
  Sparkles,
  Scale,
  RefreshCw,
  Loader2,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { DashboardNavbar } from '../../components/common/DashboardNavbar';
import { Sidebar } from '../../components/common/Sidebar';
import { EscrowNotice } from '../../components/common/EscrowNotice';
import { PayPalAuthModal } from '../../components/payment/PayPalAuthModal';
import { DisputeModal } from '../../components/dispute/DisputeModal';
import { projectApi } from '../../services/projectApi';
import { aiApi } from '../../services/aiApi';
import { Project, Milestone } from '../../types';

export const ClientProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedMilestoneForAuth, setSelectedMilestoneForAuth] = useState<Milestone | null>(null);
  const [selectedMilestoneForDispute, setSelectedMilestoneForDispute] = useState<Milestone | null>(null);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);

  // Add milestone form
  const [mTitle, setMTitle] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mReqs, setMReqs] = useState('');
  const [mAmount, setMAmount] = useState('100');
  const [submittingM, setSubmittingM] = useState(false);

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;
    try {
      const [p, ms] = await Promise.all([
        projectApi.getProject(id),
        projectApi.getMilestones(id),
      ]);
      setProject(p);
      setMilestones(ms);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !mTitle.trim()) return;
    setSubmittingM(true);
    try {
      await projectApi.createMilestone(id, {
        title: mTitle,
        description: mDesc,
        requirements_text: mReqs,
        payment_amount: Number(mAmount),
        currency: 'USD',
      });
      setIsAddMilestoneOpen(false);
      setMTitle('');
      setMDesc('');
      setMReqs('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add milestone');
    } finally {
      setSubmittingM(false);
    }
  };

  const handleApproveMilestone = async (milestoneId: string) => {
    setActionLoading(milestoneId);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await projectApi.approveMilestone(milestoneId);
      setActionSuccess(`Payment of approved milestone successfully captured! Capture ID: ${res.paypal_capture_id || 'CAPTURED'}`);
      loadData();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Failed to capture milestone payment');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
        <DashboardNavbar />
        <div className="p-12 text-center text-xs text-slate-400">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
        <DashboardNavbar />
        <div className="p-12 text-center text-xs text-slate-400">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      <DashboardNavbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Breadcrumb & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Link to="/client/projects" className="hover:text-blue-600 transition">Projects</Link>
                <span>/</span>
                <span className="font-semibold text-slate-800">{project.title}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.title}</h1>
            </div>

            <button
              onClick={() => setIsAddMilestoneOpen(true)}
              className="inline-flex items-center gap-1.5 bg-[#356AE6] hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Milestone</span>
            </button>
          </div>

          {actionSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {actionError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Project Details Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Assigned Freelancer</span>
                <span className="font-bold text-slate-900 text-sm">{project.freelancer?.full_name || 'Unassigned'}</span>
                <span className="text-slate-500 block">{project.freelancer?.email}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Project Budget</span>
                <span className="font-bold text-slate-900 text-sm">${Number(project.budget).toFixed(2)} {project.currency}</span>
                <span className="text-teal-600 font-semibold block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  PayPal Orders v2 Protected
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Status</span>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-block">
                  {project.status}
                </span>
              </div>
            </div>

            {project.description && (
              <p className="text-xs text-slate-600 pt-3 border-t border-slate-100 leading-relaxed">
                {project.description}
              </p>
            )}

            {/* Criteria Requirements List */}
            {project.requirements && project.requirements.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">Agreed Criteria Checklist (Evaluated by AI Engine):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {project.requirements.map((req) => (
                    <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{req.title}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {req.category}
                        </span>
                      </div>
                      {req.description && <p className="text-[11px] text-slate-500">{req.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <EscrowNotice variant="banner" />

          {/* Milestones List */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base tracking-tight">Milestones ({milestones.length})</h3>

            <div className="space-y-4">
              {milestones.map((m) => {
                const isAuthorized = m.client_approval_status === 'authorized' || m.paypal_authorization_id;
                const isApproved = m.client_approval_status === 'approved';
                const hasSubmission = m.submission_status === 'submitted';

                return (
                  <div key={m.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 hover:border-slate-300 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-base">{m.title}</h4>
                          <span className="font-extrabold text-blue-600 text-sm">
                            ${Number(m.payment_amount).toFixed(2)} {m.currency}
                          </span>
                        </div>
                        {m.description && <p className="text-xs text-slate-500 mt-1">{m.description}</p>}
                      </div>

                      {/* Workflow Status Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {isApproved ? (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Captured & Approved
                          </span>
                        ) : isAuthorized ? (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            PayPal Authorized
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            Pending Authorization
                          </span>
                        )}

                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          m.ai_verification_status === 'verified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : m.ai_verification_status === 'flagged_human_review'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          AI Status: {m.ai_verification_status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Expiry metadata if authorized */}
                    {m.authorization_expires_at && (
                      <div className="text-[11px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center justify-between">
                        <span>PayPal Auth ID: <strong className="font-mono text-slate-700">{m.paypal_authorization_id}</strong></span>
                        <span>Expires: <strong className="text-amber-600 font-mono">{new Date(m.authorization_expires_at).toLocaleDateString()}</strong></span>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {/* If not yet authorized, show PayPal authorization trigger */}
                        {!isAuthorized && !isApproved && (
                          <button
                            onClick={() => setSelectedMilestoneForAuth(m)}
                            className="flex items-center gap-1.5 bg-[#0070BA] hover:bg-[#003087] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Authorize with PayPal</span>
                          </button>
                        )}

                        {/* View AI Verification Report button */}
                        <Link
                          to={`/client/milestones/${m.id}/report`}
                          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-300 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>Inspect AI Report</span>
                        </Link>

                        {/* AI Dispute Assistant */}
                        <button
                          onClick={() => setSelectedMilestoneForDispute(m)}
                          className="flex items-center gap-1.5 text-slate-500 hover:text-purple-600 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-purple-50 transition"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>AI Dispute Assistant</span>
                        </button>
                      </div>

                      {/* Approve / Capture Button if authorized & submitted */}
                      {isAuthorized && !isApproved && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveMilestone(m.id)}
                            disabled={actionLoading === m.id}
                            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition disabled:opacity-50"
                          >
                            {actionLoading === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            <span>Approve & Capture Payment (${Number(m.payment_amount).toFixed(2)})</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Milestone Modal */}
          {isAddMilestoneOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base">Add Project Milestone</h3>
                  <button onClick={() => setIsAddMilestoneOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                    &times;
                  </button>
                </div>

                <form onSubmit={handleCreateMilestone} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Milestone Title</label>
                    <input
                      type="text"
                      required
                      value={mTitle}
                      onChange={(e) => setMTitle(e.target.value)}
                      placeholder="E.g., Milestone 1: Landing Page & Navigation"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={mDesc}
                      onChange={(e) => setMDesc(e.target.value)}
                      placeholder="Scope details for this milestone"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Specific Requirements Checklist</label>
                    <textarea
                      rows={3}
                      value={mReqs}
                      onChange={(e) => setMReqs(e.target.value)}
                      placeholder="- Responsive hero banner&#10;- Mobile navigation drawer&#10;- Live HTTPS deployment"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Amount ($ USD)</label>
                    <input
                      type="number"
                      required
                      value={mAmount}
                      onChange={(e) => setMAmount(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsAddMilestoneOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingM}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md transition disabled:opacity-50"
                    >
                      {submittingM ? 'Adding...' : 'Add Milestone'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* PayPal Auth Modal */}
          {selectedMilestoneForAuth && (
            <PayPalAuthModal
              milestone={selectedMilestoneForAuth}
              isOpen={Boolean(selectedMilestoneForAuth)}
              onClose={() => setSelectedMilestoneForAuth(null)}
              onSuccess={loadData}
            />
          )}

          {/* Dispute Modal */}
          {selectedMilestoneForDispute && (
            <DisputeModal
              milestone={selectedMilestoneForDispute}
              isOpen={Boolean(selectedMilestoneForDispute)}
              onClose={() => setSelectedMilestoneForDispute(null)}
              onDisputeCreated={loadData}
            />
          )}
        </main>
      </div>
    </div>
  );
};
