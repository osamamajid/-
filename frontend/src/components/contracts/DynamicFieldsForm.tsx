import React from 'react';
import { ContractField } from '../../types/contract.types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { normalizeFieldValue } from '../../utils/contractFieldValidation';

interface DynamicFieldsFormProps {
  fields: ContractField[];
  values: Record<string, any>;
  onChange: (fieldKey: string, value: any) => void;
  errors?: Record<string, string>;
}

export const DynamicFieldsForm: React.FC<DynamicFieldsFormProps> = ({
  fields,
  values,
  onChange,
  errors = {},
}) => {
  if (!fields || fields.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        لا توجد حقول إضافية مخصصة لهذا النموذج.
      </div>
    );
  }

  // فرز الحقول حسب الترتيب المحدد
  const sortedFields = [...fields].sort((a, b) => a.orderIndex - b.orderIndex);

  // تصنيف الحقول حسب الأقسام
  const sections: { key: string; title: string; fields: ContractField[] }[] = [
    { key: 'parties', title: 'بيانات أطراف العقد', fields: sortedFields.filter((f) => f.section === 'parties') },
    { key: 'details', title: 'مواصفات وتفاصيل العقد', fields: sortedFields.filter((f) => f.section === 'details') },
    { key: 'financial', title: 'البيانات المالية', fields: sortedFields.filter((f) => f.section === 'financial') },
    { key: 'terms', title: 'الشروط والأحكام الخاصة', fields: sortedFields.filter((f) => f.section === 'terms') },
  ];

  const renderField = (field: ContractField) => {
    const val = values[field.fieldKey] !== undefined ? values[field.fieldKey] : '';
    const err = errors[field.fieldKey];

    switch (field.fieldType) {
      case 'TEXT':
        return (
          <Input
            key={field.id}
            label={field.label}
            placeholder={field.placeholder || `أدخل ${field.label}`}
            value={val}
            required={field.isRequired}
            error={err}
            onChange={(e) => onChange(field.fieldKey, normalizeFieldValue(field, e.target.value))}
          />
        );

      case 'NUMBER':
        return (
          <Input
            key={field.id}
            type="number"
            label={field.label}
            placeholder={field.placeholder || '0'}
            value={val}
            required={field.isRequired}
            error={err}
            onChange={(e) => onChange(field.fieldKey, normalizeFieldValue(field, e.target.value))}
          />
        );

      case 'DATE':
        return (
          <Input
            key={field.id}
            type="date"
            label={field.label}
            value={val}
            required={field.isRequired}
            error={err}
            onChange={(e) => onChange(field.fieldKey, e.target.value)}
          />
        );

      case 'SELECT':
        const selectOptions = [
          { value: '', label: `-- اختر ${field.label} --` },
          ...(field.options || []).map((opt) => ({ value: opt, label: opt })),
        ];
        return (
          <Select
            key={field.id}
            label={field.label}
            options={selectOptions}
            value={val}
            required={field.isRequired}
            error={err}
            onChange={(e) => onChange(field.fieldKey, e.target.value)}
          />
        );

      case 'TEXTAREA':
        return (
          <div key={field.id} className="sm:col-span-2">
            <Textarea
              label={field.label}
              placeholder={field.placeholder || `أدخل ${field.label}...`}
              value={val}
              required={field.isRequired}
              error={err}
              onChange={(e) => onChange(field.fieldKey, e.target.value)}
            />
          </div>
        );

      case 'CHECKBOX':
        return (
          <div key={field.id} className="flex items-center gap-3 pt-6 sm:col-span-2">
            <input
              type="checkbox"
              id={field.id}
              checked={!!val}
              onChange={(e) => onChange(field.fieldKey, e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <label htmlFor={field.id} className="text-xs font-bold text-slate-800 cursor-pointer">
              {field.label} {field.isRequired && <span className="text-rose-500">*</span>}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {sections
        .filter((sec) => sec.fields.length > 0)
        .map((section) => (
          <div key={section.key} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <h4 className="text-xs font-bold text-emerald-800 mb-4 pb-2 border-b border-slate-200/80 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{section.title}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {section.fields.map(renderField)}
            </div>
          </div>
        ))}
    </div>
  );
};
