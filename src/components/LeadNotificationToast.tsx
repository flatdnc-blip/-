import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  ChevronRight, 
  Phone, 
  Clock, 
  Sparkles, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { 
  StoredInterestRegistration, 
  requestNotificationPermission 
} from '../services/interestRegistrationService';

interface LeadNotificationToastProps {
  onOpenDashboard: () => void;
}

export const LeadNotificationToast: React.FC<LeadNotificationToastProps> = ({
  onOpenDashboard,
}) => {
  const [activeLead, setActiveLead] = useState<StoredInterestRegistration | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    const handleNewLead = (e: Event) => {
      const customEvent = e as CustomEvent<StoredInterestRegistration>;
      if (customEvent.detail) {
        setActiveLead(customEvent.detail);
        // Auto dismiss after 7 seconds
        const timer = setTimeout(() => {
          setActiveLead((curr) => (curr?.id === customEvent.detail.id ? null : curr));
        }, 7000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('new-lead-registered', handleNewLead);
    return () => {
      window.removeEventListener('new-lead-registered', handleNewLead);
    };
  }, []);

  const handleEnableNotification = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
  };

  if (!activeLead) return null;

  const typeLabel = 
    activeLead.unitType === '59' ? '59㎡' : 
    activeLead.unitType === '84A' ? '84㎡A' : 
    activeLead.unitType === '84B' ? '84㎡B' : 
    activeLead.unitType === '128' ? '128㎡' : activeLead.unitType;

  return (
    <div className="fixed top-20 right-3 sm:right-6 z-50 max-w-sm sm:max-w-md w-full animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="bg-slate-950/95 border border-amber-500/80 rounded-2xl shadow-2xl shadow-amber-950/50 p-4 backdrop-blur-xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="text-xs font-black tracking-tight text-amber-400 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              실시간 VIP 분양상담 접수 알림
            </span>
          </div>

          <button
            onClick={() => setActiveLead(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base font-extrabold text-white">
              {activeLead.name} 고객님
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
              {activeLead.registrationCode}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <a
              href={`tel:${activeLead.phone}`}
              className="flex items-center gap-1 text-cyan-400 font-mono font-bold hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{activeLead.phone}</span>
            </a>
            <span className="text-slate-600">·</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold text-slate-200">
              {typeLabel}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">
              {activeLead.primaryInterest === 'ocean' ? '바다조망' : activeLead.primaryInterest === 'transit' ? '초역세권' : '투자/편의'}
            </span>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between gap-2">
            {notificationPermission !== 'granted' && (
              <button
                onClick={handleEnableNotification}
                className="text-[11px] text-amber-300 hover:text-amber-200 underline cursor-pointer"
              >
                데스크톱 푸시 알림 켜기
              </button>
            )}

            <button
              onClick={() => {
                setActiveLead(null);
                onOpenDashboard();
              }}
              className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer"
            >
              <span>관리자 대시보드 바로보기</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-950" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
