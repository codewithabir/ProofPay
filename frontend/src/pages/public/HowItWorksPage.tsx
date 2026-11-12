import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/common/Navbar';
import { EscrowNotice } from '../../components/common/EscrowNotice';
import {
  FileText,
  Lock,
  UploadCloud,
  Cpu,
  CheckCircle,
  Scale,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      icon: FileText,
      title: 'Define Project & Measurable Requirements',
      desc: 'The client drafts the project scope, breaking deliverables into weighted requirements (UI/UX, functional components, live URL verification) and associated milestone amounts.',
    },
    {
      step: '02',
      icon: Lock,
      title: 'Authorize Payment via PayPal Orders v2',
      desc: 'The client initiates milestone funding. Using PayPal Orders v2 with intent: AUTHORIZE, funds are reserved on the client\'s PayPal account for up to 29 days without immediate capture.',
    },
    {
      step: '03',
      icon: UploadCloud,
      title: 'Freelancer Submits Deliverable Evidence',
      desc: 'Upon completing the milestone, the freelancer uploads supporting artifacts: desktop & mobile screenshots, source code files, documents, and live demo URLs with delivery notes.',
    },
    {
      step: '04',
      icon: Cpu,
      title: 'AI Multimodal Verification Analysis',
      desc: 'ProofPay\'s AI Verification Engine ingests all evidence, cross-references with each requirement, computes confidence scores, and flags unverifiable criteria requiring visual inspection.',
    },
    {
      step: '05',
      icon: CheckCircle,
      title: 'Client Review & Explicit Capture Approval',
      desc: 'The client inspects the explainable AI audit report. If satisfied, the client approves the work, triggering the backend to execute the PayPal capture against the authorization.',
    },
    {
      step: '06',
      icon: Scale,
      title: 'AI Dispute Mediation (Optional)',
      desc: 'If work requires adjustments, the client can request a revision. The AI Dispute Assistant analyzes feedback against agreed scope, offering objective suggestions to keep the project on track.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Transparent Workflow
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How ProofPay Works
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            A step-by-step trust pipeline designed to protect both freelancer effort and client capital through transparent verification.
          </p>
        </div>

        <EscrowNotice variant="card" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-black text-slate-200">{s.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-[#101B33] text-white p-8 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-bold text-xl tracking-tight">Ready to see it in action?</h3>
            <p className="text-xs text-slate-300">
              Test the pre-seeded SaaS marketing website milestone workflow immediately.
            </p>
          </div>
          <Link
            to="/login"
            className="flex items-center gap-2 bg-[#356AE6] hover:bg-blue-600 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-lg transition"
          >
            <span>Launch Hackathon Demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
};
