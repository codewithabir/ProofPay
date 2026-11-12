import React from 'react';
import { Navbar } from '../../components/common/Navbar';
import {
  ShieldCheck,
  CreditCard,
  Cpu,
  Layers,
  CheckCircle2,
  Lock,
  Scale,
  Bell,
  Eye,
  FileCheck
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            Product Capabilities
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            ProofPay Platform Architecture & Features
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Enterprise-grade fintech security combined with multimodal AI verification for transparent project delivery.
          </p>
        </div>

        {/* Feature Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client Features */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">For Clients & Hiring Managers</h3>
                <p className="text-xs text-slate-500">Pay only when measurable criteria are satisfied</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">PayPal Authorization Holds:</strong> Reserve funds with standard PayPal authorization without immediate debit.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Explainable AI Audit Reports:</strong> View granular breakdown of fulfilled, partial, and missing requirements with confidence scores.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Human Decision Authority:</strong> AI informs, but clients retain final approval for financial capture.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Refund & Cancellation Support:</strong> Initiate PayPal refunds directly if deliverables fail to align with contract terms.</span>
              </li>
            </ul>
          </div>

          {/* Freelancer Features */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">For Freelancers & Contractors</h3>
                <p className="text-xs text-slate-500">Guarantee payment security before starting work</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Pre-authorized Milestone Verification:</strong> Work with confidence knowing the client has verified PayPal funding.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Objective Deliverable Evidence:</strong> Upload code, screenshots, and live URLs to prove requirements were fulfilled.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Scope Creep Protection:</strong> AI Dispute Assistant verifies whether client revision requests were part of the original agreement.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Direct PayPal Payouts:</strong> Funds transfer securely upon milestone approval.</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};
