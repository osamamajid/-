import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { KeyRound, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../config/api';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  isForced?: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  isForced = false,
}) => {
  const { updatePasswordStatus } = useAuth();
  const { success, error } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (newPassword.length < 6) {
      setFormError('كلمة المرور الجديدة يجب أن تتكون من 6 خانات على الأقل');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        success('تم تغيير كلمة المرور بنجاح');
        updatePasswordStatus(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'فشل تغيير كلمة المرور، تأكد من كلمة المرور الحالية';
      setFormError(msg);
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isForced ? () => {} : onClose}
      showCloseButton={!isForced}
      title={
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-emerald-600" />
          <span>{isForced ? 'إجراء أمني: تغيير كلمة المرور الإلزامية' : 'تغيير كلمة المرور'}</span>
        </div>
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isForced && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">يرجى تعيين كلمة مرور جديدة للمتابعة</p>
              <p className="text-amber-700 mt-0.5">
                لأسباب أمنية، يجب عليك تغيير كلمة المرور الافتراضية عند أول تسجيل دخول لك في النظام.
              </p>
            </div>
          </div>
        )}

        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {formError}
          </div>
        )}

        <Input
          label="كلمة المرور الحالية"
          type="password"
          required
          placeholder="أدخل كلمة المرور الحالية (مثل Admin@123456)"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <Input
          label="كلمة المرور الجديدة"
          type="password"
          required
          placeholder="6 أحرف أو أرقام على الأقل"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <Input
          label="تأكيد كلمة المرور الجديدة"
          type="password"
          required
          placeholder="أعد إدخال كلمة المرور الجديدة"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <div className="pt-2 flex items-center justify-end gap-3">
          {!isForced && (
            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
              إلغاء
            </Button>
          )}
          <Button variant="primary" type="submit" isLoading={isLoading} className="w-full sm:w-auto">
            حفظ كلمة المرور الجديدة
          </Button>
        </div>
      </form>
    </Modal>
  );
};
