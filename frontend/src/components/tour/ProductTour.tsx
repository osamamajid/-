import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, HelpCircle, FastForward, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
  isOptional?: boolean;
}

interface ProductTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const TOUR_STORAGE_KEY = 'aqeed_tour_completed';
const TOUR_STEP_STORAGE_KEY = 'aqeed_tour_current_step';

export const ProductTour: React.FC<ProductTourProps> = ({ isOpen, onClose, onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  const isDemoUser = user?.role === 'DEMO';

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      target: '',
      title: '👋 أهلاً بك في منصة عَقيد',
      content: 'دعنا نأخذ جولة سريعة للتعرف على النظام. ستتعلم كيفية إدارة العقود والعملاء والقوالب بكل سهولة.',
      position: 'center',
      isOptional: true,
    },
    {
      id: 'dashboard',
      target: '[data-tour="dashboard"]',
      title: '📊 لوحة التحكم الرئيسية',
      content: 'هذه هي لوحة التحكم الرئيسية. من هنا يمكنك متابعة العقود والعملاء والإحصائيات المهمة والتنبيهات الذكية لانتهاء العقود.',
      position: 'bottom',
    },
    {
      id: 'quick-create',
      target: '[data-tour="quick-create"]',
      title: '➕ إنشاء عقد سريع',
      content: 'زر "إنشاء عقد جديد" يتيح لك البدء فوراً بإنشاء عقد جديد مع اختيار العميل والنوع والحقول الديناميكية.',
      position: 'bottom',
      isOptional: true,
    },
    {
      id: 'customers',
      target: '[data-tour="customers"]',
      title: '👥 إدارة العملاء',
      content: 'من هنا يمكنك إضافة وإدارة بيانات العملاء: الأسماء، أرقام الهواتف، الهويات، العناوين، والمحافظات العراقية.',
      position: 'left',
    },
    {
      id: 'add-customer',
      target: '[data-tour="add-customer"]',
      title: '➕ إضافة عميل جديد',
      content: 'اضغط على "إضافة عميل جديد" لإنشاء سجل عميل جديد بجميع بياناته الأساسية والملاحظات.',
      position: 'left',
      isOptional: true,
    },
    {
      id: 'contracts',
      target: '[data-tour="contracts"]',
      title: '📄 إدارة العقود',
      content: 'هنا تتم إدارة جميع العقود: إنشاؤها، تعديلها، أرشفتها، طباعتها، وتتبع حالاتها (نشط، مسودة، منتهي، ملغي).',
      position: 'left',
    },
    {
      id: 'create-contract',
      target: '[data-tour="create-contract"]',
      title: '📝 إنشاء عقد جديد',
      content: 'اختر العميل ونوع العقد، ثم أدخل البيانات المطلوبة في الحقول الديناميكية التي تتغير حسب نوع العقد والقالب المستخدم.',
      position: 'left',
      isOptional: true,
    },
    {
      id: 'dynamic-fields',
      target: '[data-tour="dynamic-fields"]',
      title: '🔧 الحقول الديناميكية (Dynamic Fields)',
      content: 'هذه الحقول تتغير حسب نوع العقد والقالب المستخدم. تدعم: نص، رقم، تاريخ، قائمة منسدلة، نص طويل، ومربع اختيار.',
      position: 'top',
    },
    {
      id: 'templates',
      target: '[data-tour="templates"]',
      title: '📋 قوالب ونماذج العقود',
      content: 'يمكنك إنشاء وإدارة قوالب العقود لتسريع عملية إنشاء العقود. كل قالب يحتوي على حقول مخصصة وشروط وأحكاف قياسية.',
      position: 'left',
    },
    {
      id: 'reports',
      target: '[data-tour="reports"]',
      title: '📈 التقارير والإحصائيات',
      content: 'من هنا يمكنك متابعة الإحصائيات والتقارير الخاصة بالنظام: توزيع العقود حسب النوع، الاتجاهات الشهرية، والإيرادات.',
      position: 'left',
    },
    {
      id: 'users-permissions',
      target: '[data-tour="users-permissions"]',
      title: '👤 المستخدمون والصلاحيات',
      content: 'يمكن للمسؤول إدارة المستخدمين وتحديد صلاحيات الوصول لكل دور: مسؤول، موظف، مشاهد، أو تجريبي.',
      position: 'left',
    },
    {
      id: 'settings',
      target: '[data-tour="settings"]',
      title: '⚙️ إعدادات النظام',
      content: 'يمكنك إدارة إعدادات النظام والشركة: بيانات المنشأة، بادئة أرقام العقود، العملة، تنبيهات الانتهاء، ونص التذييل.',
      position: 'left',
    },
    {
      id: 'demo-banner',
      target: '[data-tour="demo-banner"]',
      title: '🎯 وضع التجربة (Demo Mode)',
      content: 'أنت الآن تستخدم النسخة التجريبية. يمكنك تجربة جميع الوظائف الأساسية، لكن بعض العمليات الإدارية محمية.',
      position: 'top',
    },
    {
      id: 'help-restart',
      target: '[data-tour="help-button"]',
      title: '❓ مساعدة وإعادة الجولة',
      content: 'يمكنك دائماً الضغط على زر المساعدة (?) في الشريط العلوي لإعادة هذه الجولة التعريفية في أي وقت.',
      position: 'bottom',
    },
    {
      id: 'complete',
      target: '',
      title: '🎉 انتهت الجولة!',
      content: 'أنت الآن جاهز لاستكشاف منصة عَقيد. ابدأ بإنشاء أول عقد أو إضافة عميل جديد. نتمنى لك تجربة ممتعة!',
      position: 'center',
    },
  ];

  const filteredSteps = tourSteps.filter(step => {
    if (step.id === 'users-permissions' && !isDemoUser && user?.role !== 'ADMIN') {
      return false;
    }
    if (step.id === 'templates' && user?.role !== 'ADMIN') {
      return false;
    }
    if (step.id === 'reports' && user?.role === 'VIEWER') {
      return false;
    }
    return true;
  });

  const currentStepData = filteredSteps[currentStep];

  const scrollToTarget = useCallback((selector: string) => {
    if (!selector) return;
    const element = document.querySelector<HTMLElement>(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      targetRef.current = element;
      element.classList.add('tour-highlight');
      setTimeout(() => element.classList.remove('tour-highlight'), 2000);
    }
  }, []);

  useEffect(() => {
    if (isOpen && isFirstOpen) {
      const savedStep = localStorage.getItem(TOUR_STEP_STORAGE_KEY);
      if (savedStep) {
        const stepIndex = filteredSteps.findIndex(s => s.id === savedStep);
        if (stepIndex !== -1) {
          setCurrentStep(stepIndex);
        }
      }
      setIsFirstOpen(false);
      if (currentStepData?.target) {
        setTimeout(() => scrollToTarget(currentStepData.target), 100);
      }
    }
  }, [isOpen, isFirstOpen, currentStepData, filteredSteps, scrollToTarget]);

  useEffect(() => {
    if (isOpen && currentStepData?.target) {
      scrollToTarget(currentStepData.target);
      localStorage.setItem(TOUR_STEP_STORAGE_KEY, currentStepData.id);
    }
  }, [currentStep, isOpen, currentStepData, scrollToTarget]);

  const handleNext = () => {
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    localStorage.removeItem(TOUR_STEP_STORAGE_KEY);
    onComplete?.();
    onClose();
  };

  const handleRestart = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    localStorage.removeItem(TOUR_STEP_STORAGE_KEY);
    setCurrentStep(0);
    setIsFirstOpen(true);
  };

  if (!isOpen) return null;

  const progress = ((currentStep + 1) / filteredSteps.length) * 100;

  const isCenterStep = currentStepData.position === 'center';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        style={{ opacity: isCenterStep ? 0.7 : 0.3 }}
        onClick={handleSkip}
      />

      {/* Center Modal for Welcome/Complete */}
      {isCenterStep && (
        <div className="relative w-full max-w-md pointer-events-auto animate-in zoom-in-95 fade-in">
          <div className="bg-white rounded-3xl shadow-modal border border-slate-100 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white">
              {currentStepData.id === 'welcome' ? (
                <span className="text-3xl">🚀</span>
              ) : (
                <CheckCircle2 className="w-8 h-8" />
              )}
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">{currentStepData.title}</h2>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">{currentStepData.content}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {currentStepData.id === 'welcome' && (
                <Button variant="primary" size="lg" onClick={handleNext} icon={<ChevronRight className="w-4 h-4" />}>
                  ابدأ الجولة
                </Button>
              )}
              {currentStepData.id === 'complete' && (
                <Button variant="primary" size="lg" onClick={handleComplete} icon={<CheckCircle2 className="w-4 h-4" />}>
                  ابدأ التجربة الآن
                </Button>
              )}
              <Button variant="outline" size="lg" onClick={handleSkip}>
                تخطي
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip for regular steps */}
      {!isCenterStep && currentStepData.target && (
        <div
          ref={tooltipRef}
          className="pointer-events-auto animate-in fade-in zoom-in-95 max-w-xs"
          style={{
            position: 'fixed',
            zIndex: 51,
            ...getTooltipPosition(currentStepData.target, currentStepData.position),
          }}
        >
          <div className="bg-white rounded-2xl shadow-modal border border-slate-100 p-5 w-full relative">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-slate-500">الخطوة {currentStep + 1} من {filteredSteps.length}</span>
                <span className="text-emerald-600">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Content */}
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              {currentStepData.title}
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">{currentStepData.content}</p>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-xs text-slate-500 hover:text-rose-600"
              >
                <FastForward className="w-3.5 h-3.5 mr-1" />
                تخطي الجولة
              </Button>
              <div className="flex items-center gap-2 ml-auto">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    icon={<ChevronLeft className="w-3.5 h-3.5" />}
                    className="text-xs"
                  >
                    السابق
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNext}
                  icon={currentStep === filteredSteps.length - 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  className="text-xs shadow-emerald-600/20"
                >
                  {currentStep === filteredSteps.length - 1 ? 'إنهاء' : 'التالي'}
                </Button>
              </div>
            </div>

            {/* Arrow */}
            <div className={`absolute ${getArrowPosition(currentStepData.position)}`}>
              <div className="w-3 h-3 bg-white border-l border-t border-slate-100 rotate-45" />
            </div>
          </div>
        </div>
      )}

      {/* Highlight style injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        .tour-highlight {
          box-shadow: 0 0 0 4px #10b981, 0 0 0 8px rgba(16, 185, 129, 0.3) !important;
          border-radius: 8px !important;
          transition: box-shadow 0.3s ease !important;
          z-index: 50 !important;
          position: relative !important;
        }
      `}} />
    </div>
  );
};

function getTooltipPosition(selector: string, position: string) {
  const element = document.querySelector(selector);
  if (!element) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  const rect = element.getBoundingClientRect();
  const tooltipWidth = 320;
  const tooltipHeight = 200;
  const gap = 12;

  let top = rect.top;
  let left = rect.left;

  switch (position) {
    case 'top':
      top = rect.top - tooltipHeight - gap;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      break;
    case 'bottom':
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      break;
    case 'left':
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.left - tooltipWidth - gap;
      break;
    case 'right':
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.right + gap;
      break;
    default:
      top = window.innerHeight / 2 - tooltipHeight / 2;
      left = window.innerWidth / 2 - tooltipWidth / 2;
  }

  // Keep within viewport
  top = Math.max(10, Math.min(top, window.innerHeight - tooltipHeight - 10));
  left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));

  return { top: `${top}px`, left: `${left}px` };
}

function getArrowPosition(position: string) {
  switch (position) {
    case 'top': return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2';
    case 'bottom': return 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2';
    case 'left': return 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2';
    case 'right': return 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2';
    default: return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2';
  }
}

export const shouldShowTour = (): boolean => {
  if (typeof window === 'undefined') return false;
  const completed = localStorage.getItem(TOUR_STORAGE_KEY);
  return completed !== 'true';
};

export const resetTour = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOUR_STORAGE_KEY);
  localStorage.removeItem(TOUR_STEP_STORAGE_KEY);
};