import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, LogOut, ExternalLink, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { aiApi } from '../../services/aiApi';
import { NotificationItem } from '../../types';

export const DashboardNavbar: React.FC = () => {
  const { user, logout, login } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchNotifs = async () => {
    try {
      const data = await aiApi.getNotifications();
      setNotifications(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async (id: string) => {
    try {
      await aiApi.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {
      // ignore
    }
  };

  const handleSwitchRole = async () => {
    if (!user) return;
    const targetEmail = user.role === 'client' ? 'freelancer@proofpay.io' : 'client@proofpay.io';
    await login(targetEmail, 'Password123!');
    window.location.href = user.role === 'client' ? '/freelancer/dashboard' : '/client/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#101B33] flex items-center justify-center text-teal-400 font-bold">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-slate-900 text-base tracking-tight">ProofPay</span>
          <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            {user?.role} Workspace
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Role Switcher for Hackathon demonstration */}
        <button
          onClick={handleSwitchRole}
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-slate-200 transition"
          title={`Switch to ${user?.role === 'client' ? 'Freelancer' : 'Client'} view`}
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
          <span>Switch to {user?.role === 'client' ? 'Freelancer' : 'Client'}</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 relative transition"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 duration-150">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider">In-App Notifications</span>
                <span className="text-xs text-slate-500">{unreadCount} unread</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No notifications yet</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`p-3.5 text-xs hover:bg-slate-50 cursor-pointer transition ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-900">{n.title}</span>
                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0"></span>}
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1.5 block">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="hidden md:block text-right">
            <span className="block text-xs font-semibold text-slate-900">{user?.full_name}</span>
            <span className="block text-[11px] text-slate-500">{user?.company_name || user?.email}</span>
          </div>
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          )}
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
