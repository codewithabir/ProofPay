import React, { useState } from 'react';
import { ShieldCheck, ExternalLink, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { paymentApi } from '../../services/paymentApi';
import { Milestone } from '../../types';

interface PayPalAuthModalProps {
  milestone: Milestone;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PayPalAuthModal: React.FC<PayPalAuthModalProps> = ({
  milestone,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [approveUrl, setApproveUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'init' | 'approved' | 'complete'>('init');

  if (!isOpen) return null;

  const handleCreateOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentApi.createOrder(milestone.id);
      setOrderId(res.order_id);
      setApproveUrl(res.approve_url || `https://www.sandbox.paypal.com/checkoutnow?token=${res.order_id}`);
      setStep('approved');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to initialize PayPal Order');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorizeCaptureHold = async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      await paymentApi.authorizePayment(milestone.id, orderId);
      setStep('complete');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to authorize payment hold');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Authorize Milestone Payment</h3>
              <p className="text-xs text-slate-500">PayPal Orders v2 &bull; 2-Phase Authorization</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">
            &times;
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Milestone:</span>
            <span className="font-semibold text-slate-900">{milestone.title}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Authorization Amount:</span>
            <span className="font-bold text-slate-900 text-sm">${Number(milestone.payment_amount).toFixed(2)} {milestone.currency}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>PayPal Order Intent:</span>
            <span className="font-mono text-blue-600 font-semibold">AUTHORIZE</span>
          </div>
        </div>

        <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 text-xs text-blue-900 leading-relaxed">
          <span className="font-semibold block mb-0.5">Payment Guarantee Notice:</span>
          Your account is not charged immediately. PayPal will hold authorization for up to 29 days. Payment will only be captured when you review and approve the submitted work.
        </div>

        {step === 'init' && (
          <div className="space-y-3 pt-2">
            <button
              onClick={handleCreateOrder}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#0070BA] hover:bg-[#003087] text-white font-semibold py-3 px-4 rounded-xl shadow-md transition text-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Connect & Initiate with PayPal Sandbox</span>
            </button>
          </div>
        )}

        {step === 'approved' && orderId && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
              <span className="font-semibold block">PayPal Order Created:</span>
              <span className="font-mono text-[11px] block text-emerald-900">{orderId}</span>
            </div>

            {approveUrl && (
              <a
                href={approveUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2.5 px-4 rounded-lg border border-slate-300 transition"
              >
                <span>Open PayPal Checkout Popup</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={handleAuthorizeCaptureHold}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition text-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              <span>Execute Order Authorization (Hold Funds)</span>
            </button>
          </div>
        )}

        {step === 'complete' && (
          <div className="p-6 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="font-bold text-slate-900 text-base">Payment Authorized Successfully!</h4>
            <p className="text-xs text-slate-500">
              Funds are reserved on PayPal. Freelancer has been notified to proceed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
