import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  UploadCloud,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { DashboardNavbar } from '../../components/common/DashboardNavbar';
import { Sidebar } from '../../components/common/Sidebar';
import { EscrowNotice } from '../../components/common/EscrowNotice';
import { projectApi } from '../../services/projectApi';
import { Project, Milestone } from '../../types';

export const FreelancerProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<{ [projId: string]: Milestone[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const projs = await projectApi.getProjects();
        setProjects(projs);

        const msMap: { [id: string]: Milestone[] } = {};
        await Promise.all(
          projs.map(async (p) => {
            const ms = await projectApi.getMilestones(p.id);
            msMap[p.id] = ms;
          })
        );
        setProjectMilestones(msMap);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      <DashboardNavbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assigned Projects & Milestones</h1>
            <p className="text-xs text-slate-500">Submit deliverables and track AI verification audits for client approval.</p>
          </div>

          <EscrowNotice variant="banner" />

          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No Projects Assigned</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once a client creates a project and assigns it to your account, it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {projects.map((proj) => {
                const milestones = projectMilestones[proj.id] || [];

                return (
                  <div key={proj.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-slate-900">{proj.title}</h2>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                            {proj.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{proj.description}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Total Contract:</span>
                        <span className="text-lg font-extrabold text-slate-900">
                          ${Number(proj.budget).toFixed(2)} {proj.currency}
                        </span>
                      </div>
                    </div>

                    {/* Milestones */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                        Project Milestones ({milestones.length})
                      </h4>

                      <div className="space-y-3">
                        {milestones.map((m) => {
                          const isAuthorized = m.client_approval_status === 'authorized' || m.paypal_authorization_id;
                          const isApproved = m.client_approval_status === 'approved';
                          const isSubmitted = m.submission_status === 'submitted';

                          return (
                            <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-sm">{m.title}</span>
                                  <span className="font-bold text-blue-600 text-xs">
                                    ${Number(m.payment_amount).toFixed(2)} USD
                                  </span>
                                </div>
                                {m.requirements_text && (
                                  <p className="text-[11px] text-slate-500 line-clamp-1">{m.requirements_text}</p>
                                )}

                                <div className="flex items-center gap-2 pt-1 text-[11px]">
                                  {isApproved ? (
                                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      Approved & Paid
                                    </span>
                                  ) : isAuthorized ? (
                                    <span className="text-teal-700 font-semibold flex items-center gap-1">
                                      <ShieldCheck className="w-3.5 h-3.5" />
                                      PayPal Payment Authorized by Client
                                    </span>
                                  ) : (
                                    <span className="text-amber-700 font-medium">
                                      Pending Client Authorization
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {isSubmitted && (
                                  <Link
                                    to={`/freelancer/milestones/${m.id}/feedback`}
                                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 transition"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                    <span>AI Audit Report</span>
                                  </Link>
                                )}

                                {!isApproved && (
                                  <Link
                                    to={`/freelancer/milestones/${m.id}/submit`}
                                    className="inline-flex items-center gap-1.5 bg-[#356AE6] hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition"
                                  >
                                    <UploadCloud className="w-3.5 h-3.5" />
                                    <span>{isSubmitted ? 'Resubmit Deliverable' : 'Submit Deliverable'}</span>
                                  </Link>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
