import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { ContractType } from '../../types/contract.types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { exportToCSV } from '../../utils/exportHelpers';
import { formatCurrency, formatDate, getStatusBadge, getPaymentMethodLabel } from '../../utils/formatters';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  FileText,
  Users,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ReportsPage: React.FC = () => {
  const { error } = useToast();

  const [activeTab, setActiveTab] = useState<'contracts' | 'revenues' | 'customers'>('contracts');
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Contracts Report Filters
  const [typeId, setTypeId] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [contractsData, setContractsData] = useState<any>({ count: 0, totalAmount: 0, contracts: [] });

  // Revenues Report
  const [revenuesData, setRevenuesData] = useState<any>({ totalRevenue: 0, contractsCount: 0, byPaymentMethod: {}, contracts: [] });

  // Customers Report
  const [customersData, setCustomersData] = useState<any>({ count: 0, customers: [] });

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await api.get('/contract-types');
        if (res.data.success) setContractTypes(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTypes();
  }, []);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'contracts') {
        const res = await api.get('/reports/contracts', {
          params: { typeId: typeId || undefined, status: status || undefined, startDate: startDate || undefined, endDate: endDate || undefined, paymentMethod: paymentMethod || undefined },
        });
        if (res.data.success) setContractsData(res.data.data);
      } else if (activeTab === 'revenues') {
        const res = await api.get('/reports/revenues', {
          params: { startDate: startDate || undefined, endDate: endDate || undefined },
        });
        if (res.data.success) setRevenuesData(res.data.data);
      } else if (activeTab === 'customers') {
        const res = await api.get('/reports/customers');
        if (res.data.success) setCustomersData(res.data.data);
      }
    } catch {
      error('فشل استخراج التقرير المطلوب');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, typeId, status, startDate, endDate, paymentMethod]);

  const governorateCounts = customersData.customers.reduce((counts: Record<string, number>, customer: any) => {
    if (customer.governorate) {
      counts[customer.governorate] = (counts[customer.governorate] || 0) + customer.totalContracts;
    }
    return counts;
  }, {});
  const topGovernorate = Object.entries(governorateCounts).sort(([, a], [, b]) => Number(b) - Number(a))[0]?.[0] || '—';

  const handleExportExcel = () => {
    if (activeTab === 'contracts') {
      const headers = [
        { key: 'contractNumber', label: 'رقم العقد' },
        { key: 'customerName', label: 'اسم العميل' },
        { key: 'typeName', label: 'نوع العقد' },
        { key: 'issueDate', label: 'تاريخ التحرير' },
        { key: 'startDate', label: 'تاريخ البداية' },
        { key: 'endDate', label: 'تاريخ الانتهاء' },
        { key: 'totalAmount', label: 'القيمة' },
        { key: 'status', label: 'الحالة' },
      ];
      const rows = contractsData.contracts.map((c: any) => ({
        contractNumber: c.contractNumber,
        customerName: c.customer?.fullName,
        typeName: c.contractType?.name,
        issueDate: formatDate(c.issueDate),
        startDate: formatDate(c.startDate),
        endDate: c.endDate ? formatDate(c.endDate) : 'غير محدد',
        totalAmount: c.totalAmount,
        status: c.status,
      }));
      exportToCSV(rows, `تقرير_العقود_${new Date().toISOString().split('T')[0]}`, headers);
    } else if (activeTab === 'revenues') {
      const headers = [
        { key: 'contractNumber', label: 'رقم العقد' },
        { key: 'customerName', label: 'العميل' },
        { key: 'typeName', label: 'نوع العقد' },
        { key: 'totalAmount', label: 'المبلغ' },
        { key: 'paymentMethod', label: 'طريقة الدفع' },
        { key: 'startDate', label: 'تاريخ السداد' },
      ];
      const rows = revenuesData.contracts.map((c: any) => ({
        contractNumber: c.contractNumber,
        customerName: c.customer?.fullName,
        typeName: c.contractType?.name,
        totalAmount: c.totalAmount,
        paymentMethod: getPaymentMethodLabel(c.paymentMethod),
        startDate: formatDate(c.startDate),
      }));
      exportToCSV(rows, `تقرير_الإيرادات_${new Date().toISOString().split('T')[0]}`, headers);
    } else {
      const headers = [
        { key: 'customerNumber', label: 'رقم العميل' },
        { key: 'fullName', label: 'الاسم الكامل' },
        { key: 'phone', label: 'رقم الهاتف' },
        { key: 'nationalId', label: 'رقم الهوية' },
        { key: 'governorate', label: 'المحافظة' },
        { key: 'totalContracts', label: 'عدد العقود' },
        { key: 'totalSpend', label: 'إجمالي المبالغ' },
      ];
      exportToCSV(customersData.customers, `تقرير_العملاء_${new Date().toISOString().split('T')[0]}`, headers);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-emerald-600" />
            <span>التقارير والإحصائيات الشاملة</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            استخراج تقارير تفصيلية مع إمكانية التصدير لـ Excel والطباعة وPDF
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            icon={<Download className="w-4 h-4" />}
          >
            تصدير Excel (CSV)
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            طباعة التقرير
          </Button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-3 border-b border-slate-200 text-xs font-bold no-print">
        <button
          onClick={() => setActiveTab('contracts')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'contracts'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>تقرير العقود المصدرة</span>
        </button>

        <button
          onClick={() => setActiveTab('revenues')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'revenues'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>تقرير الإيرادات والمبالغ</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'customers'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>تقرير العملاء والتعاقدات</span>
        </button>
      </div>

      {/* Filter Toolbar (Only for Contracts tab) */}
      {activeTab === 'contracts' && (
        <Card bodyClassName="p-4 no-print">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">كافة أنواع العقود</option>
              {contractTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">كافة الحالات</option>
              <option value="ACTIVE">النشطة فقط</option>
              <option value="EXPIRED">المنتهية فقط</option>
              <option value="DRAFT">المسودات فقط</option>
              <option value="CANCELLED">الملغاة فقط</option>
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              title="تاريخ البداية من"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              title="تاريخ النهاية إلى"
            />

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">كافة طرق السداد</option>
              <option value="CASH">نقداً</option>
              <option value="BANK_TRANSFER">تحويل بنكي</option>
              <option value="CHEQUE">شيك مصدق</option>
              <option value="INSTALLMENT">أقساط</option>
            </select>
          </div>
        </Card>
      )}

      {/* Summary KPI Bar for active report */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {activeTab === 'contracts' && (
          <>
            <Card bodyClassName="p-4 text-center">
              <span className="text-xs text-slate-500 font-bold">عدد العقود المضمنة</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{contractsData.count}</p>
            </Card>
            <Card bodyClassName="p-4 text-center">
              <span className="text-xs text-slate-500 font-bold">إجمالي قيمة العقود</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {formatCurrency(contractsData.totalAmount)}
              </p>
            </Card>
            <Card bodyClassName="p-4 text-center">
              <span className="text-xs text-slate-500 font-bold">متوسط قيمة العقد</span>
              <p className="text-2xl font-black text-slate-800 mt-1">
                {contractsData.count > 0
                  ? formatCurrency(Math.round(contractsData.totalAmount / contractsData.count))
                  : formatCurrency(0)}
              </p>
            </Card>
          </>
        )}

        {activeTab === 'revenues' && (
          <>
            <Card bodyClassName="p-4 text-center">
              <span className="text-xs text-slate-500 font-bold">إجمالي الإيرادات المحققة</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {formatCurrency(revenuesData.totalRevenue)}
              </p>
            </Card>
            <Card bodyClassName="p-4 text-center">
              <span className="text-xs text-slate-500 font-bold">عدد العقود المسددة</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{revenuesData.contractsCount}</p>
            </Card>
            <Card bodyClassName="p-4 text-center">
              <span className="text-xs text-slate-500 font-bold">توزيع طرق السداد</span>
              <div className="flex justify-center gap-3 text-xs mt-2 font-bold text-slate-700">
                <span>نقداً: {revenuesData.byPaymentMethod?.CASH || 0}</span>
                <span>تحويل: {revenuesData.byPaymentMethod?.BANK_TRANSFER || 0}</span>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'customers' && (
          <>
            <Card bodyClassName="p-4 text-center">
              <span className="text-xs text-slate-500 font-bold">إجمالي العملاء</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{customersData.count}</p>
            </Card>
            <Card bodyClassName="p-4 text-center">
              <span className="text-xs text-slate-500 font-bold">عملاء نشطون بعقود</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {customersData.customers.filter((c: any) => c.activeContracts > 0).length}
              </p>
            </Card>
            <Card bodyClassName="p-4 text-center">
              <span className="text-xs text-slate-500 font-bold">أعلى محافظة تعاقداً</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{topGovernorate}</p>
            </Card>
          </>
        )}
      </div>

      {/* Report Table Card */}
      <Card bodyClassName="p-0">
        {isLoading ? (
          <LoadingSpinner message="جاري إعداد التقرير..." />
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'contracts' && (
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                    <th className="py-3 px-4">رقم العقد</th>
                    <th className="py-3 px-4">العميل</th>
                    <th className="py-3 px-4">نوع العقد</th>
                    <th className="py-3 px-4">تاريخ التحرير</th>
                    <th className="py-3 px-4">السريان</th>
                    <th className="py-3 px-4">القيمة المالية</th>
                    <th className="py-3 px-4">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contractsData.contracts.map((c: any) => {
                    const b = getStatusBadge(c.status);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-800">{c.contractNumber}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{c.customer?.fullName}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{c.contractType?.name}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(c.issueDate)}</td>
                        <td className="py-3 px-4 text-slate-600">
                          من {formatDate(c.startDate)} إلى {c.endDate ? formatDate(c.endDate) : 'مستمر'}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(c.totalAmount)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${b.className}`}>
                            {b.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {activeTab === 'revenues' && (
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                    <th className="py-3 px-4">رقم العقد</th>
                    <th className="py-3 px-4">العميل</th>
                    <th className="py-3 px-4">نوع العقد</th>
                    <th className="py-3 px-4">المبلغ</th>
                    <th className="py-3 px-4">طريقة السداد</th>
                    <th className="py-3 px-4">تاريخ البداية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {revenuesData.contracts.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">{c.contractNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{c.customer?.fullName}</td>
                      <td className="py-3 px-4 text-slate-800">{c.contractType?.name}</td>
                      <td className="py-3 px-4 font-black text-emerald-800">{formatCurrency(c.totalAmount)}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{getPaymentMethodLabel(c.paymentMethod)}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(c.startDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'customers' && (
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                    <th className="py-3 px-4">رقم العميل</th>
                    <th className="py-3 px-4">اسم العميل</th>
                    <th className="py-3 px-4">الهاتف</th>
                    <th className="py-3 px-4">الهوية / السجل</th>
                    <th className="py-3 px-4">المحافظة</th>
                    <th className="py-3 px-4 text-center">إجمالي العقود</th>
                    <th className="py-3 px-4 text-center">العقود النشطة</th>
                    <th className="py-3 px-4">إجمالي الإنفاق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customersData.customers.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">{c.customerNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{c.fullName}</td>
                      <td className="py-3 px-4 font-mono text-slate-700" dir="ltr">{c.phone}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{c.nationalId || '—'}</td>
                      <td className="py-3 px-4 text-slate-700">{c.governorate || '—'}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">{c.totalContracts}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-700">{c.activeContracts}</td>
                      <td className="py-3 px-4 font-black text-slate-900">{formatCurrency(c.totalSpend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
