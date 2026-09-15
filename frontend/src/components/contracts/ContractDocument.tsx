import React from 'react';
import { Contract } from '../../types/contract.types';
import { formatCurrency, formatDate, getPaymentMethodLabel } from '../../utils/formatters';
import { ShieldCheck, Award } from 'lucide-react';

interface ContractDocumentProps {
  contract: Contract;
  settings?: Record<string, string>;
}

export const ContractDocument: React.FC<ContractDocumentProps> = ({
  contract,
  settings = {},
}) => {
  const companyName = settings.company_name || 'شركة عَقيد للخدمات العامة وإصدار العقود';
  const companyCr = settings.company_commercial_reg || '1010789456';
  const companyTax = settings.company_tax_number || '300129384700003';
  const companyPhone = settings.company_phone || '+964 770 123 4567';
  const companyAddress = settings.company_address || 'العراق - بغداد';
  const footerText = settings.contract_footer_text || 'وثيقة رسمية معتمدة صادرة إلكترونياً عبر منصة عَقيد لإدارة العقود';

  // تجميع الحقول بحسب الأقسام
  const fields = contract.fields || [];
  const partiesFields = fields.filter((f) => f.section === 'parties');
  const detailsFields = fields.filter((f) => f.section === 'details');
  const financialFields = fields.filter((f) => f.section === 'financial');
  const termsFields = fields.filter((f) => f.section === 'terms');

  return (
    <div className="printable-document bg-white text-slate-900 font-cairo max-w-[210mm] mx-auto p-8 sm:p-12 border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
      {/* 1. Official Header */}
      <div className="border-b-2 border-slate-900 pb-5 mb-6">
        <div className="flex items-center justify-between">
          {/* Company details */}
          <div className="text-right space-y-1">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{companyName}</h1>
            <p className="text-xs text-slate-600 font-medium">
              س.ت: <span className="font-mono font-bold text-slate-800">{companyCr}</span> | الرقم الضريبي: <span className="font-mono font-bold text-slate-800">{companyTax}</span>
            </p>
            <p className="text-xs text-slate-500 font-medium">
              هاتف: <span dir="ltr" className="font-sans font-bold text-slate-800">{companyPhone}</span> | {companyAddress}
            </p>
          </div>

          {/* Official Emblem / Logo */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-200 text-emerald-700">
            <ShieldCheck className="w-10 h-10 stroke-[1.5]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 mt-1">عَقـيــد AQEED</span>
          </div>
        </div>
      </div>

      {/* 2. Contract Title & Metadata Bar */}
      <div className="bg-slate-100/90 rounded-xl p-4 mb-6 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-slate-500 block">وثيقة رسمية:</span>
          <h2 className="text-lg font-black text-slate-900">{contract.contractType?.name || 'عقد اتفاق'}</h2>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px] font-semibold">رقم العقد:</span>
            <span className="font-mono font-black text-emerald-800 text-sm tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
              {contract.contractNumber}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px] font-semibold">تاريخ التحرير:</span>
            <span className="font-bold text-slate-800">{formatDate(contract.issueDate)}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px] font-semibold">سريان العقد:</span>
            <span className="font-bold text-slate-800">
              من {formatDate(contract.startDate)} إلى {contract.endDate ? formatDate(contract.endDate) : 'غير محدد'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Preamble (مقدمة العقد) */}
      <div className="mb-6 text-xs leading-relaxed text-slate-700 bg-slate-50/60 p-4 rounded-xl border border-slate-200/60">
        <p className="font-medium text-justify">
          بعون الله تعالى وتوفيقه، تم إبرام هذا العقد في يوم <span className="font-bold text-slate-900">{formatDate(contract.issueDate)}</span> الموافق له، بين كل من الأطراف المذكورة أدناه، وهم بكامل أهليتهم الشرعية والنظامية المعتبرة، وقد اتفقا وتراضيا على ما يلي:
        </p>
      </div>

      {/* 4. Parties Information (بيانات أطراف العقد) */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200 text-slate-900 font-bold text-sm">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>أولاً: بيانات أطراف العقد</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* الطرف الأول */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="font-black text-emerald-800 text-xs pb-1 border-b border-slate-100 flex items-center justify-between">
              <span>الطرف الأول (المصدر / المالك)</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">الطرف الأول</span>
            </div>
            <p className="text-slate-800">
              <span className="text-slate-500 font-semibold ml-1">الاسم / المنشأة:</span>
              <span className="font-bold text-slate-900">{companyName}</span>
            </p>
            <p className="text-slate-800">
              <span className="text-slate-500 font-semibold ml-1">السجل التجاري:</span>
              <span className="font-mono font-bold">{companyCr}</span>
            </p>
            <p className="text-slate-800">
              <span className="text-slate-500 font-semibold ml-1">العنوان:</span>
              <span>{companyAddress}</span>
            </p>
            {partiesFields
              .filter((f) => f.fieldKey.includes('first') || f.fieldKey.includes('lessor') || f.fieldKey.includes('seller') || f.fieldKey.includes('employer') || f.fieldKey.includes('provider'))
              .map((f) => (
                <p key={f.id} className="text-slate-800">
                  <span className="text-slate-500 font-semibold ml-1">{f.label}:</span>
                  <span className="font-bold">{f.currentValue || '—'}</span>
                </p>
              ))}
          </div>

          {/* الطرف الثاني */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="font-black text-slate-800 text-xs pb-1 border-b border-slate-100 flex items-center justify-between">
              <span>الطرف الثاني (العميل / المستفيد)</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">الطرف الثاني</span>
            </div>
            <p className="text-slate-800">
              <span className="text-slate-500 font-semibold ml-1">الاسم الكامل:</span>
              <span className="font-bold text-slate-900">{contract.customer?.fullName}</span>
            </p>
            <p className="text-slate-800">
              <span className="text-slate-500 font-semibold ml-1">رقم الهوية / السجل:</span>
              <span className="font-mono font-bold">{contract.customer?.nationalId || '—'}</span>
            </p>
            <p className="text-slate-800">
              <span className="text-slate-500 font-semibold ml-1">رقم الهاتف:</span>
              <span dir="ltr" className="font-mono font-bold">{contract.customer?.phone}</span>
            </p>
            <p className="text-slate-800">
              <span className="text-slate-500 font-semibold ml-1">العنوان / المدينة:</span>
              <span>{contract.customer?.governorate || ''} {contract.customer?.address || '—'}</span>
            </p>
            {partiesFields
              .filter((f) => f.fieldKey.includes('second') || f.fieldKey.includes('lessee') || f.fieldKey.includes('buyer') || f.fieldKey.includes('employee') || f.fieldKey.includes('recipient'))
              .map((f) => (
                <p key={f.id} className="text-slate-800">
                  <span className="text-slate-500 font-semibold ml-1">{f.label}:</span>
                  <span className="font-bold">{f.currentValue || '—'}</span>
                </p>
              ))}
          </div>
        </div>
      </div>

      {/* 5. Dynamic Details Section (تفاصيل ومواصفات العقد) */}
      {detailsFields.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200 text-slate-900 font-bold text-sm">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>ثانياً: تفاصيل ومواصفات موضوع العقد</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/60 p-4 rounded-xl border border-slate-200">
            {detailsFields.map((field) => (
              <div key={field.id} className="flex items-start justify-between p-2 rounded-lg bg-white border border-slate-200/60">
                <span className="text-slate-500 font-semibold">{field.label}:</span>
                <span className="font-bold text-slate-900 max-w-[60%] text-left" dir="auto">
                  {field.currentValue || '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Financial & Payment Terms (البيانات المالية وطريقة السداد) */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200 text-slate-900 font-bold text-sm">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>ثالثاً: المقابل المالي وطريقة السداد</span>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-200/70 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-600 block text-[11px] font-semibold">إجمالي قيمة العقد:</span>
            <span className="text-base font-black text-emerald-800">
              {formatCurrency(contract.totalAmount)}
            </span>
          </div>

          <div>
            <span className="text-slate-600 block text-[11px] font-semibold">طريقة الدفع المتفق عليها:</span>
            <span className="text-sm font-bold text-slate-800">
              {getPaymentMethodLabel(contract.paymentMethod)}
            </span>
          </div>

          <div>
            <span className="text-slate-600 block text-[11px] font-semibold">حالة السريان:</span>
            <span className="text-sm font-bold text-slate-800">
              ساري ومعتمد
            </span>
          </div>

          {financialFields.map((field) => (
            <div key={field.id} className="sm:col-span-1">
              <span className="text-slate-600 block text-[11px] font-semibold">{field.label}:</span>
              <span className="text-xs font-bold text-slate-900">{field.currentValue || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Terms & Conditions (الشروط والأحكام) */}
      <div className="mb-8 page-break-inside-avoid">
        <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200 text-slate-900 font-bold text-sm">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>رابعاً: الشروط والأحكام العامة</span>
        </div>

        <div className="text-xs leading-relaxed text-slate-700 bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-justify whitespace-pre-line">
          {contract.termsAndConditions ||
            '1. يعتبر التمهيد السابق وبيانات الأطراف جزءاً لا يتجزأ من هذا العقد ومكملاً لبنوده ومفسراً له.\n2. يقر الطرفان بصحة العناوين والبيانات وأرقام التواصل المذكورة في هذا العقد وأن كافة الإشعارات المرسلة عليها ملزمة.\n3. في حال نشوء أي خلاف - لا قدر الله - فيتم حله ودياً، فإن تعذر ذلك يرفع النزاع إلى الجهة القضائية المختصة وفق القوانين العراقية النافذة.'}

          {termsFields.map((f) => (
            <div key={f.id} className="pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-900 block">{f.label}:</span>
              <span className="text-slate-700">{f.currentValue || 'لا توجد شروط إضافية'}</span>
            </div>
          ))}

          {contract.notes && (
            <div className="pt-2 border-t border-slate-100 text-slate-600 italic">
              <span className="font-bold text-slate-800 not-italic">ملاحظات خاصة: </span>
              {contract.notes}
            </div>
          )}
        </div>
      </div>

      {/* 8. Signatures & Official Stamp (التواقيع وختم الشركة) */}
      <div className="page-break-inside-avoid pt-4 border-t-2 border-slate-900">
        <div className="grid grid-cols-3 gap-6 text-center text-xs">
          {/* الطرف الأول */}
          <div className="space-y-3">
            <p className="font-bold text-slate-900">توقيع الطرف الأول</p>
            <p className="text-[11px] text-slate-500 font-medium">{companyName}</p>
            <div className="h-16 flex items-end justify-center border-b border-dashed border-slate-300 pb-1">
              <span className="text-slate-400 text-[11px] italic font-serif">معتمد رسمياً</span>
            </div>
          </div>

          {/* ختم الشركة الرسمي */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-700/60 flex flex-col items-center justify-center p-1 text-emerald-800/80 transform rotate-[-8deg] bg-emerald-50/20">
              <span className="text-[8px] font-black uppercase tracking-wider">مكتب العقود الرسمي</span>
              <ShieldCheck className="w-6 h-6 my-0.5" />
              <span className="text-[8px] font-bold">معتمد إلكترونياً</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-semibold">خـاتــم الاعتماد</span>
          </div>

          {/* الطرف الثاني */}
          <div className="space-y-3">
            <p className="font-bold text-slate-900">توقيع الطرف الثاني</p>
            <p className="text-[11px] text-slate-500 font-medium">{contract.customer?.fullName}</p>
            <div className="h-16 flex items-end justify-center border-b border-dashed border-slate-300 pb-1">
              <span className="text-slate-400 text-[11px] italic">توقيع المستلم / العميل</span>
            </div>
          </div>
        </div>
      </div>

      {/* 9. Official Document Footer */}
      <div className="mt-10 pt-4 border-t border-slate-200 text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>{footerText}</span>
        <span className="font-mono">
          تم الإصدار بواسطة: {contract.createdBy?.fullName || 'النظام'} | {contract.contractNumber}
        </span>
      </div>
    </div>
  );
};
