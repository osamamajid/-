import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { Contract } from '../../types/contract.types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ContractPreviewModal } from '../../components/contracts/ContractPreviewModal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, getStatusBadge, getPaymentMethodLabel } from '../../utils/formatters';
import {
  ArrowRight,
  Printer,
  FileText,
  Calendar,
  DollarSign,
  User,
  ShieldCheck,
  CheckCircle,
  Archive,
  RotateCcw,
  Pencil,
} from 'lucide-react';

export const ContractDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { success, error } = useToast();

  const [contract, setContract] = useState<Contract | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [contractRes, settingsRes] = await Promise.all([
          api.get(`/contracts/${id}`),
          api.get('/settings'),
        ]);
        if (contractRes.data.success) setContract(contractRes.data.data);
        if (settingsRes.data.success) setSettings(settingsRes.data.data.settingsMap);
      } catch {
        error('فشل جلب بيانات وتفاصيل العقد');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id, error]);

  const handleStatusChange = async (newStatus: string) => {
    if (!contract) return;
    try {
      const res = await api.patch(`/contracts/${contract.id}/status`, { status: newStatus });
      if (res.data.success) {
        success('تم تحديث حالة العقد بنجاح');
        setContract({ ...contract, status: newStatus as any });
      }
    } catch {
      error('فشل تحديث الحالة');
    }
  };

  const handleArchiveToggle = async () => {
    if (!contract) return;
    try {
      if (contract.isArchived) {
        await api.patch(`/contracts/${contract.id}/restore`);
        success('تم استعادة العقد من الأرشيف');
        setContract({ ...contract, isArchived: false });
      } else {
        await api.patch(`/contracts/${contract.id}/archive`);
        success('تم أرشفة العقد بنجاح');
        setContract({ ...contract, isArchived: true });
      }
    } catch {
      error('فشل تحديث أرشفة العقد');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="جاري جلب تفاصيل العقد..." size="lg" />;
  }

  if (!contract) {
    return (
      <div className="text-center py-20">
        <h3 className="text-base font-bold text-slate-800">العقد غير موجود</h3>
        <Button variant="primary" onClick={() => navigate('/contracts')} className="mt-4">
          العودة لقائمة العقود
        </Button>
      </div>
    );
  }

  const badge = getStatusBadge(contract.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/contracts')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold mb-2 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لقائمة العقود</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
              {contract.contractNumber}
            </h1>
            <span className={`px-2.5 py-1 rounded-full font-bold border text-xs ${badge.className}`}>
              {badge.label}
            </span>
            {contract.isArchived && (
              <span className="px-2.5 py-1 rounded-full font-bold border text-xs bg-slate-100 text-slate-600 border-slate-300">
                مؤرشف
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {contract.contractType?.name} • تم الإنشاء بواسطة {contract.createdBy?.fullName || 'النظام'} في {formatDate(contract.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('contracts:edit') && contract.status === 'DRAFT' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/contracts/${contract.id}/edit`)}
              icon={<Pencil className="w-4 h-4" />}
            >
              تعديل العقد
            </Button>
          )}

          {hasPermission('contracts:archive') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchiveToggle}
              icon={contract.isArchived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            >
              {contract.isArchived ? 'استعادة من الأرشيف' : 'أرشفة'}
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            icon={<Printer className="w-4 h-4" />}
            className="shadow-emerald-600/20"
          >
            معاينة وطباعة الوثيقة الرسمية
          </Button>
        </div>
      </div>

      {/* Main Metadata Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Customer info */}
        <Card bodyClassName="p-4">
          <span className="text-xs text-slate-500 font-bold block mb-1">الطرف الثاني (العميل)</span>
          <p className="text-sm font-black text-slate-900">{contract.customer?.fullName}</p>
          <p className="text-xs text-slate-600 font-mono mt-1" dir="ltr">
            {contract.customer?.phone}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            رقم الهوية: {contract.customer?.nationalId || '—'}
          </p>
        </Card>

        {/* Validity Dates */}
        <Card bodyClassName="p-4">
          <span className="text-xs text-slate-500 font-bold block mb-1">مدة وسريان العقد</span>
          <p className="text-xs font-bold text-slate-800">
            تاريخ التحرير: {formatDate(contract.issueDate)}
          </p>
          <p className="text-xs text-slate-700 mt-1">
            البداية: <span className="font-bold">{formatDate(contract.startDate)}</span>
          </p>
          <p className="text-xs text-slate-700 mt-0.5">
            الانتهاء: <span className="font-bold">{contract.endDate ? formatDate(contract.endDate) : 'مستمر / غير محدد'}</span>
          </p>
        </Card>

        {/* Financial info */}
        <Card bodyClassName="p-4">
          <span className="text-xs text-slate-500 font-bold block mb-1">القيمة المالية والسداد</span>
          <p className="text-lg font-black text-emerald-800">
            {formatCurrency(contract.totalAmount)}
          </p>
          <p className="text-xs text-slate-700 mt-1">
            طريقة الدفع: <span className="font-bold">{getPaymentMethodLabel(contract.paymentMethod)}</span>
          </p>
          {hasPermission('contracts:edit') && (
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-bold">تغيير الحالة:</span>
              <select
                value={contract.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-xs font-bold rounded-lg border border-slate-200 px-2 py-1 bg-white focus:outline-none"
              >
                <option value="ACTIVE">فعال</option>
                <option value="DRAFT">مسودة</option>
                <option value="EXPIRED">منتهي</option>
                <option value="CANCELLED">ملغي</option>
              </select>
            </div>
          )}
        </Card>
      </div>

      {/* Dynamic Fields Data */}
      {contract.fields && contract.fields.length > 0 && (
        <Card
          title="بيانات ومواصفات العقد (الحقول المخصصة)"
          subtitle="كافة البيانات المسجلة وفق نموذج وقالب هذا العقد"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contract.fields.map((f) => (
              <div key={f.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-bold block">{f.label}:</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block" dir="auto">
                  {f.currentValue || '—'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Terms and Conditions */}
      <Card
        title="الشروط والأحكام والبنود المعتمدة"
        subtitle="البنود النظامية التي وافق عليها طرفا العقد"
      >
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
          {contract.termsAndConditions || 'لا توجد شروط مدونة.'}
        </div>
        {contract.notes && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <span className="font-bold block mb-0.5">ملاحظات إضافية:</span>
            <span>{contract.notes}</span>
          </div>
        )}
      </Card>

      {/* Contract Preview Modal */}
      <ContractPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        contract={contract}
        settings={settings}
      />
    </div>
  );
};
