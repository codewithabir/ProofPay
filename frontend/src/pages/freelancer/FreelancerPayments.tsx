import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { DashboardNavbar } from '../../components/common/DashboardNavbar';
import { Sidebar } from '../../components/common/Sidebar';
import { EscrowNotice } from '../../components/common/EscrowNotice';
import { paymentApi } from '../../services/paymentApi';
import { Payment } from '../../types';

export const FreelancerPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const data = await paymentApi.getHistory();
        setPayments(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Earnings & PayPal Payments</h1>
            <p className="text-xs text-slate-500">Track client authorized funds and captured milestone payments.</p>
          </div>

          <EscrowNotice variant="banner" />

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-medium text-slate-500">Total Captured Earnings</span>
              <div className="text-2xl font-extrabold text-emerald-600 tracking-tight">
                ${totalCaptured.toFixed(2)} USD
              </div>
              <span className="text-[11px] text-slate-500 block">Deposited via PayPal</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-medium text-slate-500">Authorized In Progress</span>
              <div className="text-2xl font-extrabold text-teal-600 tracking-tight">
                ${totalAuthorized.toFixed(2)} USD
              </div>
              <span className="text-[11px] text-teal-600 font-medium block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Held on client PayPal account (Valid 29 days)
              </span>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Earnings History</h3>
                <p className="text-xs text-slate-500">All milestone captures processed via PayPal.</p>
              </div>
              <span className="text-xs font-medium text-slate-500">{payments.length} transactions</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading payments...</div>
            ) : payments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No payment transactions recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5">Amount</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5">PayPal Order ID</th>
                      <th className="py-3 px-5">Authorization ID</th>
                      <th className="py-3 px-5">Capture ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                          ${Number(p.amount).toFixed(2)} {p.currency}
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          {p.status === 'captured' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Captured / Paid
                            </span>
                          ) : p.status === 'authorized' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                              Authorized (In Progress)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                              {p.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {p.paypal_order_id || '—'}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-[11px] text-teal-700 whitespace-nowrap">
                          {p.paypal_authorization_id || '—'}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-[11px] text-blue-700 whitespace-nowrap">
                          {p.paypal_capture_id || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
