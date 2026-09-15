import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FileCheck2, Lock, User as UserIcon, Eye, EyeOff, ShieldCheck, Sparkles, Play, Copy, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success } = useToast();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const user = await login({ username, password });
      success(`مرحباً بك مجدداً، ${user.fullName}`);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg('');
  };

  const handleDemoLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const user = await login({ username: 'demo', password: 'Demo@12345' });
      success(`مرحباً بك في النسخة التجريبية، ${user.fullName}`);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'فشل تسجيل الدخول التجريبي');
    } finally {
      setIsLoading(false);
    }
  };

  const copyDemoCredentials = () => {
    const text = 'اسم المستخدم: demo\nكلمة المرور: Demo@12345';
    navigator.clipboard.writeText(text);
    success('تم نسخ بيانات الدخول التجريبية');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-right font-cairo">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Brand Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-xl shadow-emerald-900/50 mb-4 border border-emerald-400/30">
          <FileCheck2 className="w-9 h-9" />
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight">
          منصة <span className="text-emerald-400">العقد</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400 font-medium">
          النظام المتكامل لإدارة وإنشاء العقود الرسمية وقوالبها المخصصة
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-modal rounded-3xl sm:px-10 border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6 text-center">
            تسجيل الدخول إلى لوحة التحكم
          </h2>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pr-10 pl-3.5 py-2.5 text-sm transition-all focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="admin أو اسم المستخدم"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">كلمة المرور</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pr-10 pl-10 py-2.5 text-sm transition-all focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="كلمة المرور"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2 font-bold shadow-emerald-600/30"
            >
              دخول إلى النظام
            </Button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>حسابات تجريبية للاختبار السريع:</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'Admin@123456')}
                className="p-2 rounded-xl text-[11px] font-bold border border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 transition-all text-center shadow-sm"
              >
                مسؤول (Admin)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('employee', 'Emp@123456')}
                className="p-2 rounded-xl text-[11px] font-bold border border-sky-200 bg-sky-50/70 text-sky-800 hover:bg-sky-100 transition-all text-center shadow-sm"
              >
                موظف (Employee)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('viewer', 'View@123456')}
                className="p-2 rounded-xl text-[11px] font-bold border border-slate-200 bg-slate-100/70 text-slate-800 hover:bg-slate-200 transition-all text-center shadow-sm"
              >
                مشاهد (Viewer)
              </button>
            </div>

            {/* Demo Account - Full Trial Access */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500 text-white">
                    <Play className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900">تجربة النسخة التجريبية (Demo Mode)</p>
                    <p className="text-[11px] text-emerald-700">ادخل واستكشف النظام بجميع وظائفه</p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDemoLogin}
                  isLoading={isLoading}
                  icon={<Play className="w-3.5 h-3.5" />}
                  className="shadow-emerald-600/30"
                >
                  دخول النسخة التجريبية
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white/80 rounded-xl p-3 border border-emerald-100">
                  <p className="text-emerald-800 font-bold text-[11px] mb-1">اسم المستخدم</p>
                  <p className="font-mono text-emerald-900 text-sm">demo</p>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <p className="text-emerald-800 font-bold text-[11px] mb-1">كلمة المرور</p>
                    <p className="font-mono text-emerald-900 text-sm">Demo@12345</p>
                  </div>
                  <button
                    type="button"
                    onClick={copyDemoCredentials}
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    title="نسخ بيانات الدخول"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              ملاحظة: حساب المسؤول يطلب تغيير كلمة المرور عند أول تسجيل دخول.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
