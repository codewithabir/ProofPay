import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  UploadCloud,
  ChevronRight
} from 'lucide-react';
import { DashboardNavbar } from '../../components/common/DashboardNavbar';
import { Sidebar } from '../../components/common/Sidebar';
import { EscrowNotice } from '../../components/common/EscrowNotice';
import { projectApi } from '../../services/projectApi';
import { paymentApi } from '../../services/paymentApi';
import { Project, Payment } from '../../types';

export const FreelancerDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projs, pays] = await Promise.all([
          projectApi.getProjects(),
          paymentApi.getHistory(),
        ]);
        setProjects(projs);
        setPayments(pays);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalCaptured = payments
    .filter((p) => p.status === 'captured')
    .reduce((acc, p) => acc + Number(p.amount), 0);

  const totalAuthorized = payments
    .filter((p) => p.status === 'authorized')
    .reduce((acc, p) => acc + Number(p.amount), 0);

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      <DashboardNavbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Freelancer Overview</h1>
            <p className="text-xs text-slate-500">Track your assigned projects, authorized earnings, and AI deliverable audits.</p>
          </div>

          <EscrowNotice variant="banner" />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-medium text-slate-500">Total Earnings Paid</span>
              <div className="text-2xl font-extrabold text-emerald-600 tracking-tight">
                ${totalCaptured.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-500 block">Captured via PayPal</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-medium text-slate-500">Authorized In Progress</span>
              <div className="text-2xl font-extrabold text-teal-600 tracking-tight">
                ${totalAuthorized.toFixed(2)}
              </div>
              <span className="text-[11px] text-teal-600 font-medium block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Guaranteed by PayPal Hold
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-medium text-slate-500">Assigned Projects</span>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {projects.length}
              </div>
              <span className="text-[11px] text-blue-600 font-medium block">Active contracts</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-medium text-slate-500">AI Verification</span>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-teal-500" />
                <span>Ready</span>
              </div>
              <span className="text-[11px] text-slate-500 block">Fast deliverable audits</span>
            </div>
          </div>

          {/* Assigned Projects Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Assigned Projects & Milestones</h3>
                <p className="text-xs text-slate-500">Select a project to review requirements and submit deliverable artifacts.</p>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading assigned projects...</div>
            ) : projects.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No projects currently assigned.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-5 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{proj.title}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                          {proj.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{proj.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                        <span>Client: <strong className="text-slate-700">{proj.client?.full_name || 'Sarah Jenkins'}</strong></span>
                        <span>Total Contract: <strong className="text-slate-900 font-bold">${Number(proj.budget).toFixed(2)}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        to={`/freelancer/projects`}
                        className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition"
                      >
                        <span>View Milestones</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
