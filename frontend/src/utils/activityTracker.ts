import api from '../config/api';

const SENSITIVE_KEYS = new Set([
  'password',
  'pass',
  'token',
  'secret',
  'authorization',
  'apiKey',
  'key',
]);

interface ActivityEvent {
  type: 'PAGE_VIEW' | 'CLICK' | 'INPUT';
  action: string;
  label?: string;
  page: string;
  target?: string;
  fieldName?: string;
  valuePreview?: string;
}

const sanitizeLabel = (value?: string | null) => {
  if (!value) return undefined;
  return value.replace(/\s+/g, ' ').trim().slice(0, 80);
};

const sanitizeValue = (value: string | undefined, fieldName?: string) => {
  if (!value) return undefined;
  if (fieldName && SENSITIVE_KEYS.has(fieldName.toLowerCase())) {
    return '[REDACTED]';
  }
  return value.replace(/\s+/g, ' ').trim().slice(0, 80);
};

const sendActivity = async (event: ActivityEvent) => {
  const token = localStorage.getItem('aqeed_token');
  if (!token) return;

  try {
    await api.post('/activity/track', event);
  } catch {
    // لا نريد إيقاف التطبيق إذا فشل التسجيل
  }
};

const getElementContext = (element: HTMLElement | null) => {
  if (!element) return {};

  const actionSource =
    element.dataset.trackLabel ||
    element.getAttribute('data-track-label') ||
    element.getAttribute('aria-label') ||
    element.getAttribute('name') ||
    element.getAttribute('id') ||
    (element.tagName === 'BUTTON' ? element.textContent : undefined) ||
    undefined;

  return {
    label: sanitizeLabel(actionSource),
    target: element.tagName,
  };
};

export const initActivityTracking = () => {
  const globalKey = '__aqeed_activity_tracking__';
  if ((window as any)[globalKey]) return;
  (window as any)[globalKey] = true;

  const recordPageView = () => {
    sendActivity({
      type: 'PAGE_VIEW',
      action: 'PAGE_VIEW',
      page: window.location.pathname,
      label: document.title || 'page',
    });
  };

  recordPageView();

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const node = target?.closest('button, a, input, select, textarea, [data-track-label]') as HTMLElement | null;
    if (!node) return;

    const { label, target: tagName } = getElementContext(node);
    if (!label) return;

    sendActivity({
      type: 'CLICK',
      action: 'CLICK',
      label,
      page: window.location.pathname,
      target: tagName,
    });
  });

  document.addEventListener('change', (event) => {
    const target = event.target as HTMLElement | null;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) {
      return;
    }

    const fieldName = target.name || target.id || target.getAttribute('data-track-label') || 'input';
    const valuePreview = sanitizeValue(target.value, fieldName);

    if (fieldName && valuePreview) {
      sendActivity({
        type: 'INPUT',
        action: 'FORM_INPUT',
        label: fieldName,
        page: window.location.pathname,
        fieldName,
        valuePreview,
      });
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      recordPageView();
    }
  });
};
