import React from 'react';
import { AlertCircle, X, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DemoBanner: React.FC = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = React.useState(false);

  const isDemoUser = user?.role === 'DEMO';

  if (!isDemoUser || dismissed) return null;

  return (
    <div className="fixed top-20 right-4 left-4 lg:right-8 lg:left-auto lg:top-24 lg:w-96 z-40 animate-in slide-in-from-top-2">
      <div className="bg-gradient-to-r from-emerald-50 via-emerald-100/50 to-emerald-50 border border-emerald-200 rounded-2xl shadow-lg p-4 flex items-start gap-3">
        <div className="flex-shrink-0 p-2 rounded-xl bg-emerald-500 text-white">
          <Info className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-emerald-900">🎯 النسخة التجريبية (Demo Mode)</h4>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg text-emerald-500 hover:bg-emerald-100 transition-colors"
              aria-label="إخفاء التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
            يمكنك تجربة جميع الوظائف الأساسية للنظام: إنشاء العقود، إدارة العملاء، القوالب، والتقارير.
          </p>
          <p className="text-[11px] text-emerald-700 mt-2">
            <span className="font-bold">بعض القيود:</span> لا يمكن حذف المستخدمين، تعديل إعدادات النظام، أرشفة العقود، أو إنشاء حسابات إدارية.
          </p>
        </div>
      </div>
    </div>
  );
};