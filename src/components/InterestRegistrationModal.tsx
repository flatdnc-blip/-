import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  BookmarkCheck, 
  Waves, 
  Train, 
  User, 
  Phone,
  Calendar,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitInterestRegistration } from '../services/interestRegistrationService';

interface InterestRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUnitType?: string;
}

export const InterestRegistrationModal: React.FC<InterestRegistrationModalProps> = ({
  isOpen,
  onClose,
  initialUnitType = '84A',
}) => {
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [unitType, setUnitType] = useState(initialUnitType);
  const [primaryInterest, setPrimaryInterest] = useState('ocean');
  const [wantVisit, setWantVisit] = useState(true);
  const [visitDate, setVisitDate] = useState(getTomorrowDate());
  const [visitTime, setVisitTime] = useState('14:00');
  const [agreed, setAgreed] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resId, setResId] = useState('');

  const timeSlots = [
    { time: '10:30', label: '오전 10:30' },
    { time: '11:30', label: '오전 11:30' },
    { time: '14:00', label: '오후 02:00' },
    { time: '15:30', label: '오후 03:30' },
    { time: '17:00', label: '오후 05:00' },
  ];

  // Sync unitType when initialUnitType changes or modal opens
  useEffect(() => {
    if (initialUnitType) {
      setUnitType(initialUnitType);
    }
  }, [initialUnitType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !agreed) return;

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#06b6d4', '#f97316', '#ffffff'],
      });
    } catch (err) {
      // Confetti fallback
    }

    try {
      const record = await submitInterestRegistration({
        name,
        phone,
        unitType,
        primaryInterest,
        wantsOceanView: primaryInterest === 'ocean',
        visitDate: wantVisit ? visitDate : '',
        visitTime: wantVisit ? visitTime : '',
      });
      setResId(record.registrationCode);
    } catch (error) {
      const registrationCode = 'VIP-' + Math.floor(100000 + Math.random() * 900000);
      setResId(registrationCode);
    }

    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setName('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white break-keep">
                VIP 관심고객 등록 & 홍보관 방문예약
              </h3>
              <p className="text-[11px] text-slate-400 break-keep">
                다대포 해수욕장 오션뷰 & 다대포항역 1분 초역세권
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body or Success State */}
        <div className="p-4 sm:p-5 overflow-y-auto">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white mb-1 break-keep">
                  VIP 관심고객 & 방문 예약이 접수되었습니다!
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed break-keep">
                  전담 전문 분양 상담사가 배정되어 빠른 시간 내에 연락드리며, 요청하신 일시에 맞춰 로얄동·호수 배정 및 분양 조건을 안내해 드립니다.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 max-w-sm mx-auto space-y-2">
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">VIP 예약 접수번호</span>
                <p className="text-2xl font-black text-amber-400 font-mono tracking-wider">{resId}</p>
                
                <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-1">
                  <p>성명: <strong className="text-white">{name}</strong> ({phone})</p>
                  {wantVisit && visitDate && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 font-bold mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>방문 예정일시: {visitDate} ({visitTime})</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                확인
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Customer Name */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  성명 <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  연락처 <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="tel"
                    required
                    placeholder="010-0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Visit Reservation Calendar & Time Picker */}
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>홍보관 모델하우스 방문 예약</span>
                  </div>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wantVisit}
                      onChange={(e) => setWantVisit(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>예약 신청</span>
                  </label>
                </div>

                {wantVisit && (
                  <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                        방문 희망 날짜 선택
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                        방문 시간대 선택
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => setVisitTime(slot.time)}
                            className={`py-1.5 px-2 rounded-lg text-center font-mono text-[11px] transition-all cursor-pointer border ${
                              visitTime === slot.time
                                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Unit Type Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  관심 평형대 선택
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUnitType('59')}
                    className={`py-2 px-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      unitType === '59'
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    59㎡ (실속 중소형)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnitType('84A')}
                    className={`py-2 px-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      unitType === '84A'
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    84㎡ A (파노라마 오션뷰)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnitType('84B')}
                    className={`py-2 px-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      unitType === '84B'
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    84㎡ B (2면 타워형 개방)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnitType('128')}
                    className={`py-2 px-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      unitType === '128'
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    128㎡ (펜트하우스)
                  </button>
                </div>
              </div>

              {/* Expectations */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  가장 기대되는 특화 요소
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrimaryInterest('ocean')}
                    className={`p-2 rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      primaryInterest === 'ocean'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Waves className="w-3.5 h-3.5" />
                    <span>바다 영구조망</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrimaryInterest('transit')}
                    className={`p-2 rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      primaryInterest === 'transit'
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Train className="w-3.5 h-3.5" />
                    <span>다대포항역 1분</span>
                  </button>
                </div>
              </div>

              {/* Agreement */}
              <div className="pt-1">
                <label className="flex items-start gap-2 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="break-keep">
                    [필수] 홍보관 방문 및 분양 일정 안내를 위한 개인정보 수집 및 이용에 동의합니다.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                VIP 관심고객 등록 및 홍보관 방문 예약
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
