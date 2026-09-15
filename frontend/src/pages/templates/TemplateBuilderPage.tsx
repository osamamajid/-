import React, { useState, useEffect, useCallback } from 'react';
import api from '../../config/api';
import { ContractType, ContractField } from '../../types/contract.types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Sliders,
  CheckCircle2,
  FileCode,
  Tag,
  AlignRight,
  ArrowDownUp,
} from 'lucide-react';

export const TemplateBuilderPage: React.FC = () => {
  const { success, error } = useToast();

  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [selectedType, setSelectedType] = useState<ContractType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Contract Type Modal
  const [isNewTypeModalOpen, setIsNewTypeModalOpen] = useState(false);
  const [typeForm, setTypeForm] = useState({
    name: '',
    code: '',
    description: '',
    icon: 'FileText',
    termsAndConditions: '',
  });
  const [isSubmittingType, setIsSubmittingType] = useState(false);

  // Add / Edit Field Modal
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<ContractField | null>(null);
  const [fieldForm, setFieldForm] = useState({
    fieldKey: '',
    label: '',
    fieldType: 'TEXT',
    isRequired: false,
    optionsStr: '',
    section: 'details',
    orderIndex: 0,
    placeholder: '',
  });
  const [isSubmittingField, setIsSubmittingField] = useState(false);

  // Delete Field Dialog
  const [deleteFieldId, setDeleteFieldId] = useState<string | null>(null);
  const [isDeletingField, setIsDeletingField] = useState(false);

  const fetchTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/contract-types');
      if (res.data.success) {
        setContractTypes(res.data.data);
        if (res.data.data.length > 0) {
          // حافظ على النوع المحدد أو اختر الأول
          const currentId = selectedType?.id;
          const current = res.data.data.find((t: ContractType) => t.id === currentId) || res.data.data[0];
          setSelectedType(current);
        }
      }
    } catch {
      error('فشل جلب أنواع العقود');
    } finally {
      setIsLoading(false);
    }
  }, [error, selectedType?.id]);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const handleSelectType = (type: ContractType) => {
    setSelectedType(type);
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingType(true);
    try {
      const res = await api.post('/contract-types', typeForm);
      if (res.data.success) {
        success('تم إنشاء نوع العقد بنجاح');
        setIsNewTypeModalOpen(false);
        setTypeForm({ name: '', code: '', description: '', icon: 'FileText', termsAndConditions: '' });
        fetchTypes();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'فشل إنشاء نوع العقد');
    } finally {
      setIsSubmittingType(false);
    }
  };

  const handleOpenAddField = () => {
    setEditingField(null);
    const maxOrder = (selectedType?.fields || []).reduce((max, f) => Math.max(max, f.orderIndex), 0);
    setFieldForm({
      fieldKey: '',
      label: '',
      fieldType: 'TEXT',
      isRequired: false,
      optionsStr: '',
      section: 'details',
      orderIndex: maxOrder + 1,
      placeholder: '',
    });
    setIsFieldModalOpen(true);
  };

  const handleOpenEditField = (f: ContractField) => {
    setEditingField(f);
    setFieldForm({
      fieldKey: f.fieldKey,
      label: f.label,
      fieldType: f.fieldType,
      isRequired: f.isRequired,
      optionsStr: (f.options || []).join('\n'),
      section: f.section,
      orderIndex: f.orderIndex,
      placeholder: f.placeholder || '',
    });
    setIsFieldModalOpen(true);
  };

  const handleFieldSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType?.templateId) {
      error('لا يوجد نموذج افتراضي لهذا النوع');
      return;
    }

    setIsSubmittingField(true);
    try {
      const payload: any = {
        label: fieldForm.label,
        fieldType: fieldForm.fieldType,
        isRequired: fieldForm.isRequired,
        section: fieldForm.section,
        orderIndex: Number(fieldForm.orderIndex),
        placeholder: fieldForm.placeholder || null,
      };

      if (fieldForm.fieldType === 'SELECT') {
        payload.options = fieldForm.optionsStr
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (editingField) {
        await api.put(`/templates/fields/${editingField.id}`, payload);
        success('تم تعديل الحقل بنجاح');
      } else {
        payload.fieldKey = fieldForm.fieldKey.trim().toLowerCase().replace(/\s+/g, '_');
        await api.post(`/templates/${selectedType.templateId}/fields`, payload);
        success('تمت إضافة الحقل بنجاح');
      }

      setIsFieldModalOpen(false);
      fetchTypes();
    } catch (err: any) {
      error(err.response?.data?.message || 'فشل حفظ بيانات الحقل');
    } finally {
      setIsSubmittingField(false);
    }
  };

  const handleDeleteField = async () => {
    if (!deleteFieldId) return;
    setIsDeletingField(true);
    try {
      await api.delete(`/templates/fields/${deleteFieldId}`);
      success('تم حذف الحقل بنجاح');
      setDeleteFieldId(null);
      fetchTypes();
    } catch (err: any) {
      error(err.response?.data?.message || 'فشل حذف الحقل');
    } finally {
      setIsDeletingField(false);
    }
  };

  const getSectionTitle = (sec: string) => {
    switch (sec) {
      case 'parties':
        return 'الأطراف (الطرف الأول / الثاني)';
      case 'details':
        return 'تفاصيل ومواصفات العقد';
      case 'financial':
        return 'البيانات المالية وطريقة الدفع';
      case 'terms':
        return 'الشروط والأحكام الخاصة';
      default:
        return sec;
    }
  };

  const getFieldTypeBadge = (t: string) => {
    switch (t) {
      case 'TEXT':
        return <Badge variant="slate">نص قصير</Badge>;
      case 'NUMBER':
        return <Badge variant="info">رقم</Badge>;
      case 'DATE':
        return <Badge variant="warning">تاريخ</Badge>;
      case 'SELECT':
        return <Badge variant="primary">قائمة اختيار</Badge>;
      case 'TEXTAREA':
        return <Badge variant="slate">نص متعدد الأسطر</Badge>;
      case 'CHECKBOX':
        return <Badge variant="success">مربع اختيار</Badge>;
      default:
        return <Badge variant="slate">{t}</Badge>;
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="جاري تحميل قوالب ونماذج العقود..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            منشئ قوالب ونماذج العقود (Contract Template Builder)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إنشاء أنواع جديدة من العقود وبناء الحقول المخصصة وترتيبها ديناميكياً بدون تعديل في الكود
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsNewTypeModalOpen(true)}
          icon={<Plus className="w-5 h-5" />}
          className="shadow-emerald-600/20"
        >
          إنشاء نوع عقد جديد
        </Button>
      </div>

      {/* Main Grid: Types Selector & Fields Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Contract Types List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            أنواع العقود المتاحة ({contractTypes.length})
          </h3>

          <div className="space-y-2">
            {contractTypes.map((t) => {
              const isSelected = selectedType?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectType(t)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-700 shadow-md shadow-emerald-900/20'
                      : 'bg-white text-slate-800 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">{t.name}</span>
                    <span
                      className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                        isSelected ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.code}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] mt-1.5 line-clamp-2 ${
                      isSelected ? 'text-emerald-100' : 'text-slate-500'
                    }`}
                  >
                    {t.description || 'نموذج عقد معتمد'}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10 text-[10px]">
                    <span>{t.fieldsCount || 0} حقول مخصصة</span>
                    <span>{t.contractsCount || 0} عقود مصدرة</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Dynamic Fields for Selected Type */}
        <div className="lg:col-span-3 space-y-6">
          {selectedType ? (
            <Card
              title={
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-600" />
                  <span>حقول وقالب: {selectedType.name}</span>
                </div>
              }
              subtitle={`رمز النموذج: ${selectedType.code} • إجمالي الحقول المخصصة: ${selectedType.fields?.length || 0}`}
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAddField}
                  icon={<Plus className="w-4 h-4" />}
                >
                  إضافة حقل جديد للقالب
                </Button>
              }
            >
              {/* Fields Table */}
              {!selectedType.fields || selectedType.fields.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  لا توجد حقول مسجلة لهذا القالب بعد. اضغط على "إضافة حقل جديد" للبدء.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/60">
                        <th className="py-3 px-4 text-center">الترتيب</th>
                        <th className="py-3 px-4">عنوان الحقل (Label)</th>
                        <th className="py-3 px-4">المفتاح البرمجي</th>
                        <th className="py-3 px-4">نوع المدخل</th>
                        <th className="py-3 px-4">مكان الظهور</th>
                        <th className="py-3 px-4 text-center">إلزامي؟</th>
                        <th className="py-3 px-4 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedType.fields.map((field) => (
                        <tr key={field.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 text-center font-bold text-slate-500 font-mono">
                            {field.orderIndex}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">{field.label}</td>
                          <td className="py-3 px-4 font-mono text-emerald-800 text-[11px]">
                            {field.fieldKey}
                          </td>
                          <td className="py-3 px-4">{getFieldTypeBadge(field.fieldType)}</td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {getSectionTitle(field.section)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {field.isRequired ? (
                              <span className="text-rose-600 font-bold text-[11px]">نعم (مطلوب)</span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">اختياري</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEditField(field)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                title="تعديل الحقل"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteFieldId(field.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="حذف الحقل"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Default Terms & Conditions View / Edit */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  <span>الشروط والأحكام القياسية المعتمدة لهذا العقد:</span>
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {selectedType.termsAndConditions || 'لا توجد شروط افتراضية مسجلة.'}
                </div>
              </div>
            </Card>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">
              يرجى اختيار نوع عقد من القائمة الجانبية
            </div>
          )}
        </div>
      </div>

      {/* New Contract Type Modal */}
      <Modal
        isOpen={isNewTypeModalOpen}
        onClose={() => setIsNewTypeModalOpen(false)}
        title="إنشاء نوع عقد جديد"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateType} className="space-y-4">
          <Input
            label="اسم نوع العقد"
            required
            placeholder="مثال: عقد شراكة استثمارية، عقد وساطة عقارية"
            value={typeForm.name}
            onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="الرمز التعريفي (Code)"
              required
              placeholder="مثال: PARTNERSHIP أو BROKERAGE"
              value={typeForm.code}
              onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value.toUpperCase() })}
            />
            <Select
              label="الأيقونة الرمزية"
              options={[
                { value: 'FileText', label: 'وثيقة عامة (FileText)' },
                { value: 'Home', label: 'عقارات ومباني (Home)' },
                { value: 'Car', label: 'مركبات وسيارات (Car)' },
                { value: 'Briefcase', label: 'أعمال وخدمات (Briefcase)' },
                { value: 'ShoppingBag', label: 'بيع وتجارة (ShoppingBag)' },
                { value: 'UserCheck', label: 'توظيف وعمالة (UserCheck)' },
              ]}
              value={typeForm.icon}
              onChange={(e) => setTypeForm({ ...typeForm, icon: e.target.value })}
            />
          </div>

          <Input
            label="وصف مختصر للنوع"
            placeholder="وصف طبيعة استخدام هذا العقد..."
            value={typeForm.description}
            onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
          />

          <Textarea
            label="الشروط والأحكام الافتراضية"
            rows={5}
            placeholder="اكتب البنود والشروط النظامية التي تظهر تلقائياً في كل عقد يصدر من هذا النوع..."
            value={typeForm.termsAndConditions}
            onChange={(e) => setTypeForm({ ...typeForm, termsAndConditions: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewTypeModalOpen(false)}
              disabled={isSubmittingType}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingType}>
              إنشاء النوع وحفظ النموذج
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Field Modal */}
      <Modal
        isOpen={isFieldModalOpen}
        onClose={() => setIsFieldModalOpen(false)}
        title={editingField ? 'تعديل خصائص الحقل' : 'إضافة حقل جديد لقالب العقد'}
        maxWidth="md"
      >
        <form onSubmit={handleFieldSubmit} className="space-y-4">
          <Input
            label="عنوان وتسمية الحقل (Label)"
            required
            placeholder="مثال: رقم لوحة المركبة، عنوان العقار..."
            value={fieldForm.label}
            onChange={(e) => {
              const lbl = e.target.value;
              setFieldForm((prev) => ({
                ...prev,
                label: lbl,
                // اقتراح مفتاح الحقل تلقائياً إذا كان جديداً
                fieldKey: !editingField && !prev.fieldKey ? lbl.trim().toLowerCase().replace(/\s+/g, '_') : prev.fieldKey,
              }));
            }}
          />

          {!editingField && (
            <Input
              label="المفتاح البرمجي (Field Key)"
              required
              placeholder="plate_number أو property_address"
              value={fieldForm.fieldKey}
              onChange={(e) => setFieldForm({ ...fieldForm, fieldKey: e.target.value })}
              helperText="يستخدم كمعرف وحيد للبيانات (أحرف إنجليزية وشرطة سفلية)"
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="نوع الحقل"
              options={[
                { value: 'TEXT', label: 'نص قصير (Text)' },
                { value: 'NUMBER', label: 'رقم (Number)' },
                { value: 'DATE', label: 'تاريخ (Date)' },
                { value: 'SELECT', label: 'قائمة منسدلة (Select)' },
                { value: 'TEXTAREA', label: 'نص طويل (Textarea)' },
                { value: 'CHECKBOX', label: 'مربع اختيار (Checkbox)' },
              ]}
              value={fieldForm.fieldType}
              onChange={(e) => setFieldForm({ ...fieldForm, fieldType: e.target.value })}
            />

            <Select
              label="مكان الظهور في العقد"
              options={[
                { value: 'parties', label: 'الأطراف (parties)' },
                { value: 'details', label: 'تفاصيل وموضوع العقد (details)' },
                { value: 'financial', label: 'البيانات المالية (financial)' },
                { value: 'terms', label: 'الشروط والأحكام (terms)' },
              ]}
              value={fieldForm.section}
              onChange={(e) => setFieldForm({ ...fieldForm, section: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="الترتيب التسلسلي"
              type="number"
              value={fieldForm.orderIndex}
              onChange={(e) => setFieldForm({ ...fieldForm, orderIndex: Number(e.target.value) })}
            />
            <Input
              label="نص تلميحي (Placeholder)"
              placeholder="مثال: 05xxxxxxxx"
              value={fieldForm.placeholder}
              onChange={(e) => setFieldForm({ ...fieldForm, placeholder: e.target.value })}
            />
          </div>

          {fieldForm.fieldType === 'SELECT' && (
            <Textarea
              label="خيارات القائمة المنسدلة (خيار واحد في كل سطر)"
              rows={3}
              placeholder="خيار أول&#10;خيار ثانٍ&#10;خيار ثالث"
              value={fieldForm.optionsStr}
              onChange={(e) => setFieldForm({ ...fieldForm, optionsStr: e.target.value })}
            />
          )}

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isRequiredCheck"
              checked={fieldForm.isRequired}
              onChange={(e) => setFieldForm({ ...fieldForm, isRequired: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <label htmlFor="isRequiredCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
              هذا الحقل إلزامي ولا يمكن حفظ العقد بدونه
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFieldModalOpen(false)}
              disabled={isSubmittingField}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingField}>
              {editingField ? 'حفظ التعديلات' : 'إضافة الحقل للقالب'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Field Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteFieldId}
        onClose={() => setDeleteFieldId(null)}
        onConfirm={handleDeleteField}
        title="تأكيد حذف الحقل من القالب"
        message="هل أنت متأكد من حذف هذا الحقل من نموذج العقد؟ لن يظهر هذا الحقل في العقود الجديدة."
        confirmText="نعم، حذف الحقل"
        isLoading={isDeletingField}
      />
    </div>
  );
};
