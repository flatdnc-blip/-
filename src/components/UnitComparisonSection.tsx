import React, { useState } from 'react';
import { UNIT_PLANS } from '../data/apartmentData';
import { UnitPlan } from '../types';
import { 
  SplitSquareVertical, 
  Waves, 
  Ruler, 
  Maximize2, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Home,
  CheckCircle2
} from 'lucide-react';

interface UnitComparisonSectionProps {
  onOpenComparison: () => void;
  onOpenInterest: (unitId?: string) => void;
}

export const UnitComparisonSection: React.FC<UnitComparisonSectionProps> = ({
  onOpenComparison,
  onOpenInterest,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string>('84A');
  const selectedUnit = UNIT_PLANS.find((u) => u.id === selectedUnitId) || UNIT_PLANS[1];

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl space-y-8">
      {/* Section Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              FLOOR PLANS & SPECIFICATIONS
            </span>
            <span className="text-slate-600 text-xs hidden sm:inline">|</span>
            <span className="text-xs text-cyan-300 font-medium hidden sm:inline-flex items-center gap-1">
              <Waves className="w-3 h-3 text-cyan-400" />
              전 세대 88% 오션뷰 특화설계
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
            평면 안내 & 1:1 맞춤 비교 시스템
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            원하는 두 가지 평형을 선택하여 평면도 구조, 조망 방향, 전용면적, 특화 옵션을 한눈에 1:1 비교하세요.
          </p>
        </div>

        <button
          onClick={onOpenComparison}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
        >
          <SplitSquareVertical className="w-4 h-4 text-slate-950" />
          <span>평면도 1:1 비교분석 열기</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
        </button>
      </div>

      {/* Unit Type Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {UNIT_PLANS.map((unit) => (
          <button
            key={unit.id}
            onClick={() => setSelectedUnitId(unit.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedUnitId === unit.id
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <span>{unit.name}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
              selectedUnitId === unit.id
                ? 'bg-slate-950 text-amber-300'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {unit.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Unit Showcase Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left 6 Columns: High-Res Floor Plan Preview */}
        <div className="lg:col-span-6 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-bold text-amber-400">{selectedUnit.subName}</span>
              <h4 className="text-xl font-bold text-white font-serif">{selectedUnit.name}</h4>
            </div>
            <span className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <Waves className="w-3 h-3 text-cyan-400" />
              {selectedUnit.oceanView}
            </span>
          </div>

          <div 
            onClick={onOpenComparison}
            className="relative rounded-xl overflow-hidden bg-white p-3 border border-slate-800 cursor-pointer shadow-inner min-h-[260px] flex items-center justify-center group"
          >
            <img
              src={selectedUnit.floorPlanImage}
              alt={`${selectedUnit.name} 평면도`}
              className="w-full h-auto object-contain max-h-[280px] group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 shadow-xl flex items-center gap-1.5">
                <SplitSquareVertical className="w-3.5 h-3.5 text-amber-400" />
                다른 타입과 1:1 비교하기
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>단지 배치: {selectedUnit.orientation}</span>
            <span className="font-bold text-slate-200">총 {selectedUnit.totalUnits}세대</span>
          </div>
        </div>

        {/* Right 6 Columns: Specs Table & Key Highlights */}
        <div className="lg:col-span-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">전용면적</p>
              <p className="text-sm sm:text-base font-black text-amber-400 font-mono">{selectedUnit.exclusiveArea}㎡</p>
              <p className="text-[11px] text-slate-400">{selectedUnit.pyeong}평형</p>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">구조 및 베이</p>
              <p className="text-sm sm:text-base font-black text-white">{selectedUnit.bayCount}</p>
              <p className="text-[11px] text-slate-400">{selectedUnit.structure.slice(0, 7)}</p>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">공간 구성</p>
              <p className="text-sm sm:text-base font-black text-cyan-400">침실 {selectedUnit.rooms}</p>
              <p className="text-[11px] text-slate-400">욕실 {selectedUnit.bathrooms}실</p>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">예상 분양가</p>
              <p className="text-xs sm:text-sm font-black text-amber-300 font-mono truncate">{selectedUnit.estimatedPrice.split('~')[0]}</p>
              <p className="text-[11px] text-slate-400">중도금 혜택</p>
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {selectedUnit.name} 핵심 특화 설계
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {selectedUnit.keyFeatures.map((feat, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onOpenComparison}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <SplitSquareVertical className="w-4 h-4 text-amber-400" />
              <span>다른 평면과 1:1 비교하기</span>
            </button>
            <button
              onClick={() => onOpenInterest(selectedUnit.id)}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-amber-500/20 text-center"
            >
              {selectedUnit.name} VIP 분양상담 신청
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
