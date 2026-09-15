import { ContractField } from '../types/contract.types';

const NAME_PATTERN = /^[A-Za-z\u0600-\u06FF\u0750-\u077F\s.'-]+$/;
const NAME_PATTERN_HINT = /name|اسم|مشتري|بائع|موظف|مؤجر|مستأجر|مقدم|متلقي/i;

export const isNameField = (field: ContractField) =>
  NAME_PATTERN_HINT.test(`${field.fieldKey} ${field.label}`);

export const normalizeFieldValue = (field: ContractField, value: string | boolean) => {
  if (field.fieldType === 'NUMBER') {
    if (value === '') return '';
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : '';
  }
  return value;
};

export const validateFieldValue = (field: ContractField, value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return field.isRequired ? `حقل "${field.label}" مطلوب` : undefined;
  }

  if (field.fieldType === 'NUMBER') {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      return `حقل "${field.label}" يجب أن يكون رقمًا موجبًا`;
    }
  }

  if ((field.fieldType === 'TEXT' || field.fieldType === 'TEXTAREA') && typeof value !== 'string') {
    return `حقل "${field.label}" يجب أن يكون نصًا`;
  }

  if (isNameField(field) && typeof value === 'string' && !NAME_PATTERN.test(value.trim())) {
    return `حقل "${field.label}" يجب أن يحتوي على اسم صحيح فقط`;
  }

  if (field.fieldType === 'SELECT' && typeof value === 'string' && !field.options?.includes(value)) {
    return `اختر قيمة صحيحة لحقل "${field.label}"`;
  }

  if (field.fieldType === 'CHECKBOX' && typeof value !== 'boolean') {
    return `حقل "${field.label}" يجب أن يكون نعم أو لا`;
  }

  return undefined;
};
