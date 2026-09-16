import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FileCheck2, Lock, User as UserIcon, Eye, EyeOff, ShieldCheck, Sparkles, Play, Info } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginDemo } = useAuth();
  const { success } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
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

  const handleDemoLogin = async () => {
    setErrorMsg('');
    setIsDemoLoading(true);
    try {
      const user = await loginDemo();
      success(`مرحباً بك في النسخة التجريبية، ${user.fullName}`);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'فشل تسجيل الدخول التجريبي، يرجى المحاولة لاحقاً');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-right font-cairo">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Brand Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-xl shadow-emerald-900/50 mb-4 border border-emerald-400/30">
          <FileCheck2 className="w-9 h-9" />
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight">
          منصة <span className="text-emerald-400">عَقيد</span>
        </h1>
        <p className="mt-2 text-sm text-slate-300 font-medium">
          عَقيد — منصة إدارة العقود الإلكترونية
        </p>

        {/* Demo Notice Badge */}
        <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>هذه نسخة تجريبية من منصة عَقيد</span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-modal rounded-3xl sm:px-10 border border-slate-100">
          
          {/* Quick Demo Access Card */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100/70 border border-emerald-200">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
                  <Play className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-emerald-950">استكشاف النسخة التجريبية (Demo)</h3>
                  <p className="text-[11px] text-emerald-700">دخول فوري بحساب العرض التجريبي للاطلاع الكامل</p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleDemoLogin}
              isLoading={isDemoLoading}
              icon={<Play className="w-4 h-4" />}
              className="w-full font-bold shadow-emerald-600/25 justify-center"
            >
              دخول النسخة التجريبية مباشرة
            </Button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-semibold">أو تسجيل الدخول لحساب مسجل</span>
            </div>
          </div>

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
                  placeholder="اسم المستخدم"
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
                  placeholder="••••••••"
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
              variant="outline"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2 font-bold justify-center"
            >
              تسجيل الدخول
            </Button>
          </form>

          {/* Help notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>يمكنك استخدام الحساب التجريبي لاستكشاف كافة وظائف المنصة بأمان.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
