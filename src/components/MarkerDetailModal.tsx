import React from 'react';
import { AmenityMarker } from '../types';
import { 
  X, 
  MapPin, 
  Train, 
  Waves, 
  Building, 
  ShoppingBag, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Phone
} from 'lucide-react';

interface MarkerDetailModalProps {
  marker: AmenityMarker | null;
  onClose: () => void;
  onOpenOceanSim: () => void;
  onOpenInterest: () => void;
}

export const MarkerDetailModal: React.FC<MarkerDetailModalProps> = ({
  marker,
  onClose,
  onOpenOceanSim,
  onOpenInterest,
}) => {
  if (!marker) return null;

  const isStation = marker.id === 'dadaepo-port-station';
  const isOcean = marker.category === 'ocean';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image or gradient */}
        <div className="relative h-44 sm:h-52 bg-slate-950 overflow-hidden shrink-0">
          {marker.image ? (
            <img 
              src={marker.image} 
              alt={marker.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950/40" />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center backdrop-blur-md border border-slate-700/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Category Badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${
              marker.category === 'transit'
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                : marker.category === 'ocean'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : marker.category === 'community'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}>
              {marker.category === 'transit' ? <Train className="w-3.5 h-3.5" /> : null}
              {marker.category === 'ocean' ? <Waves className="w-3.5 h-3.5" /> : null}
              {marker.category === 'community' ? <Building className="w-3.5 h-3.5" /> : null}
              {marker.category === 'convenience' ? <ShoppingBag className="w-3.5 h-3.5" /> : null}
              {marker.tag}
            </span>
          </div>

          {/* Title on the bottom of header */}
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-serif mb-1">
              {marker.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>{marker.distance}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Key Metric Card */}
          {marker.featureMetric && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div className="text-xs text-slate-400 font-medium">
                {marker.featureMetric.label}
              </div>
              <div className="text-sm font-bold text-amber-400 font-mono">
                {marker.featureMetric.value}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              프리미엄 입지 & 시설 소개
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed">
              {marker.description}
            </p>
          </div>

          {/* Key Bullet Points */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              주요 특화 혜택
            </h4>
            <ul className="space-y-2">
              {marker.details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-slate-300 leading-normal">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${
                    marker.category === 'transit'
                      ? 'text-orange-400'
                      : marker.category === 'ocean'
                      ? 'text-cyan-400'
                      : 'text-amber-400'
                  }`} />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
          {isOcean ? (
            <button
              onClick={() => {
                onClose();
                onOpenOceanSim();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Waves className="w-4 h-4" />
              <span>바다조망 시뮬레이션 보기</span>
            </button>
          ) : isStation ? (
            <button
              onClick={() => {
                onClose();
                onOpenInterest();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-lg shadow-orange-500/20"
            >
              <Train className="w-4 h-4" />
              <span>초역세권 분양 혜택 상담 신청</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onOpenInterest();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>시설 혜택 분양 상담 문의</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
