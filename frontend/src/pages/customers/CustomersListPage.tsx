import React, { useState, useEffect, useCallback } from 'react';
import api from '../../config/api';
import { Customer } from '../../types/customer.types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Phone,
  CreditCard,
  MapPin,
  Calendar,
  X,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CustomersListPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    nationalId: '',
    address: '',
    governorate: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Customer Contracts Modal
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [customerContracts, setCustomerContracts] = useState<any[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/customers', {
        params: { search, page, limit },
      });
      if (res.data.success) {
        setCustomers(res.data.data);
        setTotal(res.data.meta?.total || 0);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'فشل جلب قائمة العملاء');
    } finally {
      setIsLoading(false);
    }
  }, [search, page, limit, error]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      fullName: '',
      phone: '',
      nationalId: '',
      address: '',
      governorate: '',
      notes: '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      fullName: customer.fullName,
      phone: customer.phone,
      nationalId: customer.nationalId || '',
      address: customer.address || '',
      governorate: customer.governorate || '',
      notes: customer.notes || '',
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, formData);
        success('تم تعديل بيانات العميل بنجاح');
      } else {
        await api.post('/customers', formData);
        success('تمت إضافة العميل بنجاح');
      }
      setIsFormModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      const validationMessage = err.response?.data?.errors?.[0]?.message;
      error(validationMessage || err.response?.data?.message || 'حدث خطأ أثناء حفظ بيانات العميل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/customers/${deleteId}`);
      success('تم حذف العميل بنجاح');
      setDeleteId(null);
      fetchCustomers();
    } catch (err: any) {
      error(err.response?.data?.message || 'فشل حذف العميل، قد توجد عقود نشطة مرتبطة به');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewContracts = async (customer: Customer) => {
    setViewCustomer(customer);
    setIsLoadingContracts(true);
    try {
      const res = await api.get(`/customers/${customer.id}`);
      if (res.data.success) {
        setCustomerContracts(res.data.data.contracts || []);
      }
    } catch {
      error('فشل جلب عقود العميل');
    } finally {
      setIsLoadingContracts(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            إدارة العملاء
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            سجل العملاء المعتمدين وعرض العقود المصدرة لكل عميل
          </p>
        </div>

        {hasPermission('customers:create') && (
          <Button
            variant="primary"
            onClick={handleOpenAdd}
            icon={<Plus className="w-5 h-5" />}
            className="shadow-emerald-600/20"
          >
            إضافة عميل جديد
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <Card bodyClassName="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم، رقم الهاتف، رقم الهوية أو رقم العميل..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 pr-10 pl-4 py-2 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
            />
          </div>
          {search && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearch('')}
              icon={<X className="w-3.5 h-3.5" />}
            >
              مسح الفلتر
            </Button>
          )}
        </div>
      </Card>

      {/* Customers Table */}
      <Card bodyClassName="p-0">
        {isLoading ? (
          <LoadingSpinner message="جاري جلب قائمة العملاء..." />
        ) : customers.length === 0 ? (
          <EmptyState
            title="لا يوجد عملاء مطابقين"
            description="لم يتم العثور على أي عميل مسجل بهذا البحث."
            actionText={hasPermission('customers:create') ? 'إضافة عميل جديد' : undefined}
            onAction={hasPermission('customers:create') ? handleOpenAdd : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                  <th className="py-3.5 px-5">رقم العميل</th>
                  <th className="py-3.5 px-5">الاسم الكامل</th>
                  <th className="py-3.5 px-5">رقم الهاتف</th>
                  <th className="py-3.5 px-5">رقم الهوية / السجل</th>
                  <th className="py-3.5 px-5">المحافظة / المدينة</th>
                  <th className="py-3.5 px-5 text-center">العقود</th>
                  <th className="py-3.5 px-5">تاريخ الإضافة</th>
                  <th className="py-3.5 px-5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-emerald-800">
                      {c.customerNumber}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">{c.fullName}</td>
                    <td className="py-3.5 px-5 font-mono text-slate-700" dir="ltr">
                      {c.phone}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-600">
                      {c.nationalId || '—'}
                    </td>
                    <td className="py-3.5 px-5 text-slate-700">{c.governorate || '—'}</td>
                    <td className="py-3.5 px-5 text-center">
                      <button
                        onClick={() => handleViewContracts(c)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
                        title="عرض عقود العميل"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{c.contractsCount || 0} عقود</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">{formatDate(c.createdAt)}</td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {hasPermission('customers:edit') && (
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="تعديل العميل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {hasPermission('customers:delete') && (
                          <button
                            onClick={() => setDeleteId(c.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="حذف العميل"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
        maxWidth="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="الاسم الكامل"
            required
            placeholder="مثال: عبدالله بن فهد التميمي"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />

          <Input
            label="رقم الهاتف"
            required
            type="tel"
            placeholder="05xxxxxxxx"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="رقم الهوية الوطنية / الإقامة / السجل التجاري"
            placeholder="10xxxxxxxx"
            value={formData.nationalId}
            onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="المحافظة / المدينة"
              placeholder="بغداد، البصرة، أربيل..."
              value={formData.governorate}
              onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
            />
            <Input
              label="العنوان بالتفصيل"
              placeholder="اسم الحي والشارع..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <Textarea
            label="ملاحظات إضافية"
            placeholder="أي تفاصيل أو متطلبات خاصة بالعميل..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormModalOpen(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingCustomer ? 'حفظ التعديلات' : 'إضافة العميل'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="تأكيد حذف العميل"
        message="هل أنت متأكد من رغبتك في حذف هذا العميل؟ لا يمكن التراجع عن هذه العملية إذا لم تكن له عقود مرتبطة."
        confirmText="نعم، حذف العميل"
        isLoading={isDeleting}
      />

      {/* Customer Contracts Modal */}
      <Modal
        isOpen={!!viewCustomer}
        onClose={() => setViewCustomer(null)}
        title={`سجل عقود العميل: ${viewCustomer?.fullName}`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-3">
            <div>
              <span className="text-slate-500 font-semibold">رقم العميل: </span>
              <span className="font-mono font-bold text-slate-800">{viewCustomer?.customerNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">الهاتف: </span>
              <span className="font-mono font-bold text-slate-800">{viewCustomer?.phone}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">المحافظة: </span>
              <span className="font-bold text-slate-800">{viewCustomer?.governorate || '—'}</span>
            </div>
          </div>

          {isLoadingContracts ? (
            <LoadingSpinner message="جاري جلب عقود العميل..." />
          ) : customerContracts.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              لا توجد عقود مسجلة لهذا العميل حتى الآن.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2">
              {customerContracts.map((con) => (
                <div
                  key={con.id}
                  onClick={() => {
                    setViewCustomer(null);
                    navigate(`/contracts/${con.id}`);
                  }}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span className="font-mono text-emerald-800">{con.contractNumber}</span>
                      <span>•</span>
                      <span>{con.contractType?.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      من {formatDate(con.startDate)} إلى {con.endDate ? formatDate(con.endDate) : 'مستمر'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800">{formatCurrency(con.totalAmount)}</span>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setViewCustomer(null)}>
              إغلاق
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
