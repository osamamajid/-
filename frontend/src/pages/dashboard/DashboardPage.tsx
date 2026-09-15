import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { DashboardStats, MonthlyTrend } from '../../types/dashboard.types';
import { Contract } from '../../types/contract.types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ContractPreviewModal } from '../../components/contracts/ContractPreviewModal';
import { formatCurrency, formatDate, getStatusBadge } from '../../utils/formatters';
import {
  FileText,
  Clock,
  CalendarCheck,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Plus,
  Eye,
  CheckCircle2,
  Car,
  Home,
  ShoppingBag,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, trendsRes, settingsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/trends'),
          api.get('/settings'),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (trendsRes.data.success) setTrends(trendsRes.data.data);
        if (settingsRes.data.success) setSettings(settingsRes.data.data.settingsMap);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const openPreview = async (contractId: string) => {
    try {
      const res = await api.get(`/contracts/${contractId}`);
      if (res.data.success) {
        setPreviewContract(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load contract for preview', err);
    }
  };

  const getContractIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Car':
        return <Car className="w-5 h-5 text-sky-600" />;
      case 'Home':
        return <Home className="w-5 h-5 text-emerald-600" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-amber-600" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-indigo-600" />;
      case 'UserCheck':
        return <UserCheck className="w-5 h-5 text-teal-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="جاري تجهيز مؤشرات وإحصائيات لوحة التحكم..." size="lg" />;
  }

  const kpis = stats?.kpis;
  const expiringTotal =
    (kpis?.expiringSoon.within7Days || 0) +
    (kpis?.expiringSoon.within15Days || 0) +
    (kpis?.expiringSoon.within30Days || 0);

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-l from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl shadow-slate-900/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            لوحة تحكم منصة <span className="text-emerald-400">العقد</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
            متابعة فورية لإصدارات العقود، التنبيهات الذكية، الإيرادات والعملاء
          </p>
        </div>

        {hasPermission('contracts:create') && (
          <Button
            variant="primary"
            onClick={() => navigate('/contracts/create')}
            icon={<Plus className="w-5 h-5" />}
            className="shadow-emerald-600/30"
          >
            إنشاء عقد جديد
          </Button>
        )}
      </div>

      {/* 2. Expiry Alerts Notification Banner */}
      {expiringTotal > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-100/60 to-rose-50 border border-amber-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-sm mt-0.5 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                تنبيه انتهاء العقود: يوجد <span className="text-rose-600">{expiringTotal}</span> عقود تقترب من موعد الانتهاء
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                منها{' '}
                <span className="font-black text-rose-700">
                  {kpis?.expiringSoon.within7Days} عقود خلال 7 أيام
                </span>
                ، و{' '}
                <span className="font-bold text-amber-700">
                  {kpis?.expiringSoon.within15Days} عقود خلال 15 يوماً
                </span>
                ، و{' '}
                <span className="font-bold text-slate-700">
                  {kpis?.expiringSoon.within30Days} عقود خلال 30 يوماً
                </span>
                .
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/contracts?expiringWithinDays=7')}
              className="text-xs text-rose-700 border-rose-300 hover:bg-rose-50"
            >
              عقود 7 أيام ({kpis?.expiringSoon.within7Days})
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/contracts?expiringWithinDays=30')}
              className="text-xs"
            >
              عرض كافة المنتهية قريباً &larr;
            </Button>
          </div>
        </div>
      )}

      {/* 3. Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Contracts */}
        <Card className="hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500">إجمالي العقود</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{kpis?.totalContracts || 0}</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 font-semibold">
                <span className="text-emerald-600 font-bold">+{kpis?.todayContracts} اليوم</span>
                <span>•</span>
                <span>{kpis?.monthContracts} هذا الشهر</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Active Contracts */}
        <Card className="hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500">العقود النشطة</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">{kpis?.activeContracts || 0}</p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>سارية المفعول قانونياً</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Expired / Draft */}
        <Card className="hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500">منتهية / مسودات</p>
              <p className="text-2xl font-black text-slate-800 mt-1">
                {kpis?.expiredContracts || 0} <span className="text-xs font-normal text-slate-400">/ {kpis?.draftContracts || 0}</span>
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 font-semibold">
                <span className="text-rose-600 font-bold">{kpis?.expiredContracts} منتهية</span>
                <span>•</span>
                <span className="text-amber-600 font-bold">{kpis?.draftContracts} مسودة</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Total Customers & Revenue */}
        <Card className="hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500">عدد العملاء</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{kpis?.totalCustomers || 0}</p>
              <p className="text-[11px] font-bold text-emerald-600 mt-2 truncate max-w-[150px]">
                {formatCurrency(kpis?.activeTotalRevenue || 0)} قيمة العقود
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Types Distribution & Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Visual */}
        <Card
          title="مخطط وتوزيع العقود بالأشهر"
          subtitle="رصد حركة توقيع العقود وقيمتها المالية في الأشهر الأخيرة"
          className="lg:col-span-2"
        >
          <div className="space-y-4 pt-2">
            {trends.map((t, idx) => {
              const maxCount = Math.max(...trends.map((x) => x.count), 1);
              const percentage = Math.round((t.count / maxCount) * 100);

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">{t.month}</span>
                    <span className="text-emerald-700">
                      {t.count} عقد ({formatCurrency(t.revenue)})
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-emerald-500 to-emerald-700 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Contracts By Type */}
        <Card
          title="العقود حسب النوع"
          subtitle="توزيع العقود المبرمة بحسب النماذج المعتمدة"
        >
          <div className="space-y-3 pt-2">
            {stats?.contractsByType.map((type) => (
              <div
                key={type.id}
                onClick={() => navigate(`/contracts?typeId=${type.id}`)}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/90 border border-slate-200/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                    {getContractIcon(type.icon)}
                  </div>
                  <span className="text-xs font-bold text-slate-800">{type.name}</span>
                </div>
                <Badge variant="slate" className="font-mono font-black">
                  {type.count}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 5. Recent Contracts Table */}
      <Card
        title="أحدث العقود المبرمة"
        subtitle="آخر العقود التي تم إنشاؤها عبر النظام"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/contracts')}
            icon={<ArrowUpRight className="w-4 h-4" />}
          >
            عرض الكل
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/50">
                <th className="py-3 px-4">رقم العقد</th>
                <th className="py-3 px-4">نوع العقد</th>
                <th className="py-3 px-4">العميل</th>
                <th className="py-3 px-4">تاريخ البداية</th>
                <th className="py-3 px-4">تاريخ الانتهاء</th>
                <th className="py-3 px-4">القيمة</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentContracts.map((contract) => {
                const badge = getStatusBadge(contract.status);
                return (
                  <tr key={contract.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      {contract.contractNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {contract.contractType?.name}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {contract.customer?.fullName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{formatDate(contract.startDate)}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {contract.endDate ? formatDate(contract.endDate) : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(contract.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-bold border text-[10px] ${badge.className}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPreview(contract.id)}
                        icon={<Eye className="w-3.5 h-3.5" />}
                        className="text-xs py-1 px-2.5"
                      >
                        معاينة
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Contract Preview & Print Modal */}
      <ContractPreviewModal
        isOpen={!!previewContract}
        onClose={() => setPreviewContract(null)}
        contract={previewContract}
        settings={settings}
      />
    </div>
  );
};
