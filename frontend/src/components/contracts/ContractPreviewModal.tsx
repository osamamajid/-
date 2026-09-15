import React, { useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Printer, Download, X } from 'lucide-react';
import { Contract } from '../../types/contract.types';
import { ContractDocument } from './ContractDocument';
import api from '../../config/api';

interface ContractPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  settings?: Record<string, string>;
}

export const ContractPreviewModal: React.FC<ContractPreviewModalProps> = ({
  isOpen,
  onClose,
  contract,
  settings,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!contract) return null;

  const handlePrint = async () => {
    try {
      // تسجيل العملية في سجل المراجعة
      api.post('/contracts/log-export', {
        contractId: contract.id,
        contractNumber: contract.contractNumber,
      }).catch(console.error);

      window.print();
    } catch (e) {
      console.error('Print failed', e);
    }
  };

  const handleExportPDF = () => {
    // الطريقة الاحترافية القياسية والمضمونة لتصدير ملف PDF ناقلي وعالي الجودة في المتصفح:
    // فتح نافذة طباعة مخصصة أو استخدام أمر الطباعة والحفظ كـ PDF
    handlePrint();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="full" showCloseButton={false}>
      {/* Action Toolbar */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 no-print">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>معاينة العقد الرسمي قبل الطباعة:</span>
            <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-sm font-black border border-emerald-200">
              {contract.contractNumber}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            النموذج مهيأ تلقائياً للطباعة A4 والحفظ كـ PDF بوضوح فائق ودعم كامل للغة العربية.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPDF}
            icon={<Download className="w-4 h-4" />}
          >
            حفظ كـ PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            طباعة فورية
          </Button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors mr-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Document View Wrapper */}
      <div
        ref={printRef}
        className="max-h-[78vh] overflow-y-auto p-4 sm:p-8 bg-slate-100/70 rounded-2xl border border-slate-200"
      >
        <ContractDocument contract={contract} settings={settings} />
      </div>
    </Modal>
  );
};
