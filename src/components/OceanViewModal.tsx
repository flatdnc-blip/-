import React, { useState } from 'react';
import { 
  X, 
  Waves, 
  Sun, 
  Sunset, 
  Compass, 
  Sparkles, 
  Eye, 
  Check, 
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { IMAGES } from '../data/apartmentData';

interface OceanViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInterest: () => void;
}

export const OceanViewModal: React.FC<OceanViewModalProps> = ({
  isOpen,
  onClose,
  onOpenInterest,
}) => {
  const [selectedFloor, setSelectedFloor] = useState<'mid' | 'high' | 'penthouse'>('penthouse');
  const [timeMode, setTimeMode] = useState<'sunset' | 'day'>('sunset');

  if (!isOpen) return null;

  const floorLabels = {
    mid: '18F 중층 오션뷰 (해변공원 & 바다 수평선)',
    high: '29F 로얄층 파노라마뷰 (다대포 백사장 & 남해 먼바다)',
    penthouse: '39F 펜트하우스 스카이뷰 (180° 압도적 영구 파노라마 조망)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                다대포 해수욕장 영구 바다조망 시뮬레이터
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                  영구 조망권 확보
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                실제 세대 테라스 및 거실에서 내려다보는 시원한 남해 바다와 황홀한 일몰 뷰
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

        {/* Floor & Time Selector Controls */}
        <div className="px-4 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold mr-1">조망 층수 선택:</span>
            <button
              onClick={() => setSelectedFloor('mid')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFloor === 'mid'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              18F 중층
            </button>
            <button
              onClick={() => setSelectedFloor('high')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFloor === 'high'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              29F 로얄층
            </button>
            <button
              onClick={() => setSelectedFloor('penthouse')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFloor === 'penthouse'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              39F 펜트하우스
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold mr-1">시간대:</span>
            <button
              onClick={() => setTimeMode('sunset')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                timeMode === 'sunset'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Sunset className="w-3.5 h-3.5" />
              <span>골든아워 선셋</span>
            </button>
            <button
              onClick={() => setTimeMode('day')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                timeMode === 'day'
                  ? 'bg-sky-500 text-white font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>맑은 정오</span>
            </button>
          </div>
        </div>

        {/* Main Ocean Simulation Image */}
        <div className="relative w-full bg-black overflow-hidden flex-1 min-h-[300px] sm:min-h-[400px]">
          <img
            src={timeMode === 'sunset' ? IMAGES.penthouseView : IMAGES.dayAerial}
            alt="다대포 해수욕장 영구 바다조망 실경 시뮬레이션"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover max-h-[55vh]"
          />

          {/* Perspective View Overlay Badge */}
          <div className="absolute top-4 left-4 z-10 bg-slate-950/85 backdrop-blur-md border border-cyan-500/50 px-3.5 py-2 rounded-xl text-white shadow-xl">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold mb-0.5">
              <Compass className="w-3.5 h-3.5" />
              <span>남서향 파노라마 뷰 (South-West Ocean View)</span>
            </div>
            <p className="text-sm font-black text-white">
              {floorLabels[selectedFloor]}
            </p>
          </div>

          {/* Ocean Features Overlay Tags on Image */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap gap-2 pointer-events-none">
            <div className="px-3 py-1.5 bg-slate-950/80 backdrop-blur-md rounded-lg border border-slate-700/80 text-xs text-white flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>다대포 은빛 백사장 (도보 3분)</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-950/80 backdrop-blur-md rounded-lg border border-slate-700/80 text-xs text-white flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>세계 3대 선셋 낙조 뷰포인트</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-950/80 backdrop-blur-md rounded-lg border border-slate-700/80 text-xs text-white flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>철새도래지 & 해안생태공원 파노라마</span>
            </div>
          </div>
        </div>

        {/* Ocean View Feature Specs Grid */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">오션뷰 세대 비율</p>
            <p className="text-base sm:text-lg font-black text-cyan-400 font-mono">약 88%</p>
            <p className="text-[11px] text-slate-400">전체 986세대 중</p>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">조망 간섭 제로</p>
            <p className="text-base sm:text-lg font-black text-amber-400 font-mono">최대 85m</p>
            <p className="text-[11px] text-slate-400">와이드 동간거리</p>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">창호 특화설계</p>
            <p className="text-base sm:text-lg font-black text-emerald-400">프레임리스</p>
            <p className="text-[11px] text-slate-400">철제난간 없는 강화유리</p>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">해수욕장 도보</p>
            <p className="text-base sm:text-lg font-black text-purple-400 font-mono">도보 3분</p>
            <p className="text-[11px] text-slate-400">해변공원 도보 2분</p>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400 hidden sm:block">
            ※ 실제 조망은 층수 및 동호수에 따라 차이가 있을 수 있으며 사전 상담 시 상세 동·호수별 조망도를 확인하실 수 있습니다.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onOpenInterest();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-cyan-500/25"
            >
              오션뷰 로얄동호수 선착순 상담 신청
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
