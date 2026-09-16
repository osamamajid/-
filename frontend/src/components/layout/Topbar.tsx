import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, Plus, KeyRound, LogOut, AlertTriangle, ChevronDown, HelpCircle, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import api from '../../config/api';
import { ExpiringAlerts } from '../../types/contract.types';
import { resetTour } from '../tour/ProductTour';

interface TopbarProps {
  setIsMobileOpen: (open: boolean) => void;
  openChangePasswordModal: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ setIsMobileOpen, openChangePasswordModal }) => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState<ExpiringAlerts | null>(null);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  const alertsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch expiring contract alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/contracts/expiring-alerts');
        if (res.data.success) {
          setAlerts(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch expiring alerts', err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 120000); // كل دقيقتين
    return () => clearInterval(interval);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
        setIsAlertsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalExpiring = (alerts?.count7 || 0) + (alerts?.count15 || 0);

  const todayStr = new Intl.DateTimeFormat('ar-IQ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-soft">
      {/* Right side: Mobile Menu Button & Date */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-slate-800">{todayStr}</p>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            نظام عَقيد متصل ومحدث
          </p>
        </div>
      </div>

      {/* Left side: Actions, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Create Contract Button */}
        {hasPermission('contracts:create') && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/contracts/create')}
            icon={<Plus className="w-4 h-4" />}
            className="hidden xs:inline-flex shadow-emerald-600/20"
            data-tour="quick-create"
          >
            إنشاء عقد جديد
          </Button>
        )}

        {/* Expiry Alerts Dropdown */}
        <div className="relative" ref={alertsRef}>
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className="relative p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="تنبيهات انتهاء العقود"
          >
            <Bell className="w-5 h-5" />
            {totalExpiring > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center px-1 shadow-sm animate-bounce">
                {totalExpiring}
              </span>
            )}
          </button>

          {isAlertsOpen && (
            <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-modal border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>تنبيهات انتهاء العقود</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                  {totalExpiring} عقود عاجلة
                </span>
              </div>

              <div className="py-2 max-h-72 overflow-y-auto space-y-2">
                {alerts?.list7 && alerts.list7.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-rose-600 mb-1 px-1">
                      ⚠️ تنتهي خلال 7 أيام (حرجة جداً):
                    </p>
                    {alerts.list7.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setIsAlertsOpen(false);
                          navigate(`/contracts/${c.id}`);
                        }}
                        className="p-2.5 rounded-xl bg-rose-50/60 hover:bg-rose-100/70 border border-rose-100 cursor-pointer transition-colors text-xs space-y-0.5"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{c.contractNumber}</span>
                          <span className="text-rose-600">{c.contractType?.name}</span>
                        </div>
                        <div className="text-slate-600 flex justify-between">
                          <span>العميل: {c.customer?.fullName}</span>
                          <span>ينتهي: {c.endDate ? new Date(c.endDate).toLocaleDateString('ar-IQ') : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {alerts?.list15 && alerts.list15.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-amber-600 mb-1 px-1">
                      ⏳ تنتهي خلال 15 يوماً:
                    </p>
                    {alerts.list15.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setIsAlertsOpen(false);
                          navigate(`/contracts/${c.id}`);
                        }}
                        className="p-2.5 rounded-xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-100 cursor-pointer transition-colors text-xs space-y-0.5"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{c.contractNumber}</span>
                          <span className="text-amber-700">{c.contractType?.name}</span>
                        </div>
                        <div className="text-slate-600 flex justify-between">
                          <span>العميل: {c.customer?.fullName}</span>
                          <span>ينتهي: {c.endDate ? new Date(c.endDate).toLocaleDateString('ar-IQ') : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(!alerts || totalExpiring === 0) && (
                  <div className="text-center py-6 text-xs text-slate-500">
                    لا توجد عقود تنتهي قريباً. جميع العقود في وضع منتظم.
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setIsAlertsOpen(false);
                    navigate('/contracts?expiringWithinDays=30');
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  استعراض كافة العقود المقتربة من الانتهاء (30 يوماً) &larr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
              {user?.fullName?.charAt(0) || 'م'}
            </div>
            <div className="hidden md:block text-right">
              <span className="block text-xs font-bold text-slate-800 leading-tight">
                {user?.fullName}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {user?.roleName}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-modal border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  openChangePasswordModal();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <KeyRound className="w-4 h-4 text-slate-500" />
                <span>تغيير كلمة المرور</span>
              </button>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  resetTour();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors mt-1"
                data-tour="help-button"
              >
                <HelpCircle className="w-4 h-4" />
                <span>بدء الجولة التعريفية</span>
              </button>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
