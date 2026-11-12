import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  UploadCloud,
  FileCheck2,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { DashboardNavbar } from '../../components/common/DashboardNavbar';
import { Sidebar } from '../../components/common/Sidebar';
import { ScoreGauge } from '../../components/verification/ScoreGauge';
import { CriteriaCard } from '../../components/verification/CriteriaCard';
import { HumanReviewBanner } from '../../components/verification/HumanReviewBanner';
import { aiApi } from '../../services/aiApi';
import { projectApi } from '../../services/projectApi';
import { VerificationReport, Milestone } from '../../types';

export const FreelancerFeedback: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      if (!id) return;
      try {
        const [m, r] = await Promise.all([
          projectApi.getMilestone(id),
          aiApi.getVerificationReport(id),
        ]);
        setMilestone(m);
        setReport(r);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      <DashboardNavbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-5xl mx-auto w-full">
          <div>
            <Link
              to="/freelancer/projects"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Assigned Projects</span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-teal-500" />
              <span>AI Verification Feedback</span>
            </h1>
            <p className="text-xs text-slate-500">
              Audit results for milestone: <strong className="text-slate-800">{milestone?.title}</strong>
            </p>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Loading verification audit...</p>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Score Gauge */}
              <ScoreGauge
                score={Number(report.overall_score)}
                requiresHumanReview={report.requires_human_review}
                size="lg"
              />

              {/* Status Banner */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Milestone Approval Status</span>
                  <span className="font-bold text-slate-900 text-sm capitalize">
                    {milestone?.client_approval_status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {milestone?.client_approval_status === 'approved' ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Approved & Payment Captured
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                      Pending Client Review
                    </span>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5 text-xs">
                <span className="font-bold text-slate-900 block text-sm">AI Evaluation Overview</span>
                <p className="text-slate-600 leading-relaxed">{report.summary}</p>
              </div>

              {/* Human Review Banner */}
              {report.requires_human_review && (
                <HumanReviewBanner
                  limitations={report.details?.limitations}
                  issues={report.details?.potential_issues}
                />
              )}

              {/* Criteria */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                  Detailed Criteria Findings ({report.details?.criteria.length || 0})
                </h3>
                <div className="space-y-3">
                  {report.details?.criteria.map((c, i) => (
                    <CriteriaCard key={i} item={c} />
                  ))}
                </div>
              </div>

              {/* Re-submission CTA if revisions needed */}
              {milestone?.client_approval_status !== 'approved' && (
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">Need to update your deliverables?</h4>
                    <p className="text-xs text-slate-400">
                      You can resubmit updated screenshots, source code, or demo URLs anytime.
                    </p>
                  </div>
                  <Link
                    to={`/freelancer/milestones/${id}/submit`}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Revisions</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No Report Generated Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Submit your deliverable artifacts to trigger the AI verification engine.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
