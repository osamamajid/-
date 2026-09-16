import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../config/api';
import { ContractType, Contract } from '../../types/contract.types';
import { Customer } from '../../types/customer.types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { DynamicFieldsForm } from '../../components/contracts/DynamicFieldsForm';
import { ContractPreviewModal } from '../../components/contracts/ContractPreviewModal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { validateFieldValue } from '../../utils/contractFieldValidation';
import {
  FilePlus,
  ArrowRight,
  UserPlus,
  Calendar,
  DollarSign,
  CreditCard,
  Eye,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const CreateContractPage: React.FC<{ mode?: 'create' | 'edit' }> = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { success, error } = useToast();

  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedType, setSelectedType] = useState<ContractType | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [customerId, setCustomerId] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<string>('ACTIVE');
  const [totalAmount, setTotalAmount] = useState<number>(2500000);
  const [paymentMethod, setPaymentMethod] = useState<string>('BANK_TRANSFER');
  const [notes, setNotes] = useState<string>('');
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Created Contract & Preview Modal
  const [createdContract, setCreatedContract] = useState<Contract | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadInitData = async () => {
      setIsLoadingInitial(true);
      try {
        const [typesRes, custRes, settingsRes] = await Promise.all([
          api.get('/contract-types'),
          api.get('/customers?limit=100'),
          api.get('/settings'),
        ]);

        if (typesRes.data.success) {
          setContractTypes(typesRes.data.data);
          if (!typesRes.data.data.length) {
            setSelectedType(null);
          }
        }
        if (custRes.data.success) {
          setCustomers(custRes.data.data);
        }
        if (settingsRes.data.success) {
          setSettings(settingsRes.data.data.settingsMap);
        }

        if (mode === 'edit' && id) {
          const contractRes = await api.get(`/contracts/${id}`);
          if (contractRes.data.success) {
            const contract = contractRes.data.data;
            if (contract.status !== 'DRAFT') {
              error('لا يمكن تعديل العقد إلا إذا كان في حالة المسودة');
              navigate('/contracts');
              return;
            }

            const resolvedType =
              typesRes.data.data.find((type: ContractType) => type.id === contract.contractTypeId) ||
              contract.contractType ||
              null;

            setSelectedType(resolvedType);
            setCustomerId(contract.customerId || '');
            setIssueDate(contract.issueDate ? new Date(contract.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
            setStartDate(contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
            setEndDate(contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '');
            setStatus(contract.status || 'DRAFT');
            setTotalAmount(Number(contract.totalAmount) || 0);
            setPaymentMethod(contract.paymentMethod || 'BANK_TRANSFER');
            setNotes(contract.notes || '');
            const loadedValues = Object.fromEntries(
              (resolvedType?.fields || []).map((field: NonNullable<ContractType['fields']>[number]) => {
                const rawValue = contract.valuesMap?.[field.fieldKey] ?? '';
                if (field.fieldType === 'NUMBER') {
                  return [field.fieldKey, rawValue === '' ? '' : Number(rawValue)];
                }
                if (field.fieldType === 'CHECKBOX') {
                  return [field.fieldKey, rawValue === true || rawValue === 'true'];
                }
                return [field.fieldKey, rawValue];
              })
            );
            setDynamicValues(loadedValues);
            setCreatedContract(contract);
            return;
          }
        }

        if (typesRes.data.data.length > 0) {
          setSelectedType(typesRes.data.data[0]);
        }
        if (custRes.data.data.length > 0) {
          setCustomerId(custRes.data.data[0].id);
        }
      } catch {
        error('فشل تحميل البيانات الأساسية لإنشاء العقد');
      } finally {
        setIsLoadingInitial(false);
      }
    };

    loadInitData();
  }, [error, id, mode, navigate]);

  const handleTypeChange = (typeId: string) => {
    const t = contractTypes.find((x) => x.id === typeId) || null;
    setSelectedType(t);
    setDynamicValues({});
    setFieldErrors({});
  };

  const handleDynamicChange = (key: string, val: any) => {
    setDynamicValues((prev) => ({ ...prev, [key]: val }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const validateDynamicFields = () => {
    const errors: Record<string, string> = {};
    if (!selectedType?.fields) return true;

    for (const field of selectedType.fields) {
      const fieldError = validateFieldValue(field, dynamicValues[field.fieldKey]);
      if (fieldError) {
        errors[field.fieldKey] = fieldError;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType) {
      error('يرجى اختيار نوع العقد');
      return;
    }
    if (!customerId) {
      error('يرجى اختيار العميل');
      return;
    }

    if (!validateDynamicFields()) {
      error('يرجى ملء جميع الحقول الإلزامية في نموذج العقد');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        contractTypeId: selectedType.id,
        customerId,
        issueDate,
        startDate,
        endDate: endDate || null,
        status,
        totalAmount: Number(totalAmount),
        paymentMethod,
        notes,
        values: dynamicValues,
      };

      let res;
      if (mode === 'edit' && id) {
        res = await api.put(`/contracts/${id}`, payload);
        if (res.data.success) {
          success(`تم تعديل العقد بنجاح برقم: ${res.data.data.contractNumber}`);
          navigate(`/contracts/${id}`);
        }
      } else {
        res = await api.post('/contracts', payload);
        if (res.data.success) {
          success(`تم إنشاء العقد بنجاح برقم: ${res.data.data.contractNumber}`);
          setCreatedContract(res.data.data);
          setIsPreviewOpen(true);
        }
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'حدث خطأ أثناء حفظ العقد');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingInitial) {
    return <LoadingSpinner message="جاري إعداد معالج إنشاء العقود..." size="lg" />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/contracts')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold mb-2 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لقائمة العقود</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FilePlus className="w-7 h-7 text-emerald-600" />
            <span>{mode === 'edit' ? 'تعديل العقد' : 'إنشاء عقد رسمي جديد'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === 'edit'
              ? 'تعديل بيانات العقد فقط عندما يكون في حالة المسودة.'
              : 'توليد رقم عقد تسلسلي آلياً، تخصيص الحقول، ومعاينة وطباعة الوثيقة فورياً'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Contract Type & Customer Selection */}
        <Card
          title="الخطوة 1: تحديد نوع العقد والطرف الثاني (العميل)"
          subtitle="اختر نوع العقد لتحميل النموذج والحقول المخصصة له"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contract Type */}
            <Select
              label="نوع العقد"
              required
              options={contractTypes.map((t) => ({ value: t.id, label: t.name }))}
              value={selectedType?.id || ''}
              onChange={(e) => handleTypeChange(e.target.value)}
            />

            {/* Customer Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  العميل (الطرف الثاني) <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/customers')}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>إضافة عميل جديد</span>
                </button>
              </div>
              <select
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.customerNumber}) - {c.phone}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Step 2: Main Contract Dates, Amount & Status */}
        <Card
          title="الخطوة 2: فترات السريان والبيانات المالية"
          subtitle="تحديد تاريخ البداية والنهاية والمبلغ وطريقة الدفع"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="تاريخ تحرير العقد"
              type="date"
              required
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />

            <Input
              label="تاريخ بداية السريان"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              label="تاريخ انتهاء السريان"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              helperText="اتركه فارغاً إذا كان العقد غير محدد المدة"
            />

            <Input
              label="إجمالي قيمة العقد (دينار عراقي / دولار أمريكي)"
              type="number"
              min={0}
              max={1000000000000}
              step="0.01"
              placeholder="2500000"
              value={totalAmount}
              onChange={(e) => {
                const value = e.target.value;
                const parsed = Number(value);
                setTotalAmount(value === '' || !Number.isFinite(parsed) ? 0 : Math.min(1000000000000, Math.max(0, parsed)));
              }}
            />

            <Select
              label="طريقة الدفع"
              options={[
                { value: 'CASH', label: 'نقداً' },
                { value: 'BANK_TRANSFER', label: 'تحويل بنكي' },
                { value: 'CHEQUE', label: 'شيك مصدق' },
                { value: 'INSTALLMENT', label: 'أقساط دورية' },
              ]}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />

            <Select
              label="حالة العقد الأولية"
              options={[
                { value: 'ACTIVE', label: 'فعال ومعتمد مباشرة' },
                { value: 'DRAFT', label: 'حفظ كمسودة للمراجعة' },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <Textarea
              label="ملاحظات وتفاصيل إضافية (تظهر داخل العقد)"
              placeholder="أي اشتراطات خاصة يتفق عليها الطرفان..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </Card>

        {/* Step 3: Dynamic Fields Form according to the Template */}
        {selectedType && (
          <Card
            title={`الخطوة 3: حقول وبيانات ${selectedType.name}`}
            subtitle="املأ البيانات الخاصة بموضوع هذا العقد وفق النموذج المعتمد"
            className="mb-6"
          >
            <div data-tour="dynamic-fields">
              <DynamicFieldsForm
                fields={selectedType.fields || []}
                values={dynamicValues}
                onChange={handleDynamicChange}
                errors={fieldErrors}
              />
            </div>
          </Card>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-soft sticky bottom-4 z-20">
          <div className="text-xs text-slate-500 font-medium">
            سيتم إنشاء رقم العقد تلقائياً بالتسلسل <span className="font-mono font-bold text-slate-800">(مثل: CTR-{new Date().getFullYear()}-XXXXXX)</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/contracts')}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              icon={<Save className="w-4 h-4" />}
              className="font-bold shadow-emerald-600/30"
            >
              {mode === 'edit' ? 'حفظ التعديلات' : 'حفظ العقد ومعاينة الوثيقة الرسمية'}
            </Button>
          </div>
        </div>
      </form>

      {/* Contract Preview Modal upon successful creation */}
      <ContractPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          navigate('/contracts');
        }}
        contract={createdContract}
        settings={settings}
      />
    </div>
  );
};
