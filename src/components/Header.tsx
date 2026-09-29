import React, { useState } from 'react';
import { 
  Building2, 
  Phone, 
  Download, 
  Eye, 
  Sparkles, 
  BookmarkCheck, 
  TrainFront,
  Waves,
  HardDrive,
  SplitSquareVertical,
  Menu,
  X,
  ChevronRight,
  Users,
  Film
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
  onOpenAdminDashboard: () => void;
  onScrollToVideo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  complexInfo,
  onOpenInterest,
  onOpenDownload,
  onOpenOceanSim,
  onOpenAmenities,
  onOpenGoogleDrive,
  onOpenComparison,
  onOpenAdminDashboard,
  onScrollToVideo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAction = (callback: () => void) => {
    callback();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-3 overflow-hidden">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 border border-amber-400/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px]">
                <span className="font-semibold tracking-widest uppercase text-amber-400">
                  PRESTIGE
                </span>
                <span className="text-slate-600 text-xs hidden md:inline">|</span>
                <span className="text-cyan-400 font-medium hidden md:inline-flex items-center gap-1 whitespace-nowrap">
                  <Waves className="w-3 h-3 shrink-0" /> 오션뷰 3분
                </span>
                <span className="text-slate-600 text-xs hidden xl:inline">|</span>
                <span className="text-orange-400 font-medium hidden xl:inline-flex items-center gap-1 whitespace-nowrap">
                  <TrainFront className="w-3 h-3 shrink-0" /> 다대포항역 1분
                </span>
              </div>
              <h1 className="text-sm sm:text-base lg:text-lg xl:text-xl font-black tracking-tight text-white font-serif truncate whitespace-nowrap break-keep">
                <span className="sm:hidden">다대포 오션시티</span>
                <span className="hidden sm:inline xl:hidden">다대포 오션시티</span>
                <span className="hidden xl:inline">{complexInfo.name}</span>
              </h1>
            </div>
          </div>

          {/* Desktop & Tablet Navigation (>= lg) */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 shrink-0">
            {/* Promotional Video Button */}
            <button
              onClick={onScrollToVideo}
              className="flex items-center gap-1.5 px-2.5 py-1.5 xl:px-3 xl:py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 rounded-lg transition-colors cursor-pointer shadow-sm group whitespace-nowrap"
              title="다대포 오션시티 프레스티지 브랜드 홍보영상"
            >
              <Film className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform shrink-0" />
              <span>홍보영상</span>
            </button>

            {/* Unit Comparison Button */}
            <button
              onClick={onOpenComparison}
              className="flex items-center gap-1.5 px-2.5 py-1.5 xl:px-3 xl:py-2 text-xs font-semibold text-amber-300 hover:text-white bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800/60 rounded-lg transition-colors cursor-pointer shadow-sm group whitespace-nowrap"
              title="평면도 1:1 맞춤 비교 분석"
            >
              <SplitSquareVertical className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
              <span>평면 비교</span>
            </button>

            {/* Admin Lead Management Database Button */}
            <button
              onClick={onOpenAdminDashboard}
              className="flex items-center gap-1.5 px-2.5 py-1.5 xl:px-3 xl:py-2 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-700/60 rounded-lg transition-colors cursor-pointer shadow-sm group whitespace-nowrap"
              title="VIP 관심고객 접수 실시간 DB 관리자 대시보드"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
              <span>고객 DB</span>
            </button>

            {/* Google Drive Integration Button (Shown on xl) */}
            <button
              onClick={onOpenGoogleDrive}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-blue-300 hover:text-white bg-blue-950/60 hover:bg-blue-900/70 border border-blue-700/60 rounded-lg transition-colors cursor-pointer shadow-sm group whitespace-nowrap"
              title="Google Drive 분양 자료 클라우드 보관함"
            >
              <HardDrive className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
              <span>Drive</span>
            </button>

            {/* Ocean Simulator (Shown on xl) */}
            <button
              onClick={onOpenOceanSim}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title="다대포 해수욕장 바다조망 시뮬레이터"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>바다조망</span>
            </button>

            {/* Amenities (Shown on 2xl) */}
            <button
              onClick={onOpenAmenities}
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-purple-300 hover:text-white bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/60 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title="단지 내외 편의시설 & 커뮤니티"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>편의시설</span>
            </button>

            {/* Poster Download Button (Shown on 2xl) */}
            <button
              onClick={onOpenDownload}
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer shadow-sm whitespace-nowrap"
              title="홍보용 조감도 이미지 저장 및 인쇄"
            >
              <Download className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>조감도 저장</span>
            </button>

            {/* Interest Registration CTA */}
            <button
              onClick={onOpenInterest}
              className="flex items-center gap-1.5 px-3 py-1.5 xl:px-4 xl:py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-lg shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span>방문예약</span>
            </button>

            {/* Quick Hotline Call */}
            <a
              href="tel:1688-7520"
              className="hidden xl:flex items-center gap-2 pl-2.5 border-l border-slate-800 text-slate-300 hover:text-white group shrink-0"
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:border-amber-500/50 group-hover:text-amber-400 transition-colors">
                <Phone className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">분양홍보관</p>
                <p className="text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors">1688-7520</p>
              </div>
            </a>
          </div>

          {/* Mobile & Tablet Compact Action Controls (< lg) */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            {/* Direct Primary CTA on mobile */}
            <button
              onClick={onOpenInterest}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-lg shadow-sm cursor-pointer"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>상담예약</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="메뉴 열기/닫기"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Slide-Down Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800/90 bg-slate-950/98 backdrop-blur-xl px-4 py-3 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 pb-2">
            <button
              onClick={() => handleAction(onScrollToVideo)}
              className="flex items-center justify-between p-2.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 rounded-xl text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-rose-200">공식 홍보영상</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
            </button>

            <button
              onClick={() => handleAction(onOpenComparison)}
              className="flex items-center justify-between p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 rounded-xl text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <SplitSquareVertical className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">평면 1:1 비교</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => handleAction(onOpenAdminDashboard)}
              className="flex items-center justify-between p-2.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-600/40 rounded-xl text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">고객 DB 관리</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            <button
              onClick={() => handleAction(onOpenOceanSim)}
              className="flex items-center justify-between p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 rounded-xl text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">바다조망 체험</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => handleAction(onOpenAmenities)}
              className="flex items-center justify-between p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-purple-500/30 rounded-xl text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">편의시설 안내</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => handleAction(onOpenGoogleDrive)}
              className="flex items-center justify-between p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-blue-500/30 rounded-xl text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white">Drive 보관함</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => handleAction(onOpenDownload)}
              className="flex items-center justify-between p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-slate-300" />
                <span className="text-xs font-bold text-slate-200">조감도 저장</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <a
              href="tel:1688-7520"
              className="flex items-center justify-between p-2.5 bg-amber-950/40 hover:bg-amber-950/60 border border-amber-600/40 rounded-xl text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">1688-7520 전화</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
