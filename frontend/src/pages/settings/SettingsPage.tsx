import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { Settings, Building2, FileText, Bell, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { success, error } = useToast();

  const [settings, setSettings] = useState<Record<string, string>>({
    company_name: '',
    company_commercial_reg: '',
    company_tax_number: '',
    company_phone: '',
    company_email: '',
    company_address: '',
    contract_prefix: 'CTR',
    default_currency: 'IQD',
    expiry_alert_days: '30,15,7',
    contract_footer_text: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.data.settingsMap) {
          setSettings((prev) => ({ ...prev, ...res.data.data.settingsMap }));
        }
      } catch {
        error('فشل جلب إعدادات النظام');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [error]);

  const handleChange = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.put('/settings', settings);
      if (res.data.success) {
        success('تم حفظ وتحديث إعدادات النظام بنجاح');
      }
    } catch {
      error('فشل حفظ التعديلات');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="جاري جلب إعدادات النظام..." size="lg" />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-emerald-600" />
          <span>إعدادات النظام والمنشأة</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          تخصيص هوية المنشأة، بيانات الرأس والتذييل للطباعة الرسمية، وقواعد التنبيهات
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Identity */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span>بيانات المنشأة (تظهر في رأس العقود الرسمية)</span>
            </div>
          }
          subtitle="الاسم والبيانات التجارية ورقم الاتصال المستخدمة في ترويسة العقود المطبوعة"
        >
          <div className="space-y-4">
            <Input
              label="اسم المنشأة / المكتب الرسمي"
              required
              value={settings.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="رقم السجل التجاري (CR)"
                value={settings.company_commercial_reg}
                onChange={(e) => handleChange('company_commercial_reg', e.target.value)}
              />
              <Input
                label="الرقم الضريبي"
                value={settings.company_tax_number}
                onChange={(e) => handleChange('company_tax_number', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="رقم الهاتف والتواصل"
                value={settings.company_phone}
                onChange={(e) => handleChange('company_phone', e.target.value)}
              />
              <Input
                label="البريد الإلكتروني الرسمي"
                type="email"
                value={settings.company_email}
                onChange={(e) => handleChange('company_email', e.target.value)}
              />
            </div>

            <Input
              label="العنوان والمقر الرئيسي"
              value={settings.company_address}
              onChange={(e) => handleChange('company_address', e.target.value)}
            />
          </div>
        </Card>

        {/* Contract Generation Rules */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>إعدادات العقود والطباعة</span>
            </div>
          }
          subtitle="تخصيص بادئة الأرقام التسلسلية والنص القانوني للتذييل"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="بادئة أرقام العقود (Prefix)"
                placeholder="CTR"
                value={settings.contract_prefix}
                onChange={(e) => handleChange('contract_prefix', e.target.value)}
                helperText="تظهر كبادئة لرقم العقد (مثال: CTR-2026-000001)"
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  العملة الافتراضية
                </label>
                <select
                  value={settings.default_currency}
                  onChange={(e) => handleChange('default_currency', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                >
                  <option value="IQD">دينار عراقي</option>
                  <option value="USD">دولار أمريكي</option>
                </select>
              </div>
            </div>

            <Textarea
              label="نص التذييل الرسمي المطبوع أسفل كل عقد (Footer Text)"
              rows={3}
              value={settings.contract_footer_text}
              onChange={(e) => handleChange('contract_footer_text', e.target.value)}
              helperText="نص الإخلاء القانوني ورابط التحقق المطبوع أسفل كل صفحة"
            />
          </div>
        </Card>

        {/* Alerts Settings */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600" />
              <span>تنبيهات انتهاء العقود</span>
            </div>
          }
          subtitle="تحديد الفترات الزمنية لتنبيه الموظفين باقتراب انتهاء سريان العقود"
        >
          <Input
            label="فترات التنبيه بالأيام (مفصولة بفاصلة)"
            value={settings.expiry_alert_days}
            onChange={(e) => handleChange('expiry_alert_days', e.target.value)}
            helperText="الافتراضي: 30,15,7 (لإظهار التنبيهات قبل شهر، 15 يوماً، وأسبوع من الانتهاء)"
          />
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            icon={<Save className="w-5 h-5" />}
            className="shadow-emerald-600/30 font-bold"
          >
            حفظ كافة التعديلات
          </Button>
        </div>
      </form>
    </div>
  );
};
