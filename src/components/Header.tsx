import React from 'react';
import { 
  Building2, 
  Phone, 
  Download, 
  Eye, 
  Sparkles, 
  BookmarkCheck, 
  Compass,
  TrainFront,
  Waves,
  HardDrive,
  SplitSquareVertical
} from 'lucide-react';
import { ComplexInfo } from '../types';

interface HeaderProps {
  complexInfo: ComplexInfo;
  onOpenInterest: () => void;
  onOpenDownload: () => void;
  onOpenOceanSim: () => void;
  onOpenAmenities: () => void;
  onOpenGoogleDrive: () => void;
  onOpenComparison: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  complexInfo,
  onOpenInterest,
  onOpenDownload,
  onOpenOceanSim,
  onOpenAmenities,
  onOpenGoogleDrive,
  onOpenComparison,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 border border-amber-400/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400">
                  PRESTIGE RESIDENCE
                </span>
                <span className="text-slate-600 text-xs hidden sm:inline">|</span>
                <span className="text-[11px] text-cyan-400 font-medium hidden sm:inline-flex items-center gap-1">
                  <Waves className="w-3 h-3" /> 다대포 해수욕장 앞 영구 오션뷰
                </span>
                <span className="text-slate-600 text-xs hidden md:inline">|</span>
                <span className="text-[11px] text-orange-400 font-medium hidden md:inline-flex items-center gap-1">
                  <TrainFront className="w-3 h-3" /> 1호선 다대포항역 도보 1분
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white truncate font-serif">
                {complexInfo.name}
              </h1>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Unit Comparison Button */}
            <button
              onClick={onOpenComparison}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-300 hover:text-white bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800/60 rounded-lg transition-colors cursor-pointer shadow-sm group"
              title="평면도 1:1 맞춤 비교 분석"
            >
              <SplitSquareVertical className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">평면 비교</span>
            </button>

            {/* Google Drive Integration Button */}
            <button
              onClick={onOpenGoogleDrive}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-300 hover:text-white bg-blue-950/60 hover:bg-blue-900/70 border border-blue-700/60 rounded-lg transition-colors cursor-pointer shadow-sm group"
              title="Google Drive 분양 자료 클라우드 보관함"
            >
              <HardDrive className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Drive 보관함</span>
            </button>

            <button
              onClick={onOpenOceanSim}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-lg transition-colors cursor-pointer"
              title="다대포 해수욕장 바다조망 시뮬레이터"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>바다조망 체험</span>
            </button>

            <button
              onClick={onOpenAmenities}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-300 hover:text-white bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800/60 rounded-lg transition-colors cursor-pointer"
              title="단지 내외 편의시설 & 커뮤니티"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>편의시설 안내</span>
            </button>

            <button
              onClick={onOpenDownload}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer shadow-sm"
              title="홍보용 조감도 이미지 저장 및 인쇄"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">홍보 조감도 저장</span>
            </button>

            {/* Interest Registration CTA */}
            <button
              onClick={onOpenInterest}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-lg shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <BookmarkCheck className="w-4 h-4 text-slate-950" />
              <span>관심고객 등록</span>
            </button>

            {/* Quick Hotline Call */}
            <a
              href="tel:1688-7520"
              className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-800 text-slate-300 hover:text-white group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:border-amber-500/50 group-hover:text-amber-400 transition-colors">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">분양홍보관 문의</p>
                <p className="text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors">1688-7520</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
