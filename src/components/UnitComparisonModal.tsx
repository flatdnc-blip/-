import React, { useState } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  Check, 
  Maximize2, 
  Sparkles, 
  HardDrive, 
  Printer, 
  Waves, 
  Home, 
  Compass, 
  Ruler, 
  DollarSign, 
  CheckCircle2, 
  ExternalLink,
  Info,
  ChevronRight,
  SplitSquareVertical
} from 'lucide-react';
import { UNIT_PLANS } from '../data/apartmentData';
import { UnitPlan } from '../types';
import { uploadFileToDrive, getOrCreateApartmentFolder } from '../services/googleDriveService';
import { getAccessToken } from '../services/firebaseAuth';

interface UnitComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInterest: (unitId?: string) => void;
  onOpenGoogleDrive: () => void;
}

export const UnitComparisonModal: React.FC<UnitComparisonModalProps> = ({
  isOpen,
  onClose,
  onOpenInterest,
  onOpenGoogleDrive,
}) => {
  // Default compare 84A vs 84B or 59 vs 84A
  const [leftUnitId, setLeftUnitId] = useState<string>('84A');
  const [rightUnitId, setRightUnitId] = useState<string>('84B');
  const [onlyDiffs, setOnlyDiffs] = useState<boolean>(false);
  const [zoomImage, setZoomImage] = useState<{ src: string; title: string } | null>(null);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveSaveMessage, setDriveSaveMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const leftUnit = UNIT_PLANS.find((u) => u.id === leftUnitId) || UNIT_PLANS[1];
  const rightUnit = UNIT_PLANS.find((u) => u.id === rightUnitId) || UNIT_PLANS[2];

  const handleSwap = () => {
    const temp = leftUnitId;
    setLeftUnitId(rightUnitId);
    setRightUnitId(temp);
  };

  const handleSaveComparisonToDrive = async () => {
    setIsSavingToDrive(true);
    setDriveSaveMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        onClose();
        onOpenGoogleDrive();
        return;
      }

      const folderId = await getOrCreateApartmentFolder();
      const content = `# 다대포 오션시티 프레스티지 평면 비교 분석 리포트

## 비교 대상: [${leftUnit.name} (${leftUnit.subName})] VS [${rightUnit.name} (${rightUnit.subName})]

### 1. 기본 제원 비교
| 항목 | ${leftUnit.name} | ${rightUnit.name} |
| :--- | :--- | :--- |
| 구조 | ${leftUnit.structure} | ${rightUnit.structure} |
| 전용면적 | ${leftUnit.exclusiveArea}㎡ (${leftUnit.pyeong}평) | ${rightUnit.exclusiveArea}㎡ (${rightUnit.pyeong}평) |
| 공급면적 | ${leftUnit.supplyArea}㎡ | ${rightUnit.supplyArea}㎡ |
| 계약면적 | ${leftUnit.contractArea}㎡ | ${rightUnit.contractArea}㎡ |
| 세대수 | ${leftUnit.totalUnits}세대 | ${rightUnit.totalUnits}세대 |
| 침실/욕실 | 침실 ${leftUnit.rooms}개 / 욕실 ${leftUnit.bathrooms}개 | 침실 ${rightUnit.rooms}개 / 욕실 ${rightUnit.bathrooms}개 |
| 조망 특화 | ${leftUnit.oceanView} | ${rightUnit.oceanView} |
| 베이(Bay) | ${leftUnit.bayCount} | ${rightUnit.bayCount} |
| 천장고 | ${leftUnit.ceilingHeight} | ${rightUnit.ceilingHeight} |
| 예상 분양가 | ${leftUnit.estimatedPrice} | ${rightUnit.estimatedPrice} |
| 예상 관리비 | ${leftUnit.maintenanceFee} | ${rightUnit.maintenanceFee} |

### 2. ${leftUnit.name} 주요 특징
${leftUnit.keyFeatures.map((f) => `- ${f}`).join('\n')}

### 3. ${rightUnit.name} 주요 특징
${rightUnit.keyFeatures.map((f) => `- ${f}`).join('\n')}

---
생성일: ${new Date().toLocaleDateString('ko-KR')}
다대포 오션시티 프레스티지 분양홍보관 (1688-7520)
`;

      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const fileName = `평면비교_${leftUnit.id}_vs_${rightUnit.id}_${new Date().toISOString().slice(0, 10)}.md`;

      await uploadFileToDrive(fileName, blob, folderId, '평면도 비교 분석 리포트');
      setDriveSaveMessage(`'${fileName}' 리포트가 Google Drive에 성공적으로 보관되었습니다.`);
      setTimeout(() => setDriveSaveMessage(null), 4000);
    } catch (err: any) {
      console.error('Drive save error:', err);
      setDriveSaveMessage(err.message || 'Google Drive 저장 실패');
    } finally {
      setIsSavingToDrive(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to check if value differs
  const isDiff = (val1: any, val2: any) => val1 !== val2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <SplitSquareVertical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                  UNIT COMPARISON SYSTEM
                </span>
                <span className="text-slate-600 text-xs hidden sm:inline">|</span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  평면도 및 세부 스펙 1:1 정밀 비교
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white font-serif">
                타입별 평면도 & 제원 맞춤 비교 분석
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSwap}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="좌우 평면 타입 맞바꾸기"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">위치 교체</span>
            </button>

            <button
              onClick={() => setOnlyDiffs(!onlyDiffs)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                onlyDiffs
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>차이점만 강조</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drive Save Notification */}
        {driveSaveMessage && (
          <div className="bg-blue-950/80 border-b border-blue-800 px-4 py-2 text-xs text-blue-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{driveSaveMessage}</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenGoogleDrive();
              }}
              className="text-xs font-bold text-blue-300 underline hover:text-white ml-2 cursor-pointer"
            >
              Drive 보관함 바로가기
            </button>
          </div>
        )}

        {/* Scrollable Main Comparison Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Unit Selectors Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            {/* Left Unit Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">비교 기준 평형 (A)</span>
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                  {leftUnit.badge}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {UNIT_PLANS.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => setLeftUnitId(unit.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      leftUnitId === unit.id
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {unit.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {leftUnit.subName}
              </p>
            </div>

            {/* Right Unit Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">비교 대상 평형 (B)</span>
                <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                  {rightUnit.badge}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {UNIT_PLANS.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => setRightUnitId(unit.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      rightUnitId === unit.id
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {unit.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {rightUnit.subName}
              </p>
            </div>
          </div>

          {/* VISUAL FLOOR PLANS SIDE-BY-SIDE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Unit Floor Plan Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-white font-serif">
                      {leftUnit.name}
                    </h4>
                    <span className="text-xs text-amber-400 font-medium">
                      {leftUnit.subName}
                    </span>
                  </div>
                  <button
                    onClick={() => setZoomImage({ src: leftUnit.floorPlanImage, title: `${leftUnit.name} 평면도 확대` })}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    title="평면도 크게 보기"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                <div 
                  className="relative rounded-xl overflow-hidden bg-white p-2 border border-slate-800 cursor-pointer shadow-inner min-h-[220px] flex items-center justify-center"
                  onClick={() => setZoomImage({ src: leftUnit.floorPlanImage, title: `${leftUnit.name} 평면도 확대` })}
                >
                  <img
                    src={leftUnit.floorPlanImage}
                    alt={`${leftUnit.name} 평면도`}
                    className="w-full h-auto object-contain max-h-[240px] group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-md">
                    클릭 시 확대
                  </div>
                </div>

                {/* Ocean View Spec Tag */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2 text-xs">
                  <Waves className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-300 font-medium truncate">{leftUnit.oceanView}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">총 공급 세대수</span>
                <span className="text-sm font-bold text-white font-mono">{leftUnit.totalUnits}세대</span>
              </div>
            </div>

            {/* Right Unit Floor Plan Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-white font-serif">
                      {rightUnit.name}
                    </h4>
                    <span className="text-xs text-cyan-400 font-medium">
                      {rightUnit.subName}
                    </span>
                  </div>
                  <button
                    onClick={() => setZoomImage({ src: rightUnit.floorPlanImage, title: `${rightUnit.name} 평면도 확대` })}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    title="평면도 크게 보기"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                <div 
                  className="relative rounded-xl overflow-hidden bg-white p-2 border border-slate-800 cursor-pointer shadow-inner min-h-[220px] flex items-center justify-center"
                  onClick={() => setZoomImage({ src: rightUnit.floorPlanImage, title: `${rightUnit.name} 평면도 확대` })}
                >
                  <img
                    src={rightUnit.floorPlanImage}
                    alt={`${rightUnit.name} 평면도`}
                    className="w-full h-auto object-contain max-h-[240px] group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-md">
                    클릭 시 확대
                  </div>
                </div>

                {/* Ocean View Spec Tag */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2 text-xs">
                  <Waves className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-300 font-medium truncate">{rightUnit.oceanView}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">총 공급 세대수</span>
                <span className="text-sm font-bold text-white font-mono">{rightUnit.totalUnits}세대</span>
              </div>
            </div>
          </div>

          {/* SIDE-BY-SIDE SPECIFICATIONS COMPARISON TABLE */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-3 sm:p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                상세 스펙 & 특화 항목 1:1 비교
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400">
                {onlyDiffs ? '※ 차이점만 표시 중' : '※ 전체 항목 표시 중 (좌우 스크롤 가능)'}
              </span>
            </div>

            <div className="overflow-x-auto scrollbar-thin">
              <div className="min-w-[480px] md:min-w-0 divide-y divide-slate-800/80 text-xs">
              {/* Category: 면적 제원 */}
              <div className="bg-slate-900/40 px-4 py-2 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                면적 및 공간 제원
              </div>

              {/* 전용면적 */}
              {(!onlyDiffs || isDiff(leftUnit.exclusiveArea, rightUnit.exclusiveArea)) && (
                <div className="grid grid-cols-12 px-4 py-2.5 hover:bg-slate-900/40 items-center">
                  <div className="col-span-4 text-slate-400 font-medium">전용면적</div>
                  <div className={`col-span-4 font-bold font-mono ${isDiff(leftUnit.exclusiveArea, rightUnit.exclusiveArea) ? 'text-amber-300' : 'text-slate-200'}`}>
                    {leftUnit.exclusiveArea}㎡ ({leftUnit.pyeong}평)
                  </div>
                  <div className={`col-span-4 font-bold font-mono ${isDiff(leftUnit.exclusiveArea, rightUnit.exclusiveArea) ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {rightUnit.exclusiveArea}㎡ ({rightUnit.pyeong}평)
                  </div>
                </div>
              )}

              {/* 공급면적 */}
              {(!onlyDiffs || isDiff(leftUnit.supplyArea, rightUnit.supplyArea)) && (
                <div className="grid grid-cols-12 px-4 py-2.5 hover:bg-slate-900/40 items-center">
                  <div className="col-span-4 text-slate-400 font-medium">공급면적</div>
                  <div className="col-span-4 text-slate-200 font-mono">{leftUnit.supplyArea}㎡</div>
                  <div className="col-span-4 text-slate-200 font-mono">{rightUnit.supplyArea}㎡</div>
                </div>
              )}

              {/* 구조 및 베이 */}
              {(!onlyDiffs || isDiff(leftUnit.bayCount, rightUnit.bayCount)) && (
                <div className="grid grid-cols-12 px-4 py-2.5 hover:bg-slate-900/40 items-center">
                  <div className="col-span-4 text-slate-400 font-medium">베이(Bay) 설계</div>
                  <div className={`col-span-4 font-bold ${isDiff(leftUnit.bayCount, rightUnit.bayCount) ? 'text-amber-300' : 'text-slate-200'}`}>
                    {leftUnit.bayCount}
                  </div>
                  <div className={`col-span-4 font-bold ${isDiff(leftUnit.bayCount, rightUnit.bayCount) ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {rightUnit.bayCount}
                  </div>
                </div>
              )}

              {/* 구조 형태 */}
              {(!onlyDiffs || isDiff(leftUnit.structure, rightUnit.structure)) && (
                <div className="grid grid-cols-12 px-4 py-2.5 hover:bg-slate-900/40 items-center">
                  <div className="col-span-4 text-slate-400 font-medium">평면 구조</div>
                  <div className="col-span-4 text-slate-200">{leftUnit.structure}</div>
                  <div className="col-span-4 text-slate-200">{rightUnit.structure}</div>
                </div>
              )}

              {/* 침실 / 욕실 */}
              {(!onlyDiffs || isDiff(leftUnit.rooms, rightUnit.rooms) || isDiff(leftUnit.bathrooms, rightUnit.bathrooms)) && (
                <div className="grid grid-cols-12 px-4 py-2.5 hover:bg-slate-900/40 items-center">
                  <div className="col-span-4 text-slate-400 font-medium">침실 / 욕실 수</div>
                  <div className="col-span-4 text-slate-200 font-bold">
                    침실 {leftUnit.rooms}실 / 욕실 {leftUnit.bathrooms}실
                  </div>
                  <div className="col-span-4 text-slate-200 font-bold">
                    침실 {rightUnit.rooms}실 / 욕실 {rightUnit.bathrooms}실
                  </div>
                </div>
              )}

              {/* Category: 조망 및 채광 */}
              <div className="bg-slate-900/40 px-4 py-2 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                조망 및 채광 특화
              </div>

              {/* 향 */}
              {(!onlyDiffs || isDiff(leftUnit.orientation, rightUnit.orientation)) && (
                <div className="grid grid-cols-12 px-4 py-2.5 hover:bg-slate-900/40 items-center">
                  <div className="col-span-4 text-slate-400 font-medium">동 배치 향</div>
                  <div className="col-span-4 text-slate-200">{leftUnit.orientation}</div>
                  <div className="col-span-4 text-slate-200">{rightUnit.orientation}</div>
                </div>
              )}

              {/* 바다 조망 특성 */}
              {(!onlyDiffs || isDiff(leftUnit.oceanView, rightUnit.oceanView)) && (
                <div className="grid grid-cols-12 px-4 py-2.5 hover:bg-slate-900/40 items-center">
                  <div className="col-span-4 text-slate-400 font-medium">오션뷰 조망권</div>
                  <div className="col-span-4 text-amber-300 font-medium">{leftUnit.oceanView}</div>
                  <div className="col-span-4 text-cyan-300 font-medium">{rightUnit.oceanView}</div>
                </div>
              )}

              {/* 천장고 */}
              {(!onlyDiffs || isDiff(leftUnit.ceilingHeight, rightUnit.ceilingHeight)) && (
                <div className="grid grid-cols-12 px-4 py-2.5 hover:bg-slate-900/40 items-center">
                  <div className="col-span-4 text-slate-400 font-medium">실내 천장고</div>
                  <div className="col-span-4 text-slate-200">{leftUnit.ceilingHeight}</div>
                  <div className="col-span-4 text-slate-200">{rightUnit.ceilingHeight}</div>
                </div>
              )}

              {/* 발코니 확장 */}
              {(!onlyDiffs || isDiff(leftUnit.balconyExpansion, rightUnit.balconyExpansion)) && (
                <div className="grid grid-cols-12 px-4 py-2.5 hover:bg-slate-900/40 items-center">
                  <div className="col-span-4 text-slate-400 font-medium">발코니 및 테라스</div>
                  <div className="col-span-4 text-slate-200">{leftUnit.balconyExpansion}</div>
                  <div className="col-span-4 text-slate-200">{rightUnit.balconyExpansion}</div>
                </div>
              )}

              {/* Category: 경제성 및 추천 */}
              <div className="bg-slate-900/40 px-4 py-2 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                예상 분양가 & 라이프스타일
              </div>

              {/* 예상 분양가 */}
              {(!onlyDiffs || isDiff(leftUnit.estimatedPrice, rightUnit.estimatedPrice)) && (
                <div className="grid grid-cols-12 px-4 py-2.5 hover:bg-slate-900/40 items-center">
                  <div className="col-span-4 text-slate-400 font-medium">예상 분양가</div>
                  <div className="col-span-4 text-amber-400 font-bold font-mono">{leftUnit.estimatedPrice}</div>
                  <div className="col-span-4 text-cyan-400 font-bold font-mono">{rightUnit.estimatedPrice}</div>
                </div>
              )}

              {/* 예상 관리비 */}
              {(!onlyDiffs || isDiff(leftUnit.maintenanceFee, rightUnit.maintenanceFee)) && (
                <div className="grid grid-cols-12 px-4 py-2.5 hover:bg-slate-900/40 items-center">
                  <div className="col-span-4 text-slate-400 font-medium">예상 기본 관리비</div>
                  <div className="col-span-4 text-slate-300">{leftUnit.maintenanceFee}</div>
                  <div className="col-span-4 text-slate-300">{rightUnit.maintenanceFee}</div>
                </div>
              )}

              {/* 추천 대상 */}
              <div className="grid grid-cols-12 px-4 py-3 hover:bg-slate-900/40 items-start">
                <div className="col-span-4 text-slate-400 font-medium">추천 고객층</div>
                <div className="col-span-4 text-slate-300 leading-relaxed pr-2">{leftUnit.recommendedFor}</div>
                <div className="col-span-4 text-slate-300 leading-relaxed">{rightUnit.recommendedFor}</div>
              </div>
            </div>
          </div>
        </div>

          {/* KEY FEATURES BULLET COMPARISON */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {leftUnit.name} 특화 설계 포인트
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {leftUnit.keyFeatures.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                {rightUnit.name} 특화 설계 포인트
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {rightUnit.keyFeatures.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSaveComparisonToDrive}
              disabled={isSavingToDrive}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-blue-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              title="비교 분석 리포트를 Google Drive에 저장"
            >
              <HardDrive className="w-4 h-4 text-blue-400" />
              <span>{isSavingToDrive ? 'Drive 저장 중...' : '비교표 Drive에 보관'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>비교표 인쇄</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onOpenInterest(leftUnit.id);
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              {leftUnit.name} 분양상담
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenInterest(rightUnit.id);
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-cyan-500/20"
            >
              {rightUnit.name} 분양상담
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Floor Plan Zoom Modal */}
      {zoomImage && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setZoomImage(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-white p-4 rounded-2xl shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200 text-slate-900 mb-2">
              <h4 className="font-bold text-base">{zoomImage.title}</h4>
              <button
                onClick={() => setZoomImage(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={zoomImage.src}
              alt={zoomImage.title}
              className="w-full h-auto max-h-[75vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
