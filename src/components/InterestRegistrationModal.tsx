import React, { useState } from 'react';
import { 
  X, 
  BookmarkCheck, 
  Phone, 
  User, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Waves,
  Train
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface InterestRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InterestRegistrationModal: React.FC<InterestRegistrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [unitType, setUnitType] = useState('84A');
  const [primaryInterest, setPrimaryInterest] = useState('ocean');
  const [agreed, setAgreed] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resId, setResId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
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

    const registrationCode = 'VIP-' + Math.floor(100000 + Math.random() * 900000);
    setResId(registrationCode);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setName('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                VIP 관심고객 등록 및 분양상담 예약
              </h3>
              <p className="text-xs text-slate-400">
                다대포 해수욕장 오션뷰 & 다대포항역 초역세권 정보 안내
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body or Success State */}
        <div className="p-5">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white mb-1">
                  관심고객 등록이 완료되었습니다!
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  다대포 오션시티 프레스티지 전문 분양 상담사가 빠른 시간 내에 연락드려 로얄동·호수 배정 및 분양가 상세 정보를 안내해 드립니다.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-w-xs mx-auto">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">VIP 예약 접수번호</span>
                <p className="text-xl font-black text-amber-400 font-mono tracking-wider">{resId}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  성명: {name} | 연락처: {phone}
                </p>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                확인
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                    onClick={() => setUnitType('104')}
                    className={`py-2 px-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      unitType === '104'
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    104㎡ (대형 테라스)
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
                    <span>다대포항역 초역세권</span>
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span>
                    [필수] 분양 일정, 동호수 추첨 및 이벤트 안내를 위한 개인정보 수집 및 이용에 동의합니다.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                VIP 관심고객 등록 및 상담 신청
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
