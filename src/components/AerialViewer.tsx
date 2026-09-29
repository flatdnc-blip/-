import React, { useState, useRef } from 'react';
import { 
  AmenityMarker, 
  CategoryType, 
  ViewMode, 
  LabelMode 
} from '../types';
import { IMAGES } from '../data/apartmentData';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Waves, 
  Train, 
  Building, 
  ShoppingBag, 
  Eye, 
  Compass, 
  MapPin, 
  Sparkles, 
  Check, 
  Maximize2,
  Trees,
  Sun,
  Sunset,
  Navigation,
  ChevronRight,
  Info
} from 'lucide-react';

interface AerialViewerProps {
  markers: AmenityMarker[];
  selectedMarker: AmenityMarker | null;
  onSelectMarker: (marker: AmenityMarker) => void;
  onOpenOceanSim: () => void;
}

export const AerialViewer: React.FC<AerialViewerProps> = ({
  markers,
  selectedMarker,
  onSelectMarker,
  onOpenOceanSim,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('sunset');
  const [labelMode, setLabelMode] = useState<LabelMode>('full');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showOceanGuide, setShowOceanGuide] = useState<boolean>(true);
  const [showTransitGuide, setShowTransitGuide] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter markers by active category
  const filteredMarkers = markers.filter((m) => {
    if (activeCategory === 'all') return true;
    return m.category === activeCategory;
  });

  // Current active image based on view mode
  const currentImage = 
    viewMode === 'day' 
      ? IMAGES.dayAerial 
      : viewMode === 'penthouse'
      ? IMAGES.penthouseView
      : viewMode === 'amenities'
      ? IMAGES.amenitiesShowcase
      : IMAGES.sunsetAerial;

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.0));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 1.0));
  const handleZoomReset = () => setZoomLevel(1.0);

  // Category counts
  const categoryCounts = {
    all: markers.length,
    transit: markers.filter((m) => m.category === 'transit').length,
    ocean: markers.filter((m) => m.category === 'ocean').length,
    community: markers.filter((m) => m.category === 'community').length,
    convenience: markers.filter((m) => m.category === 'convenience').length,
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
      {/* Top Control Bar: View Switcher & Category Filters */}
      <div className="p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: View Mode Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setViewMode('sunset')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              viewMode === 'sunset'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Sunset className="w-3.5 h-3.5 text-amber-300" />
            <span>석양 오션 조감도</span>
          </button>

          <button
            onClick={() => setViewMode('day')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              viewMode === 'day'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-yellow-300" />
            <span>주간 청명 조감도</span>
          </button>

          <button
            onClick={() => setViewMode('penthouse')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              viewMode === 'penthouse'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-cyan-300" />
            <span>바다조망 실경</span>
          </button>

          <button
            onClick={() => setViewMode('amenities')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              viewMode === 'amenities'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>편의시설 모아보기</span>
          </button>
        </div>

        {/* Right: Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            전체 ({categoryCounts.all})
          </button>

          <button
            onClick={() => setActiveCategory('transit')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'transit'
                ? 'bg-orange-500 text-white font-bold shadow-sm shadow-orange-500/30'
                : 'text-slate-400 hover:text-orange-400 hover:bg-slate-800'
            }`}
          >
            <Train className="w-3 h-3 text-orange-400" />
            <span>초역세권 ({categoryCounts.transit})</span>
          </button>

          <button
            onClick={() => setActiveCategory('ocean')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'ocean'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
            }`}
          >
            <Waves className="w-3 h-3 text-cyan-400" />
            <span>바다조망·해양 ({categoryCounts.ocean})</span>
          </button>

          <button
            onClick={() => setActiveCategory('community')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'community'
                ? 'bg-purple-600 text-white font-bold shadow-sm shadow-purple-600/30'
                : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800'
            }`}
          >
            <Building className="w-3 h-3 text-purple-400" />
            <span>단지 커뮤니티 ({categoryCounts.community})</span>
          </button>

          <button
            onClick={() => setActiveCategory('convenience')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'convenience'
                ? 'bg-rose-500 text-white font-bold shadow-sm shadow-rose-500/30'
                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-3 h-3 text-rose-400" />
            <span>생활편의·상가 ({categoryCounts.convenience})</span>
          </button>
        </div>
      </div>

      {/* Main Bird's Eye View Canvas Area */}
      <div 
        ref={containerRef}
        className="relative w-full overflow-hidden select-none bg-slate-950 min-h-[460px] sm:min-h-[560px] lg:min-h-[640px] flex items-center justify-center"
      >
        <div 
          className="relative w-full h-full transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Main Rendering Image */}
          <img
            src={currentImage}
            alt="다대포 오션시티 프레스티지 아파트 전체 조감도"
            referrerPolicy="no-referrer"
            className="w-full h-auto block object-cover max-h-[85vh] mx-auto pointer-events-none"
          />

          {/* 1. OCEAN VIEW PROMINENT HIGHLIGHT LAYER (다대포 해수욕장 바다조망 강조) */}
          {(viewMode === 'sunset' || viewMode === 'day') && showOceanGuide && (
            <div className="absolute top-0 left-0 right-0 pointer-events-none z-10">
              {/* Subtle radiant glow over the sea */}
              <div className="h-28 bg-gradient-to-b from-cyan-500/20 via-sky-500/10 to-transparent pointer-events-none" />
              
              {/* Ocean View Floating Banner Indicator */}
              <div className="absolute top-3 sm:top-5 left-1/2 -translate-x-1/2 pointer-events-auto">
                <button
                  onClick={onOpenOceanSim}
                  className="flex items-center gap-2.5 px-4 py-2 bg-slate-950/85 hover:bg-slate-900 border border-cyan-400/50 hover:border-cyan-300 rounded-full text-white shadow-xl shadow-cyan-950/40 backdrop-blur-md transition-all cursor-pointer group"
                >
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                  <Waves className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm font-bold tracking-tight text-cyan-200">
                    다대포 해수욕장 180° 파노라마 영구 바다조망 (도보 3분)
                  </span>
                  <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 border border-cyan-700/60">
                    전 세대 88% 조망 특화
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Ocean View Guide Curvature / Lines Overlay */}
              <svg className="absolute top-0 left-0 w-full h-40 pointer-events-none opacity-40">
                <defs>
                  <linearGradient id="oceanGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <line x1="10%" y1="35%" x2="90%" y2="35%" stroke="url(#oceanGlow)" strokeWidth="1.5" strokeDasharray="6 4" />
                <path d="M 5% 45% Q 50% 30% 95% 45%" fill="none" stroke="url(#oceanGlow)" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
            </div>
          )}

          {/* 2. SUBWAY TRANSIT PROMINENT HIGHLIGHT LAYER (다대포항역 초역세권 접근성 강조) */}
          {(viewMode === 'sunset' || viewMode === 'day') && showTransitGuide && (
            <div className="absolute inset-0 pointer-events-none z-15">
              {/* Walking Route Neon Connector between Subway Station (X: 75.5, Y: 72.8) and Main Complex Gate (X: 46, Y: 81) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <linearGradient id="transitRouteGlow" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#eab308" stopOpacity="0.8" />
                  </linearGradient>
                  <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {/* Curved walking path with animated dash */}
                <path
                  d="M 75.5% 72.8% Q 62% 76% 46% 81%"
                  fill="none"
                  stroke="url(#transitRouteGlow)"
                  strokeWidth="3.5"
                  strokeDasharray="8 6"
                  className="animate-pulse"
                  filter="url(#glowEffect)"
                />
              </svg>

              {/* Transit Walking Badge in between */}
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{ left: '61%', top: '78%' }}
              >
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/90 border border-orange-500/80 rounded-full shadow-lg shadow-orange-950/50 backdrop-blur-md">
                  <Navigation className="w-3 h-3 text-orange-400 rotate-45" />
                  <span className="text-[11px] font-bold text-orange-300 whitespace-nowrap">
                    도보 1분 (약 50m 초밀착 역세권)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3. INTERACTIVE PINS & LABELS OVERLAY */}
          {(viewMode === 'sunset' || viewMode === 'day') && labelMode !== 'minimal' && (
            <div className="absolute inset-0 pointer-events-none z-20">
              {filteredMarkers.map((marker) => {
                const isSelected = selectedMarker?.id === marker.id;
                const isStation = marker.id === 'dadaepo-port-station';
                const isBeach = marker.id === 'dadaepo-beach';

                return (
                  <div
                    key={marker.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-transform duration-200"
                    style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                  >
                    {/* Pulsing Beacon Circle */}
                    <div className="relative group cursor-pointer" onClick={() => onSelectMarker(marker)}>
                      {/* Radar ripples for key highlights */}
                      {(marker.highlight || isStation || isBeach) && (
                        <div 
                          className={`absolute -inset-3 rounded-full opacity-70 animate-radar-ripple pointer-events-none ${
                            isStation 
                              ? 'bg-orange-500' 
                              : isBeach 
                              ? 'bg-cyan-400' 
                              : 'bg-amber-400'
                          }`}
                        />
                      )}

                      {/* Main Pin Button */}
                      <button
                        className={`relative flex items-center justify-center rounded-full shadow-xl transition-all duration-300 ${
                          isSelected
                            ? 'scale-125 ring-4 ring-white ring-offset-2 ring-offset-slate-950 z-30'
                            : 'hover:scale-115'
                        } ${
                          marker.category === 'transit'
                            ? 'w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-orange-500/40'
                            : marker.category === 'ocean'
                            ? 'w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 shadow-cyan-500/40'
                            : marker.category === 'community'
                            ? 'w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-700 text-white shadow-purple-500/40'
                            : 'w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/40'
                        } border-2 border-white`}
                        title={marker.title}
                        aria-label={marker.title}
                      >
                        {marker.category === 'transit' ? (
                          <Train className="w-5 h-5 text-white" />
                        ) : marker.category === 'ocean' ? (
                          <Waves className="w-5 h-5 text-slate-950" />
                        ) : marker.category === 'community' ? (
                          <Building className="w-4 h-4 text-white" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-white" />
                        )}
                      </button>

                      {/* Expanded Badge Callout (Full Mode) */}
                      {labelMode === 'full' && (
                        <div
                          className={`absolute left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap z-25 transition-all duration-200 pointer-events-none ${
                            isSelected ? 'scale-105' : 'group-hover:scale-105'
                          }`}
                        >
                          <div
                            className={`flex flex-col items-center px-2.5 py-1 rounded-lg shadow-2xl backdrop-blur-md border ${
                              isStation
                                ? 'bg-orange-950/90 border-orange-500 text-orange-100 shadow-orange-950/80 ring-2 ring-orange-500/40'
                                : isBeach
                                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-100 shadow-cyan-950/80 ring-2 ring-cyan-400/40'
                                : 'bg-slate-950/90 border-slate-700 text-slate-100 shadow-black/80'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold tracking-tight">
                                {marker.title}
                              </span>
                              {marker.distance && (
                                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                  isStation
                                    ? 'bg-orange-500 text-white'
                                    : isBeach
                                    ? 'bg-cyan-500 text-slate-950'
                                    : 'bg-slate-800 text-slate-300'
                                }`}>
                                  {marker.distance}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {marker.tag}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* View Mode Description Banner (When Penthouse or Amenities view is active) */}
        {viewMode === 'penthouse' && (
          <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-auto max-w-md bg-slate-950/90 backdrop-blur-md border border-cyan-500/60 p-4 rounded-xl text-white shadow-2xl z-30">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wider uppercase">고층 세대 바다조망 시뮬레이션</span>
            </div>
            <h4 className="text-base font-bold text-white mb-1">
              다대포 해수욕장 영구 오션뷰 파노라마 실경
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              거실과 와이드 발코니에서 매일 펼쳐지는 붉은 노을과 수평선의 파노라마! 전 세대 약 88% 조망 특화 설계로 가치 높은 영구 바다조망을 누립니다.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('sunset')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                조감도로 돌아가기
              </button>
              <button
                onClick={onOpenOceanSim}
                className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                층별 조망 시뮬레이터 열기
              </button>
            </div>
          </div>
        )}

        {viewMode === 'amenities' && (
          <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-auto max-w-md bg-slate-950/90 backdrop-blur-md border border-purple-500/60 p-4 rounded-xl text-white shadow-2xl z-30">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wider uppercase">하이엔드 편의시설 & 커뮤니티</span>
            </div>
            <h4 className="text-base font-bold text-white mb-1">
              호텔급 스카이라운지 · 사우나 · 피트니스 · GDR골프
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              39층 오션뷰 스카이라운지부터 120m 원스톱 스트리트몰 상가, 최신 GDR 실내 골프클럽과 핀란드식 사우나까지 삶의 품격을 높이는 명품 시설입니다.
            </p>
            <button
              onClick={() => setViewMode('sunset')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              조감도로 돌아가기
            </button>
          </div>
        )}

        {/* Floating Zoom & Layer Controls (Bottom-Right) */}
        <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="조감도 확대 (Zoom In)"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-medium text-slate-400 w-9 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="조감도 축소 (Zoom Out)"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="원래 크기 (Reset)"
              aria-label="Reset zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-5 bg-slate-800" />

          {/* Label Display Mode Switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLabelMode((prev) => (prev === 'full' ? 'compact' : prev === 'compact' ? 'minimal' : 'full'))}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                labelMode === 'full'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="핀 뱃지 표시 전환 (상세 / 핀만 / 숨김)"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">
                {labelMode === 'full' ? '상세 라벨' : labelMode === 'compact' ? '핀만 표시' : '라벨 숨김'}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Toggles (Bottom-Left: Ocean & Transit Highlights) */}
        <div className="absolute bottom-4 left-4 z-30 hidden sm:flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 shadow-xl">
          <label className="flex items-center gap-1.5 text-xs text-cyan-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showOceanGuide}
              onChange={(e) => setShowOceanGuide(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>바다조망 가이드</span>
          </label>
          <div className="w-px h-3.5 bg-slate-800" />
          <label className="flex items-center gap-1.5 text-xs text-orange-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showTransitGuide}
              onChange={(e) => setShowTransitGuide(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-orange-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>다대포항역 동선</span>
          </label>
        </div>
      </div>

      {/* Bottom Info Status Strip */}
      <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            조감도 상의 <strong className="text-white">핀 마커를 클릭</strong>하시면 다대포항역 초역세권, 바다조망 및 편의시설 상세 정보를 확인하실 수 있습니다.
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> 초역세권 교통
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> 바다조망·해양
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> 단지 커뮤니티
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> 생활편의·상가
          </span>
        </div>
      </div>
    </div>
  );
};
