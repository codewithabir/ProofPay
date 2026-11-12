import React, { useState } from 'react';
import { Menu, X, ShieldCheck } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
            <span className="font-bold text-lg tracking-tight">ProofPay Showcase</span>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
              Launch App
            </button>
          </div>
          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-slate-900/95 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <a href="#features" className="block text-slate-300 hover:text-white py-1">Features</a>
          <a href="#pricing" className="block text-slate-300 hover:text-white py-1">Pricing</a>
          <a href="#how-it-works" className="block text-slate-300 hover:text-white py-1">How It Works</a>
        </div>
      )}
    </nav>
  );
};
