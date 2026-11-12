import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, UserCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (role: 'client' | 'freelancer') => {
    try {
      const email = role === 'client' ? 'client@proofpay.io' : 'freelancer@proofpay.io';
      await login(email, 'Password123!');
      navigate(role === 'client' ? '/client/dashboard' : '/freelancer/dashboard');
    } catch (e) {
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#101B33]/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block">ProofPay</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-teal-400 block -mt-1">Work Verified</span>
            </div>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link to="/features" className="hover:text-white transition">Features</Link>
            <Link to="/how-it-works" className="hover:text-white transition">How It Works</Link>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 text-xs text-teal-300 border border-teal-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
              PayPal Orders v2
            </span>
          </nav>

          {/* Right CTA & Demo Fast Access */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={user.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition shadow-md shadow-blue-600/20"
              >
                <span>Dashboard ({user.role})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                {/* Hackathon Fast-Track buttons */}
                <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 rounded-lg p-1 text-xs">
                  <button
                    onClick={() => handleQuickDemo('client')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition font-medium"
                    title="Instant Login as Client Demo"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                    <span>Demo Client</span>
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={() => handleQuickDemo('freelancer')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition font-medium"
                    title="Instant Login as Freelancer Demo"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>Demo Freelancer</span>
                  </button>
                </div>

                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="flex items-center gap-1.5 bg-[#356AE6] hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-md shadow-blue-600/30"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
