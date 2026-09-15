const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]/g;

const normalizeText = (value: string, options?: { max?: number; min?: number; allowHtml?: boolean }) => {
  const { max = 2000, min = 0, allowHtml = false } = options || {};
  let cleaned = value.trim().replace(CONTROL_CHARS_REGEX, '');

  if (!allowHtml) {
    cleaned = cleaned.replace(/[<>]/g, '');
  }

  if (cleaned.length < min) {
    throw new Error(`قيمة النص قصيرة جداً؛ الحد الأدنى ${min} حرف`);
  }

  if (cleaned.length > max) {
    throw new Error(`قيمة النص طويلة جداً؛ الحد الأقصى ${max} حرف`);
  }

  return cleaned;
};

export const sanitizeText = (value: unknown, options?: { max?: number; min?: number; allowHtml?: boolean }) => {
  if (value === undefined || value === null || value === '') {
    return value;
  }

  if (typeof value !== 'string') {
    throw new Error('هذا الحقل يجب أن يكون نصاً');
  }

  return normalizeText(value, options);
};

export const sanitizeNumber = (
  value: unknown,
  options?: { min?: number; max?: number; integer?: boolean; allowNegative?: boolean }
) => {
  const { min = 0, max = Number.MAX_SAFE_INTEGER, integer = false, allowNegative = false } = options || {};

  if (value === undefined || value === null || value === '') {
    return value;
  }

  let numericValue: number;

  if (typeof value === 'number') {
    numericValue = value;
  } else if (typeof value === 'string') {
    const cleaned = value.trim().replace(/,/g, '');
    if (!/^[-+]?\d+(\.\d+)?$/.test(cleaned)) {
      throw new Error('هذا الحقل يجب أن يكون رقماً صحيحاً');
    }
    numericValue = Number(cleaned);
  } else {
    throw new Error('هذا الحقل يجب أن يكون رقماً صحيحاً');
  }

  if (!Number.isFinite(numericValue)) {
    throw new Error('القيمة الرقمية غير صالحة');
  }

  if (!allowNegative && numericValue < 0) {
    throw new Error('القيمة لا يمكن أن تكون سلبية');
  }

  if (integer && !Number.isInteger(numericValue)) {
    throw new Error('يجب أن تكون القيمة عدد صحيح');
  }

  if (numericValue < min || numericValue > max) {
    throw new Error(`القيمة خارج النطاق المسموح (${min} - ${max})`);
  }

  return numericValue;
};

export const sanitizeObject = (input: unknown): unknown => {
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObject(item));
  }

  if (input && typeof input === 'object') {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }

      sanitized[key] = sanitizeObject(value);
    }

    return sanitized;
  }

  if (typeof input === 'string') {
    return normalizeText(input, { max: 2000, min: 0, allowHtml: false });
  }

  return input;
};
