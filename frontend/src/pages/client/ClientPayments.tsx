import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  Calendar,
  DollarSign,
  Loader2
} from 'lucide-react';
import { DashboardNavbar } from '../../components/common/DashboardNavbar';
import { Sidebar } from '../../components/common/Sidebar';
import { EscrowNotice } from '../../components/common/EscrowNotice';
import { paymentApi } from '../../services/paymentApi';
import { Payment } from '../../types';

export const ClientPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefundPayment, setSelectedRefundPayment] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

  useEffect(() => {
    loadPayments();
  }, []);

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRefundPayment || !refundReason.trim()) return;
    setRefundLoading(true);
    setActionError(null);
    try {
      const res = await paymentApi.refundPayment(selectedRefundPayment.id, refundReason);
      setActionSuccess(`Refund processed successfully via PayPal. Refund ID: ${res.paypal_refund_id || 'REFUNDED'}`);
      setSelectedRefundPayment(null);
      setRefundReason('');
      loadPayments();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Failed to process refund');
    } finally {
      setRefundLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'captured':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Captured / Paid</span>;
      case 'authorized':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">Authorized (Held on PayPal)</span>;
      case 'refunded':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Refunded</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      <DashboardNavbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payment History</h1>
            <p className="text-xs text-slate-500">Track PayPal authorizations, milestone captures, and issued refunds.</p>
          </div>

          <EscrowNotice variant="banner" />

          {actionSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {actionError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">PayPal Transactions</h3>
                <p className="text-xs text-slate-500">All transactions are processed through PayPal Orders v2.</p>
              </div>
              <span className="text-xs font-medium text-slate-500">{payments.length} transactions</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading payment history...</div>
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
                      <th className="py-3 px-5">Capture / Refund ID</th>
                      <th className="py-3 px-5 text-right">Actions</th>
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
                          {getStatusBadge(p.status)}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {p.paypal_order_id || '—'}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-[11px] text-teal-700 whitespace-nowrap">
                          {p.paypal_authorization_id || '—'}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-[11px] text-blue-700 whitespace-nowrap">
                          {p.paypal_capture_id || p.paypal_refund_id || '—'}
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          {p.status === 'captured' && (
                            <button
                              onClick={() => setSelectedRefundPayment(p)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Refund</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Refund Modal */}
          {selectedRefundPayment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base">Issue PayPal Refund</h3>
                  <button onClick={() => setSelectedRefundPayment(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                    &times;
                  </button>
                </div>

                <form onSubmit={handleRefund} className="space-y-4">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="text-slate-500 block">Capture ID: <strong className="font-mono text-slate-800">{selectedRefundPayment.paypal_capture_id}</strong></span>
                    <span className="text-slate-500 block">Refund Amount: <strong className="text-slate-900">${Number(selectedRefundPayment.amount).toFixed(2)} USD</strong></span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Refund</label>
                    <textarea
                      rows={3}
                      required
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="E.g., Contract cancellation or mutual agreement with freelancer"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedRefundPayment(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={refundLoading}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md transition disabled:opacity-50"
                    >
                      {refundLoading ? 'Processing...' : 'Confirm Refund'}
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
