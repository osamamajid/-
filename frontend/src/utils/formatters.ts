export const formatCurrency = (amount: number, currency: string = 'IQD'): string => {
  const normalizedCurrency = currency?.toUpperCase?.() || 'IQD';
  const labels: Record<string, string> = {
    IQD: 'دينار عراقي',
    USD: 'دولار أمريكي',
    USDOLLAR: 'دولار أمريكي',
  };

  const label = labels[normalizedCurrency] || currency || 'دينار عراقي';
  if (isNaN(amount)) return `0 ${label}`;
  return `${new Intl.NumberFormat('ar-IQ').format(amount)} ${label}`;
};

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
};

export const formatDateShort = (dateString?: string | null): string => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
};

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return { label: 'فعال', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'DRAFT':
      return { label: 'مسودة', className: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'EXPIRED':
      return { label: 'منتهي', className: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'CANCELLED':
      return { label: 'ملغي', className: 'bg-slate-100 text-slate-700 border-slate-300' };
    default:
      return { label: status, className: 'bg-slate-50 text-slate-600 border-slate-200' };
  }
};

export const getPaymentMethodLabel = (method: string): string => {
  switch (method) {
    case 'CASH':
      return 'نقداً';
    case 'BANK_TRANSFER':
      return 'تحويل بنكي';
    case 'CHEQUE':
      return 'شيك مصدق';
    case 'INSTALLMENT':
      return 'أقساط دورية';
    default:
      return method;
  }
};
