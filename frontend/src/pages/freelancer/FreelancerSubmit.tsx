import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  UploadCloud,
  FileCheck2,
  ArrowLeft,
  Sparkles,
  Link as LinkIcon,
  FileCode,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react';
import { DashboardNavbar } from '../../components/common/DashboardNavbar';
import { Sidebar } from '../../components/common/Sidebar';
import { projectApi } from '../../services/projectApi';
import { aiApi } from '../../services/aiApi';
import { Milestone } from '../../types';

export const FreelancerSubmit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [loading, setLoading] = useState(true);

  // Form
  const [liveUrl, setLiveUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMilestone = async () => {
      if (!id) return;
      try {
        const m = await projectApi.getMilestone(id);
        setMilestone(m);
      } catch {
        setError('Milestone not found');
      } finally {
        setLoading(false);
      }
    };
    loadMilestone();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleAutofillDemoDeliverables = () => {
    setLiveUrl('https://proofpay-showcase.web.app');
    setNotes(
      'Completed Milestone 1: Responsive Hero & Header Navigation. Implemented React + Tailwind components with responsive mobile drawer menu, sticky navbar, and semantic SEO viewport.'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    setError(null);
    setStatusMessage('Uploading deliverable artifacts...');

    try {
      const formData = new FormData();
      if (liveUrl) formData.append('live_url', liveUrl);
      if (notes) formData.append('notes', notes);

      for (const file of files) {
        formData.append('files', file);
      }

      await projectApi.submitDeliverable(id, formData);

      setStatusMessage('Triggering AI Verification Engine audit...');
      await aiApi.verifyMilestone(id);

      setStatusMessage('AI audit complete! Redirecting to report...');
      setTimeout(() => {
        navigate(`/freelancer/milestones/${id}/feedback`);
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Submission failed. Please check file formats and try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
        <DashboardNavbar />
        <div className="p-12 text-center text-xs text-slate-400">Loading milestone...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      <DashboardNavbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Projects</span>
            </button>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Submit Milestone Deliverable</h1>
            <p className="text-xs text-slate-500">
              Deliverable for: <strong className="text-slate-800">{milestone?.title}</strong> (${Number(milestone?.payment_amount || 0).toFixed(2)} USD)
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Requirements Scope Reminder */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Agreed Requirements Checklist
            </h3>
            {milestone?.requirements_text ? (
              <pre className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-sans whitespace-pre-wrap leading-relaxed">
                {milestone.requirements_text}
              </pre>
            ) : (
              <p className="text-xs text-slate-500 italic">Deliverable will be evaluated against overall project criteria.</p>
            )}

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Tip: Provide screenshots and source code files for highest AI verification confidence.
              </span>
              <button
                type="button"
                onClick={handleAutofillDemoDeliverables}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
              >
                Autofill Demo Notes & URL
              </button>
            </div>
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Live Demonstration URL (Optional but Recommended)</span>
              </label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://your-preview-deployment.web.app"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                <span>Delivery Notes & Implementation Summary</span>
              </label>
              <textarea
                rows={4}
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe what was built, how to test responsiveness, and how each requirement was satisfied..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>

            {/* Artifact File Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-blue-600" />
                <span>Supporting Artifacts & Evidence (Screenshots, Source Code, Documentation)</span>
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-500 transition cursor-pointer bg-slate-50/50">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full h-full opacity-0 absolute inset-0 cursor-pointer"
                  id="file-upload"
                />
                <div className="space-y-2 pointer-events-none">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">
                    Click to browse or drag and drop deliverable files
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Supports .png, .jpg, .tsx, .ts, .py, .html, .css, .pdf (Max 25MB each)
                  </p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 block">
                    Selected Files ({files.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {files.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs border border-blue-200">
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>{f.name}</span>
                        <span className="text-[10px] text-blue-500">({Math.round(f.size / 1024)} KB)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submission Status or Trigger Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                AI Verification will run immediately upon submission.
              </span>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-[#356AE6] hover:bg-blue-600 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{statusMessage || 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-teal-300" />
                    <span>Submit & Run AI Verification</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
