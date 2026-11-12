import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Eye,
  FileCode,
  Scale,
  Sparkles,
  ChevronRight,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';
import { EscrowNotice } from '../../components/common/EscrowNotice';
import { useAuth } from '../../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async (role: 'client' | 'freelancer') => {
    try {
      const email = role === 'client' ? 'client@proofpay.io' : 'freelancer@proofpay.io';
      await login(email, 'Password123!');
      navigate(role === 'client' ? '/client/dashboard' : '/freelancer/dashboard');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#101B33] text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/20 via-teal-500/10 to-transparent blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-teal-500/30 text-teal-300 text-xs font-semibold shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Next-Gen Freelance Payment Trust Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                Work Verified. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                  Payments Deserved.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                ProofPay eliminates payment friction between freelancers and clients. Clients authorize milestone funds upfront using PayPal, while AI audits submitted deliverables against agreed specifications before payment capture.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#356AE6] hover:bg-blue-600 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition text-sm"
                >
                  <span>Start Free Project</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleDemoLogin('client')}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-3 rounded-xl transition"
                  >
                    <Briefcase className="w-4 h-4 text-blue-400" />
                    <span>Client Demo</span>
                  </button>
                  <button
                    onClick={() => handleDemoLogin('freelancer')}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-3 rounded-xl transition"
                  >
                    <UserCheck className="w-4 h-4 text-teal-400" />
                    <span>Freelancer Demo</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  PayPal Orders v2 Auth
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  Multimodal Vision Audit
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  Human Decision Control
                </span>
              </div>
            </div>

            {/* Right Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                    <span className="text-xs font-mono text-slate-400 ml-2">ProofPay Live Audit</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-[11px] font-bold border border-teal-500/30">
                    Score: 94 / 100
                  </span>
                </div>

                {/* Simulated Verification Card */}
                <div className="space-y-3">
                  <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">Responsive Mobile & Desktop Navigation</span>
                      <span className="text-emerald-400 font-bold">Fulfilled &bull; 96%</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Evaluated `screenshot_mobile_drawer.png` and `Navbar.tsx`. Mobile breakpoint tags and hamburger drawer bindings verified.
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">Interactive Pricing Calculator</span>
                      <span className="text-emerald-400 font-bold">Fulfilled &bull; 92%</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Tier comparison table verified in screenshots with active billing period toggles.
                    </p>
                  </div>

                  <div className="bg-amber-950/40 p-3.5 rounded-xl border border-amber-800/40 space-y-1 text-xs text-amber-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Human Review Notice</span>
                      <span className="text-amber-400 font-bold">Requires Client Approval</span>
                    </div>
                    <p className="text-[11px] text-amber-300/80">
                      Live transaction APIs cannot be dynamically verified from static screenshots. Final approval rests with the client.
                    </p>
                  </div>
                </div>

                {/* PayPal Status Bar */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">PayPal Authorization:</span>
                  <span className="font-mono text-teal-400 font-semibold">$100.00 USD (Authorized)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust & Legal Notice Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 z-20 w-full">
        <EscrowNotice variant="card" />
      </div>

      {/* 4 Core Pillars Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Designed for Financial Clarity and Trust
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            ProofPay bridges the trust gap between hiring parties and independent contractors through verifiable deliverables and protected payment workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Pillar 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">PayPal Orders v2</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clients authorize milestone funds upfront. Payments remain with PayPal under standard authorization (up to 29 days) and are only captured upon approval.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-400 hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Vision & Multimodal AI</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our AI engine audits screenshots, source code files, documents, and live URLs, scoring evidence against explicit criteria weights.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-400 hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Human Final Authority</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI advises with explainable reports; it never unilaterally triggers payments. The client makes the final financial decision to capture or request revisions.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">AI Dispute Assistant</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If client expectations diverge, the Dispute Assistant analyzes original requirements vs. feedback, generating objective mediation steps.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#101B33] text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
            <span className="font-bold text-white text-base">ProofPay</span>
            <span className="text-xs text-slate-500">&bull; Work Verified. Payments Deserved.</span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <Link to="/features" className="hover:text-white transition">Features</Link>
            <Link to="/how-it-works" className="hover:text-white transition">How It Works</Link>
            <Link to="/login" className="hover:text-white transition">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
