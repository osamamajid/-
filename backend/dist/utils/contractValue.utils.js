"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAndNormalizeContractValues = void 0;
const NAME_KEY_PATTERN = /(^|_)(name|full_name|first_name|last_name|buyer_name|seller_name|employee_name|employer_name|lessor_name|lessee_name|service_provider|service_recipient)(_|$)/i;
const NAME_LABEL_PATTERN = /اسم|المشتري|البائع|الموظف|المؤجر|المستأجر|مقدم الخدمة|متلقي الخدمة/;
const NAME_PATTERN = /^[A-Za-z\u0600-\u06FF\u0750-\u077F\s.'-]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const isNameField = (field) => NAME_KEY_PATTERN.test(field.fieldKey) || NAME_LABEL_PATTERN.test(field.label);
const isEmpty = (value) => value === undefined || value === null || value === '';
const validateAndNormalizeContractValues = (values, fields) => {
    if (values === undefined || values === null)
        return {};
    if (typeof values !== 'object' || Array.isArray(values)) {
        throw new Error('قيم حقول العقد يجب أن تكون بيانات منظمة');
    }
    const input = values;
    const fieldMap = new Map(fields.map((field) => [field.fieldKey, field]));
    const unknownKey = Object.keys(input).find((key) => !fieldMap.has(key));
    if (unknownKey) {
        throw new Error(`حقل غير معروف في نموذج العقد: ${unknownKey}`);
    }
    const normalized = {};
    for (const field of fields) {
        const value = input[field.fieldKey];
        if (isEmpty(value)) {
            if (field.isRequired)
                throw new Error(`حقل "${field.label}" مطلوب`);
            continue;
        }
        switch (field.fieldType) {
            case 'TEXT':
            case 'TEXTAREA': {
                if (typeof value !== 'string')
                    throw new Error(`حقل "${field.label}" يجب أن يكون نصًا`);
                const text = value.trim();
                if (!text || text.length > 5000 || /[<>]/.test(text)) {
                    throw new Error(`قيمة حقل "${field.label}" غير صحيحة`);
                }
                if (isNameField(field) && !NAME_PATTERN.test(text)) {
                    throw new Error(`حقل "${field.label}" يجب أن يحتوي على اسم صحيح فقط`);
                }
                normalized[field.fieldKey] = text;
                break;
            }
            case 'NUMBER': {
                const numberValue = typeof value === 'number' ? value : (typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN);
                if (!Number.isFinite(numberValue) || numberValue < 0 || numberValue > 1_000_000_000_000) {
                    throw new Error(`حقل "${field.label}" يجب أن يكون مبلغًا أو رقمًا موجبًا صحيحًا`);
                }
                normalized[field.fieldKey] = String(numberValue);
                break;
            }
            case 'DATE':
                if (typeof value !== 'string' || !DATE_PATTERN.test(value) || Number.isNaN(Date.parse(value))) {
                    throw new Error(`تاريخ حقل "${field.label}" غير صحيح`);
                }
                normalized[field.fieldKey] = value;
                break;
            case 'SELECT': {
                if (typeof value !== 'string')
                    throw new Error(`يجب اختيار قيمة صحيحة لحقل "${field.label}"`);
                const options = field.options ? JSON.parse(field.options) : [];
                if (!Array.isArray(options) || !options.includes(value)) {
                    throw new Error(`قيمة حقل "${field.label}" غير موجودة ضمن الخيارات`);
                }
                normalized[field.fieldKey] = value;
                break;
            }
            case 'CHECKBOX':
                if (typeof value !== 'boolean')
                    throw new Error(`حقل "${field.label}" يجب أن يكون نعم أو لا`);
                normalized[field.fieldKey] = String(value);
                break;
            default:
                throw new Error(`نوع الحقل "${field.fieldType}" غير مدعوم`);
        }
    }
    return normalized;
};
exports.validateAndNormalizeContractValues = validateAndNormalizeContractValues;
