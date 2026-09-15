import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../config/api';
import { Contract, ContractType, ContractStatus } from '../../types/contract.types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ContractPreviewModal } from '../../components/contracts/ContractPreviewModal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, getStatusBadge, getPaymentMethodLabel } from '../../utils/formatters';
import {
  Search,
  Plus,
  Eye,
  Printer,
  Archive,
  RotateCcw,
  Trash2,
  Filter,
  X,
  FileText,
  Clock,
  CheckCircle,
  MoreVertical,
  Calendar,
  Pencil,
} from 'lucide-react';

export const ContractsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermission } = useAuth();
  const { success, error } = useToast();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Filters from query params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [typeId, setTypeId] = useState(searchParams.get('typeId') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [isArchived, setIsArchived] = useState(searchParams.get('isArchived') || 'false');
  const [expiringWithinDays, setExpiringWithinDays] = useState(
    searchParams.get('expiringWithinDays') || ''
  );

  // Preview & Settings
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});

  // Action Dialogs
  const [actionContract, setActionContract] = useState<Contract | null>(null);
  const [actionType, setActionType] = useState<'archive' | 'restore' | 'delete' | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch Types and Settings once
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [typesRes, setRes] = await Promise.all([
          api.get('/contract-types'),
          api.get('/settings'),
        ]);
        if (typesRes.data.success) setContractTypes(typesRes.data.data);
        if (setRes.data.success) setSettings(setRes.data.data.settingsMap);
      } catch (err) {
        console.error('Failed to load types or settings', err);
      }
    };
    fetchMeta();
  }, []);

  const fetchContracts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit,
        search: search || undefined,
        typeId: typeId || undefined,
        status: status || undefined,
        isArchived: isArchived || undefined,
        expiringWithinDays: expiringWithinDays || undefined,
      };

      const res = await api.get('/contracts', { params });
      if (res.data.success) {
        setContracts(res.data.data);
        setTotal(res.data.meta?.total || 0);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'فشل جلب قائمة العقود');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, typeId, status, isArchived, expiringWithinDays, error]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Sync state when URL params change (e.g. from Dashboard alert click)
  useEffect(() => {
    const qExp = searchParams.get('expiringWithinDays');
    const qType = searchParams.get('typeId');
    if (qExp !== null) setExpiringWithinDays(qExp);
    if (qType !== null) setTypeId(qType);
  }, [searchParams]);

  const handleOpenPreview = async (contractId: string) => {
    try {
      const res = await api.get(`/contracts/${contractId}`);
      if (res.data.success) {
        setPreviewContract(res.data.data);
      }
    } catch {
      error('فشل جلب تفاصيل العقد للمعاينة');
    }
  };

  const handleStatusChange = async (contractId: string, newStatus: string) => {
    try {
      await api.patch(`/contracts/${contractId}/status`, { status: newStatus });
      success('تم تحديث حالة العقد بنجاح');
      fetchContracts();
    } catch (err: any) {
      error(err.response?.data?.message || 'فشل تحديث حالة العقد');
    }
  };

  const handleConfirmAction = async () => {
    if (!actionContract || !actionType) return;
    setIsActionLoading(true);
    try {
      if (actionType === 'archive') {
        await api.patch(`/contracts/${actionContract.id}/archive`);
        success('تم أرشفة العقد بنجاح');
      } else if (actionType === 'restore') {
        await api.patch(`/contracts/${actionContract.id}/restore`);
        success('تمت استعادة العقد بنجاح');
      } else if (actionType === 'delete') {
        await api.delete(`/contracts/${actionContract.id}`);
        success('تم حذف العقد مؤقتاً بنجاح');
      }
      setActionContract(null);
      setActionType(null);
      fetchContracts();
    } catch (err: any) {
      error(err.response?.data?.message || 'حدث خطأ أثناء تنفيذ العملية');
    } finally {
      setIsActionLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setTypeId('');
    setStatus('');
    setIsArchived('false');
    setExpiringWithinDays('');
    setSearchParams({});
    setPage(1);
  };

  const hasActiveFilters = !!(search || typeId || status || isArchived === 'true' || expiringWithinDays);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            سجل العقود {isArchived === 'true' && '(الأرشيف)'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            البحث المتقدم، تتبع حالات العقود، المعاينة والطباعة والأرشفة
          </p>
        </div>

        {hasPermission('contracts:create') && (
          <Button
            variant="primary"
            onClick={() => navigate('/contracts/create')}
            icon={<Plus className="w-5 h-5" />}
            className="shadow-emerald-600/20"
          >
            إنشاء عقد جديد
          </Button>
        )}
      </div>

      {/* Tabs: Active vs Archived */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => {
            setIsArchived('false');
            setPage(1);
          }}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            isArchived === 'false'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          العقود الجارية والنشطة
        </button>
        <button
          onClick={() => {
            setIsArchived('true');
            setPage(1);
          }}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            isArchived === 'true'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>الأرشيف الإلكتروني</span>
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search input */}
          <div className="relative sm:col-span-2">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث برقم العقد، اسم العميل، الهاتف أو الهوية..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 pr-10 pl-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeId}
            onChange={(e) => {
              setTypeId(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="">جميع أنواع العقود</option>
            {contractTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="">جميع الحالات</option>
            <option value="ACTIVE">فعال</option>
            <option value="DRAFT">مسودة</option>
            <option value="EXPIRED">منتهي</option>
            <option value="CANCELLED">ملغي</option>
          </select>

          {/* Expiring Soon filter */}
          <select
            value={expiringWithinDays}
            onChange={(e) => {
              setExpiringWithinDays(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
          >
            <option value="">تنبيهات الانتهاء (الكل)</option>
            <option value="7">⚠️ ينتهي خلال 7 أيام</option>
            <option value="15">⏳ ينتهي خلال 15 يوماً</option>
            <option value="30">📅 ينتهي خلال 30 يوماً</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500">تم تطبيق معايير بحث وتصفية</span>
            <button
              onClick={clearFilters}
              className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>إعادة ضبط وتفريغ الفلاتر</span>
            </button>
          </div>
        )}
      </Card>

      {/* Contracts Table */}
      <Card bodyClassName="p-0">
        {isLoading ? (
          <LoadingSpinner message="جاري جلب قائمة العقود..." />
        ) : contracts.length === 0 ? (
          <EmptyState
            title="لا توجد عقود مطابقة"
            description="لم يتم العثور على أي عقود تطابق معايير البحث والفلترة المحددة."
            actionText={hasPermission('contracts:create') ? 'إنشاء عقد جديد' : undefined}
            onAction={hasPermission('contracts:create') ? () => navigate('/contracts/create') : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                  <th className="py-3.5 px-4">رقم العقد</th>
                  <th className="py-3.5 px-4">نوع العقد</th>
                  <th className="py-3.5 px-4">العميل (الطرف الثاني)</th>
                  <th className="py-3.5 px-4">سريان العقد</th>
                  <th className="py-3.5 px-4">القيمة وطريقة السداد</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4">المنشئ</th>
                  <th className="py-3.5 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.map((c) => {
                  const badge = getStatusBadge(c.status);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                        {c.contractNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {c.contractType?.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{c.customer?.fullName}</span>
                        <span className="text-[11px] text-slate-500 font-mono" dir="ltr">
                          {c.customer?.phone}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>من: {formatDate(c.startDate)}</div>
                        <div className="text-[11px] text-slate-400">
                          إلى: {c.endDate ? formatDate(c.endDate) : 'غير محدد'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{formatCurrency(c.totalAmount)}</div>
                        <div className="text-[11px] text-slate-500">
                          {getPaymentMethodLabel(c.paymentMethod)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={c.status}
                          disabled={!hasPermission('contracts:edit')}
                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-[10px] font-bold border cursor-pointer focus:outline-none ${badge.className}`}
                        >
                          <option value="ACTIVE">فعال</option>
                          <option value="DRAFT">مسودة</option>
                          <option value="EXPIRED">منتهي</option>
                          <option value="CANCELLED">ملغي</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {c.createdBy?.fullName || 'النظام'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Preview & Print */}
                          <button
                            onClick={() => handleOpenPreview(c.id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="معاينة وطباعة وتصدير PDF"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {hasPermission('contracts:edit') && c.status === 'DRAFT' && (
                            <button
                              onClick={() => navigate(`/contracts/${c.id}/edit`)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                              title="تعديل العقد"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}

                          {/* Archive / Restore */}
                          {hasPermission('contracts:archive') && (
                            <>
                              {c.isArchived ? (
                                <button
                                  onClick={() => {
                                    setActionContract(c);
                                    setActionType('restore');
                                  }}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                                  title="استعادة من الأرشيف"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setActionContract(c);
                                    setActionType('archive');
                                  }}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                  title="أرشفة العقد"
                                >
                                  <Archive className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}

                          {/* Soft Delete */}
                          {hasPermission('contracts:delete') && (
                            <button
                              onClick={() => {
                                setActionContract(c);
                                setActionType('delete');
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="حذف مؤقت"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / limit)}
          totalItems={total}
          limit={limit}
          onPageChange={setPage}
        />
      </Card>

      {/* Contract Preview & Print Modal */}
      <ContractPreviewModal
        isOpen={!!previewContract}
        onClose={() => setPreviewContract(null)}
        contract={previewContract}
        settings={settings}
      />

      {/* Action Dialog (Archive / Restore / Delete) */}
      <ConfirmDialog
        isOpen={!!actionContract && !!actionType}
        onClose={() => {
          setActionContract(null);
          setActionType(null);
        }}
        onConfirm={handleConfirmAction}
        title={
          actionType === 'archive'
            ? 'تأكيد أرشفة العقد'
            : actionType === 'restore'
            ? 'تأكيد استعادة العقد'
            : 'تأكيد الحذف المؤقت للعقد'
        }
        message={
          actionType === 'archive'
            ? `هل أنت متأكد من نقل العقد (${actionContract?.contractNumber}) إلى الأرشيف الإلكتروني؟`
            : actionType === 'restore'
            ? `هل ترغب في استعادة العقد (${actionContract?.contractNumber}) إلى قائمة العقود الجارية؟`
            : `هل أنت متأكد من حذف العقد (${actionContract?.contractNumber})؟ سيتم تطبيق حذف ناعم (Soft Delete) ويمكن استعادته لاحقاً.`
        }
        confirmText={
          actionType === 'archive'
            ? 'نعم، أرشفة العقد'
            : actionType === 'restore'
            ? 'نعم، استعادة العقد'
            : 'نعم، حذف العقد'
        }
        variant={actionType === 'delete' ? 'danger' : 'primary'}
        isLoading={isActionLoading}
      />
    </div>
  );
};
