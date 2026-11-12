import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Plus,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { DashboardNavbar } from '../../components/common/DashboardNavbar';
import { Sidebar } from '../../components/common/Sidebar';
import { projectApi } from '../../services/projectApi';
import { Project, User } from '../../types';

export const ClientProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [freelancers, setFreelancers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('300');
  const [freelancerId, setFreelancerId] = useState('');
  const [requirements, setRequirements] = useState([
    { title: 'Responsive Hero & Navigation Header with Mobile Drawer Menu', category: 'ui_ux', weight: 1.0, is_mandatory: true },
    { title: 'Interactive Pricing Tier Toggle with Plan Cards', category: 'functional', weight: 1.0, is_mandatory: true },
    { title: 'Live Demonstration URL with HTTPS Deployment', category: 'performance', weight: 1.0, is_mandatory: true },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [projs, freeList] = await Promise.all([
        projectApi.getProjects(),
        projectApi.getAvailableFreelancers(),
      ]);
      setProjects(projs);
      setFreelancers(freeList);
      if (freeList.length > 0 && !freelancerId) {
        setFreelancerId(freeList[0].id);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddRequirement = () => {
    setRequirements([
      ...requirements,
      { title: '', category: 'functional', weight: 1.0, is_mandatory: true },
    ]);
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleReqChange = (index: number, field: string, value: any) => {
    const updated = [...requirements];
    (updated[index] as any)[field] = value;
    setRequirements(updated);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Project title is required');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await projectApi.createProject({
        title,
        description,
        budget: Number(budget),
        currency: 'USD',
        freelancer_id: freelancerId || undefined,
        requirements: requirements.filter(r => r.title.trim().length > 0),
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      <DashboardNavbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Projects</h1>
              <p className="text-xs text-slate-500">Manage deliverables, assign freelancers, and inspect milestone verifications.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-[#356AE6] hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No Projects Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create a project with measurable requirements and milestones to begin working with verified freelancers.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <div key={proj.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1">{proj.title}</h3>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                        {proj.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {proj.description || 'No description provided.'}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Total Budget:</span>
                        <span className="font-bold text-slate-900">${Number(proj.budget).toFixed(2)} {proj.currency}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Assigned Freelancer:</span>
                        <span className="font-semibold text-slate-700">{proj.freelancer?.full_name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Criteria Requirements:</span>
                        <span className="font-mono text-slate-900 font-semibold">{proj.requirements?.length || 0} items</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/client/projects/${proj.id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs transition"
                  >
                    <span>View Project & Milestones</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Create Project Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
              <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-900 text-base">Create New Project</h3>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">
                    &times;
                  </button>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="E.g., Modern SaaS Marketing Website"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief overview of project deliverables and goals"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Total Budget ($ USD)</label>
                      <input
                        type="number"
                        required
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Freelancer</label>
                      <select
                        value={freelancerId}
                        onChange={(e) => setFreelancerId(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Unassigned</option>
                        {freelancers.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.full_name} ({f.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Requirements Section */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800">
                        Measurable Requirements (AI Audit Criteria)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddRequirement}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        + Add Requirement
                      </button>
                    </div>

                    <div className="space-y-2">
                      {requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <input
                            type="text"
                            required
                            value={req.title}
                            onChange={(e) => handleReqChange(idx, 'title', e.target.value)}
                            placeholder="Requirement specification"
                            className="flex-1 text-xs p-1.5 rounded-lg border border-slate-300 bg-white"
                          />
                          <select
                            value={req.category}
                            onChange={(e) => handleReqChange(idx, 'category', e.target.value)}
                            className="text-xs p-1.5 rounded-lg border border-slate-300 bg-white"
                          >
                            <option value="ui_ux">UI/UX</option>
                            <option value="functional">Functional</option>
                            <option value="performance">Performance</option>
                            <option value="security">Security</option>
                          </select>
                          {requirements.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRequirement(idx)}
                              className="text-slate-400 hover:text-rose-600 text-xs font-bold px-1"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md transition disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      <span>Create Project</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
