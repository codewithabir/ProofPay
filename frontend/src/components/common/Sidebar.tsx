import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  CreditCard,
  Scale,
  ShieldCheck,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isClient = user?.role === 'client';

  const clientLinks = [
    { to: '/client/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/client/projects', icon: FolderGit2, label: 'My Projects' },
    { to: '/client/payments', icon: CreditCard, label: 'Payment History' },
    { to: '/client/disputes', icon: Scale, label: 'Disputes & Mediate' },
  ];

  const freelancerLinks = [
    { to: '/freelancer/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/freelancer/projects', icon: FolderGit2, label: 'Assigned Projects' },
    { to: '/freelancer/payments', icon: CreditCard, label: 'Payment Earnings' },
  ];

  const links = isClient ? clientLinks : freelancerLinks;

  return (
    <aside className="w-64 bg-[#101B33] text-slate-300 min-h-[calc(100vh-61px)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-3">
            {isClient ? 'Client Portal' : 'Freelancer Portal'}
          </span>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* AI & PayPal Guarantee Widget */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-teal-400 font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>PayPal Sandbox Active</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Funds authorized via Orders v2. Captures executed only on deliverable approval.
          </p>
          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Status:</span>
            <span className="text-teal-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
              Live Sandbox
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 text-center">
        ProofPay &bull; Work Verified
      </div>
    </aside>
  );
};
