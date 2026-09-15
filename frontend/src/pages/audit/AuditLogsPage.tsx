import React, { useState, useEffect, useCallback } from 'react';
import api from '../../config/api';
import { Card } from '../../components/ui/Card';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ShieldCheck, Eye, Terminal, User, Clock, Globe } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [isLoading, setIsLoading] = useState(true);

  // Details Modal
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/audit-logs', {
        params: { page, limit },
      });
      if (res.data.success) {
        setLogs(res.data.data);
        setTotal(res.data.meta?.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadge = (action: string) => {
    if (action.includes('CREATE') || action.includes('ADD')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (action.includes('UPDATE') || action.includes('EDIT')) {
      return 'bg-sky-50 text-sky-700 border-sky-200';
    }
    if (action.includes('DELETE') || action.includes('ARCHIVE')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (action.includes('LOGIN')) {
      return 'bg-teal-50 text-teal-700 border-teal-200';
    }
    if (action.includes('PDF') || action.includes('PRINT')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getActionName = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'تسجيل دخول';
      case 'PASSWORD_CHANGE':
        return 'تغيير كلمة المرور';
      case 'CONTRACT_CREATE':
        return 'إصدار وإنشاء عقد';
      case 'CONTRACT_UPDATE':
        return 'تعديل بيانات عقد';
      case 'CONTRACT_STATUS_CHANGE':
        return 'تغيير حالة عقد';
      case 'CONTRACT_ARCHIVE':
        return 'أرشفة عقد';
      case 'CONTRACT_RESTORE':
        return 'استعادة عقد';
      case 'CONTRACT_DELETE_SOFT':
        return 'حذف عقد (Soft Delete)';
      case 'PDF_EXPORT_OR_PRINT':
        return 'تصدير PDF أو طباعة';
      case 'CUSTOMER_CREATE':
        return 'إضافة عميل';
      case 'CUSTOMER_UPDATE':
        return 'تعديل بيانات عميل';
      case 'CUSTOMER_DELETE':
        return 'حذف عميل';
      case 'USER_CREATE':
        return 'إنشاء حساب موظف/مستخدم';
      case 'USER_UPDATE':
        return 'تعديل حساب موظف';
      case 'USER_ACTIVATE':
        return 'تفعيل حساب مستخدم';
      case 'USER_DEACTIVATE':
        return 'تعطيل حساب مستخدم';
      case 'USER_DELETE':
        return 'حذف مستخدم';
      case 'CONTRACT_TYPE_CREATE':
        return 'إنشاء نوع عقد جديد';
      case 'CONTRACT_FIELD_ADD':
        return 'إضافة حقل مخصص للقالب';
      case 'CONTRACT_FIELD_DELETE':
        return 'حذف حقل من القالب';
      case 'SETTINGS_UPDATE':
        return 'تحديث إعدادات النظام';
      default:
        return action;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-emerald-600" />
          <span>سجل العمليات والمراجعة (Audit Log)</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          تسجيل دقيق وغير قابل للتعديل لكافة العمليات، تسجيل الدخول، إصدار العقود والتعديلات وعناوين الـ IP
        </p>
      </div>

      {/* Logs Table */}
      <Card bodyClassName="p-0">
        {isLoading ? (
          <LoadingSpinner message="جاري جلب سجل العمليات..." />
        ) : logs.length === 0 ? (
          <EmptyState title="لا توجد عمليات مسجلة" description="لم يتم تسجيل أي عمليات حتى الآن." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                  <th className="py-3.5 px-4">المستخدم</th>
                  <th className="py-3.5 px-4">نوع العملية</th>
                  <th className="py-3.5 px-4">الكائن المتأثر</th>
                  <th className="py-3.5 px-4">عنوان IP</th>
                  <th className="py-3.5 px-4">التاريخ والوقت</th>
                  <th className="py-3.5 px-4 text-center">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {log.user?.fullName || log.user?.username || 'النظام'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {log.user?.role?.displayName || ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-bold border text-[10px] ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {getActionName(log.action)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-700">{log.entity}</span>
                      {log.entityId && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {log.entityId.slice(0, 8)}...
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]" dir="ltr">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(log.createdAt).toLocaleString('ar-IQ')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        icon={<Eye className="w-3.5 h-3.5" />}
                        className="text-[11px] py-1 px-2.5"
                      >
                        عرض التفاصيل
                      </Button>
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

      {/* Log Details Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="تفاصيل العملية المسجلة في الـ Audit Log"
        maxWidth="lg"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 font-bold block">المستخدم:</span>
                <span className="font-bold text-slate-900">
                  {selectedLog.user?.fullName || selectedLog.user?.username || 'النظام'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">العملية:</span>
                <span className="font-bold text-emerald-800">
                  {getActionName(selectedLog.action)} ({selectedLog.action})
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">الوقت والتاريخ:</span>
                <span className="text-slate-800">
                  {new Date(selectedLog.createdAt).toLocaleString('ar-IQ')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">عنوان IP:</span>
                <span className="font-mono text-slate-800" dir="ltr">
                  {selectedLog.ipAddress || '127.0.0.1'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-600 font-bold block mb-1">
                بيانات وتفاصيل التغيير (JSON Payload):
              </span>
              <pre
                className="p-4 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto font-mono text-[11px] max-h-60 leading-relaxed"
                dir="ltr"
              >
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedLog(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
