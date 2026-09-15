import React, { useState, useEffect, useCallback } from 'react';
import api from '../../config/api';
import { User, Role } from '../../types/auth.types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';
import {
  UserCog,
  Plus,
  Edit2,
  Trash2,
  Power,
  ShieldCheck,
  UserCheck,
  Eye,
} from 'lucide-react';

export const UsersManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    roleId: '',
    mustChangePassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Dialog
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsersAndRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/roles'),
      ]);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (rolesRes.data.success) {
        setRoles(rolesRes.data.data);
        if (rolesRes.data.data.length > 0 && !formData.roleId) {
          setFormData((prev) => ({ ...prev, roleId: rolesRes.data.data[0].id }));
        }
      }
    } catch {
      error('فشل جلب بيانات المستخدمين والأدوار');
    } finally {
      setIsLoading(false);
    }
  }, [error, formData.roleId]);

  useEffect(() => {
    fetchUsersAndRoles();
  }, [fetchUsersAndRoles]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      phone: '',
      roleId: roles[0]?.id || '',
      mustChangePassword: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: any) => {
    setEditingUser(u);
    setFormData({
      username: u.username,
      email: u.email,
      password: '',
      fullName: u.fullName,
      phone: u.phone || '',
      roleId: u.roleId || '',
      mustChangePassword: !!u.mustChangePassword,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingUser) {
        const payload: any = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          roleId: formData.roleId,
        };
        if (formData.password) payload.password = formData.password;
        await api.put(`/users/${editingUser.id}`, payload);
        success('تم تعديل المستخدم بنجاح');
      } else {
        await api.post('/users', formData);
        success('تم إنشاء حساب المستخدم بنجاح');
      }
      setIsModalOpen(false);
      fetchUsersAndRoles();
    } catch (err: any) {
      error(err.response?.data?.message || 'فشل حفظ بيانات المستخدم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userToToggle: User) => {
    if (userToToggle.id === currentUser?.id) {
      error('لا يمكنك تعطيل حسابك الشخصي النشط');
      return;
    }
    try {
      await api.patch(`/users/${userToToggle.id}/toggle-status`);
      success('تم تحديث حالة الحساب بنجاح');
      fetchUsersAndRoles();
    } catch (err: any) {
      error(err.response?.data?.message || 'فشل تحديث حالة الحساب');
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/users/${deleteUserId}`);
      success('تم حذف المستخدم بنجاح');
      setDeleteUserId(null);
      fetchUsersAndRoles();
    } catch (err: any) {
      error(err.response?.data?.message || 'فشل حذف المستخدم');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="جاري جلب قائمة المستخدمين..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCog className="w-7 h-7 text-emerald-600" />
            <span>إدارة المستخدمين والصلاحيات</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إضافة الموظفين والمسؤولين وتحديد الصلاحيات ومتابعة الحسابات النشطة
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenAdd}
          icon={<Plus className="w-5 h-5" />}
          className="shadow-emerald-600/20"
        >
          إضافة مستخدم جديد
        </Button>
      </div>

      {/* Users Table */}
      <Card bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                <th className="py-3.5 px-5">المستخدم</th>
                <th className="py-3.5 px-5">الاسم الكامل</th>
                <th className="py-3.5 px-5">البريد الإلكتروني</th>
                <th className="py-3.5 px-5">الدور والصلاحية</th>
                <th className="py-3.5 px-5 text-center">العقود المنشأة</th>
                <th className="py-3.5 px-5 text-center">حالة الحساب</th>
                <th className="py-3.5 px-5">تاريخ التسجيل</th>
                <th className="py-3.5 px-5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isCurrent = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      {u.username}
                      {isCurrent && (
                        <span className="mr-1.5 px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                          أنت
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">{u.fullName}</td>
                    <td className="py-3.5 px-5 text-slate-600 font-mono">{u.email}</td>
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                        {u.roleName || u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center font-bold text-slate-700">
                      {u.contractsCount || 0}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {u.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          نشط
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          معطل
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="تعديل المستخدم"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isCurrent}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isCurrent
                              ? 'opacity-30 cursor-not-allowed'
                              : u.isActive
                              ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={u.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteUserId(u.id)}
                          disabled={isCurrent || (u.contractsCount || 0) > 0}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isCurrent || (u.contractsCount || 0) > 0
                              ? 'opacity-20 cursor-not-allowed'
                              : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title="حذف المستخدم"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `تعديل المستخدم: ${editingUser.username}` : 'إضافة مستخدم جديد'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingUser && (
            <Input
              label="اسم المستخدم (Username)"
              required
              placeholder="مثال: ahmed_ali"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })}
            />
          )}

          <Input
            label="الاسم الكامل"
            required
            placeholder="مثال: أحمد علي المحمد"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />

          <Input
            label="البريد الإلكتروني"
            required
            type="email"
            placeholder="user@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label={editingUser ? 'كلمة مرور جديدة (اتركه فارغاً للإبقاء على الحالية)' : 'كلمة المرور'}
            required={!editingUser}
            type="password"
            placeholder="6 أحرف أو أرقام على الأقل"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <Input
            label="رقم الهاتف"
            type="tel"
            placeholder="05xxxxxxxx"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Select
            label="الدور الوظيفي والصلاحيات"
            options={roles.map((r) => ({ value: r.id, label: `${r.displayName} (${r.name})` }))}
            value={formData.roleId}
            onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
          />

          {!editingUser && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="mustChangePassCheck"
                checked={formData.mustChangePassword}
                onChange={(e) => setFormData({ ...formData, mustChangePassword: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="mustChangePassCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                إجبار المستخدم على تغيير كلمة المرور فور تسجيل دخوله الأول
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingUser ? 'حفظ التعديلات' : 'إنشاء المستخدم'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDelete}
        title="تأكيد حذف المستخدم"
        message="هل أنت متأكد من حذف هذا الحساب؟ لا يمكن حذف المستخدم إذا كان قد قام بإصدار عقود مسجلة سابقاً."
        confirmText="نعم، حذف المستخدم"
        isLoading={isDeleting}
      />
    </div>
  );
};
