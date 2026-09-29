import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Building, 
  Dumbbell, 
  Bath, 
  ShoppingBag, 
  GraduationCap, 
  Flower2, 
  Check, 
  Eye, 
  ArrowRight
} from 'lucide-react';
import { AMENITY_MARKERS, IMAGES } from '../data/apartmentData';
import { AmenityMarker } from '../types';

interface AmenitiesGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMarker: (marker: AmenityMarker) => void;
}

export const AmenitiesGalleryModal: React.FC<AmenitiesGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectMarker,
}) => {
  const [filter, setFilter] = useState<'all' | 'community' | 'convenience' | 'ocean'>('all');

  if (!isOpen) return null;

  // Filter amenities
  const displayedAmenities = AMENITY_MARKERS.filter((item) => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                다대포 오션시티 프레스티지 편의시설 & 커뮤니티
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700/50">
                  하이엔드 시설 총망라
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                39층 스카이라운지부터 호텔식 사우나, 120m 원스톱 스트리트몰 상가까지 완벽한 원스톱 라이프
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

        {/* Hero Amenity Banner Showcase */}
        <div className="relative h-44 sm:h-52 bg-slate-950 overflow-hidden shrink-0">
          <img
            src={IMAGES.amenitiesShowcase}
            alt="편의시설 몽타주 렌더링"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                PREMIUM RESIDENT CLUB
              </span>
              <h4 className="text-xl sm:text-2xl font-bold text-white font-serif">
                호텔급 웰니스 & 힐링 커뮤니티 시설
              </h4>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700">
                피트니스 · GDR골프 · 사우나
              </span>
              <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700">
                스카이라운지 39F
              </span>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            전체 시설 보기 ({AMENITY_MARKERS.length})
          </button>
          <button
            onClick={() => setFilter('community')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'community'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            단지 커뮤니티 (스카이라운지/골프/사우나)
          </button>
          <button
            onClick={() => setFilter('convenience')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'convenience'
                ? 'bg-rose-500 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            생활 편의시설 & 상가 (스트리트몰/어린이집)
          </button>
          <button
            onClick={() => setFilter('ocean')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'ocean'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            해양 자연 & 공원 (해수욕장/해변공원/몰운대)
          </button>
        </div>

        {/* Amenity Cards Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedAmenities.map((amenity) => (
            <div
              key={amenity.id}
              onClick={() => {
                onClose();
                onSelectMarker(amenity);
              }}
              className="bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    amenity.category === 'transit'
                      ? 'bg-orange-950 text-orange-400 border-orange-800'
                      : amenity.category === 'ocean'
                      ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                      : amenity.category === 'community'
                      ? 'bg-purple-950 text-purple-400 border-purple-800'
                      : 'bg-rose-950 text-rose-400 border-rose-800'
                  }`}>
                    {amenity.tag}
                  </span>
                  <span className="text-[11px] font-medium text-amber-400">
                    {amenity.distance}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors mb-1.5">
                  {amenity.title}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {amenity.description}
                </p>

                {amenity.featureMetric && (
                  <div className="bg-slate-900/90 rounded-lg p-2 flex items-center justify-between text-xs mb-3 border border-slate-800">
                    <span className="text-slate-500">{amenity.featureMetric.label}</span>
                    <span className="font-bold text-slate-200">{amenity.featureMetric.value}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-amber-400 transition-colors">
                <span>조감도 위치 바로가기</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
