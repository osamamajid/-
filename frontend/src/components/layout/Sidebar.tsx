import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Layers,
  BarChart3,
  ShieldCheck,
  UserCog,
  Settings,
  LogOut,
  FileCheck2,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout, isAdmin, isEmployee } = useAuth();

  const navItems = [
    {
      label: 'اللوحة الرئيسية',
      to: '/dashboard',
      icon: LayoutDashboard,
      show: true,
      tourId: 'dashboard',
    },
    {
      label: 'العقود',
      to: '/contracts',
      icon: FileText,
      show: true,
      tourId: 'contracts',
    },
    {
      label: 'العملاء',
      to: '/customers',
      icon: Users,
      show: true,
      tourId: 'customers',
    },
    {
      label: 'قوالب ونماذج العقود',
      to: '/templates',
      icon: Layers,
      show: isAdmin,
      tourId: 'templates',
    },
    {
      label: 'التقارير والإحصائيات',
      to: '/reports',
      icon: BarChart3,
      show: isAdmin || isEmployee,
      tourId: 'reports',
    },
    {
      label: 'إدارة المستخدمين',
      to: '/users',
      icon: UserCog,
      show: isAdmin,
      tourId: 'users-permissions',
    },
    {
      label: 'سجل العمليات (Audit)',
      to: '/audit-logs',
      icon: ShieldCheck,
      show: isAdmin,
    },
    {
      label: 'إعدادات النظام',
      to: '/settings',
      icon: Settings,
      show: isAdmin,
      tourId: 'settings',
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-72 bg-slate-900 text-white z-50 flex flex-col transition-transform duration-300 ease-in-out border-l border-slate-800 ${
          isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                عَقـيــد
                <span className="text-emerald-400 text-xs font-normal px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800/60">PRO</span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium">نظام إصدار وإدارة العقود</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            القائمة الرئيسية
          </div>

          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                  {...(item.tourId && { 'data-tour': item.tourId })}
                >
                  <Icon className="w-5 h-5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/30">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-emerald-700/40 text-emerald-400 border border-emerald-600/30 flex items-center justify-center font-bold text-sm shrink-0">
                {user?.fullName?.charAt(0) || 'م'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.fullName}</p>
                <span className="inline-block text-[10px] text-emerald-400 font-medium">
                  {user?.roleName || user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="تسجيل الخروج"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
