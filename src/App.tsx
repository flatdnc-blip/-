/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { AerialViewer } from './components/AerialViewer';
import { MarkerDetailModal } from './components/MarkerDetailModal';
import { OceanViewModal } from './components/OceanViewModal';
import { AmenitiesGalleryModal } from './components/AmenitiesGalleryModal';
import { ComplexOverview } from './components/ComplexOverview';
import { InterestRegistrationModal } from './components/InterestRegistrationModal';
import { PosterDownloadModal } from './components/PosterDownloadModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { UnitComparisonModal } from './components/UnitComparisonModal';
import { UnitComparisonSection } from './components/UnitComparisonSection';
import { 
  AMENITY_MARKERS, 
  COMPLEX_INFO 
} from './data/apartmentData';
import { AmenityMarker } from './types';
import { 
  Waves, 
  Train, 
  Sparkles, 
  Compass, 
  MapPin, 
  Phone, 
  Eye, 
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Share2
} from 'lucide-react';

export default function App() {
  const [selectedMarker, setSelectedMarker] = useState<AmenityMarker | null>(null);
  const [isOceanSimOpen, setIsOceanSimOpen] = useState(false);
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);
  const [isInterestOpen, setIsInterestOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [targetUnitForInterest, setTargetUnitForInterest] = useState<string | undefined>(undefined);

  // Quick select helper for ocean view marker
  const handleOpenOceanFromHero = () => {
    const oceanMarker = AMENITY_MARKERS.find((m) => m.id === 'dadaepo-beach');
    if (oceanMarker) setSelectedMarker(oceanMarker);
    setIsOceanSimOpen(true);
  };

  // Quick select helper for station marker
  const handleSelectStation = () => {
    const station = AMENITY_MARKERS.find((m) => m.id === 'dadaepo-port-station');
    if (station) setSelectedMarker(station);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Sticky Premium Header */}
      <Header
        complexInfo={COMPLEX_INFO}
        onOpenInterest={() => {
          setTargetUnitForInterest(undefined);
          setIsInterestOpen(true);
        }}
        onOpenDownload={() => setIsDownloadOpen(true)}
        onOpenOceanSim={() => setIsOceanSimOpen(true)}
        onOpenAmenities={() => setIsAmenitiesOpen(true)}
        onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
        onOpenComparison={() => setIsComparisonOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Hero Title & Value Proposition Banner */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-slate-800/80">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wider">
                부산 서남부 프리미엄 랜드마크
              </span>
              <span className="text-slate-500 hidden sm:inline">|</span>
              <span className="text-cyan-300 font-semibold flex items-center gap-1">
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                다대포 해수욕장 영구 바다조망 (도보 3분)
              </span>
              <span className="text-slate-500 hidden sm:inline">|</span>
              <span className="text-orange-300 font-semibold flex items-center gap-1">
                <Train className="w-3.5 h-3.5 text-orange-400" />
                1호선 다대포항역 도보 1분 50m 초역세권
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-serif">
              {COMPLEX_INFO.name}
              <span className="block text-lg sm:text-xl font-normal text-slate-300 font-sans mt-1">
                {COMPLEX_INFO.subTitle}
              </span>
            </h2>
          </div>

          {/* Quick Stat Highlights on the Right */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              onClick={handleOpenOceanFromHero}
              className="flex-1 sm:flex-initial p-3 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold mb-0.5">
                <Waves className="w-3.5 h-3.5" />
                <span>바다조망</span>
              </div>
              <p className="text-base sm:text-lg font-black text-white font-mono">
                전 세대 88%
              </p>
              <p className="text-[11px] text-slate-400">180° 영구 파노라마</p>
            </button>

            <button
              onClick={handleSelectStation}
              className="flex-1 sm:flex-initial p-3 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-orange-500/30 hover:border-orange-400 transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center gap-1.5 text-orange-400 text-xs font-bold mb-0.5">
                <Train className="w-3.5 h-3.5" />
                <span>다대포항역</span>
              </div>
              <p className="text-base sm:text-lg font-black text-white font-mono">
                도보 1분 50m
              </p>
              <p className="text-[11px] text-slate-400">1호선 초역세권 직결</p>
            </button>

            <button
              onClick={() => setIsAmenitiesOpen(true)}
              className="flex-1 sm:flex-initial p-3 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>편의시설</span>
              </div>
              <p className="text-base sm:text-lg font-black text-white font-mono">
                39F 라운지
              </p>
              <p className="text-[11px] text-slate-400">120m 스트리트몰</p>
            </button>
          </div>
        </div>

        {/* PRIMARY INTERACTIVE AERIAL VIEWER COMPONENT */}
        <section aria-label="아파트 전체 조감도">
          <AerialViewer
            markers={AMENITY_MARKERS}
            selectedMarker={selectedMarker}
            onSelectMarker={(m) => setSelectedMarker(m)}
            onOpenOceanSim={() => setIsOceanSimOpen(true)}
          />
        </section>

        {/* UNIT COMPARISON & FLOOR PLAN SHOWCASE SECTION */}
        <UnitComparisonSection
          onOpenComparison={() => setIsComparisonOpen(true)}
          onOpenInterest={(unitId) => {
            setTargetUnitForInterest(unitId);
            setIsInterestOpen(true);
          }}
        />

        {/* 4 CORE VALUE PILLARS & PROJECT OVERVIEW SECTION */}
        <ComplexOverview
          onOpenOceanSim={() => setIsOceanSimOpen(true)}
          onOpenAmenities={() => setIsAmenitiesOpen(true)}
          onOpenInterest={() => setIsInterestOpen(true)}
        />
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-slate-950 border-t border-slate-900 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-400 text-sm">{COMPLEX_INFO.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                사업지: {COMPLEX_INFO.location} | 시행사: {COMPLEX_INFO.developer} | 시공사: {COMPLEX_INFO.construction}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <button
                onClick={() => setIsInterestOpen(true)}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                관심고객 등록
              </button>
              <span>·</span>
              <button
                onClick={() => setIsOceanSimOpen(true)}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                바다조망 시뮬레이터
              </button>
              <span>·</span>
              <button
                onClick={() => setIsAmenitiesOpen(true)}
                className="text-purple-400 hover:underline cursor-pointer"
              >
                편의시설 안내
              </button>
              <span>·</span>
              <button
                onClick={() => setIsComparisonOpen(true)}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                평면 비교
              </button>
              <span>·</span>
              <button
                onClick={() => setIsGoogleDriveOpen(true)}
                className="text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                Drive 보관함
              </button>
              <span>·</span>
              <button
                onClick={() => setIsDownloadOpen(true)}
                className="text-slate-400 hover:underline cursor-pointer"
              >
                홍보 조감도 저장
              </button>
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-400 border-t border-slate-900 pt-4">
            ※ 본 조감도 및 CG 일러스트, 이미지 컷은 소비자의 이해를 돕기 위해 촬영 및 제작된 것으로 실제 시공 시 다소 변경될 수 있습니다. 
            바다조망권은 동·호수 및 층수에 따라 차이가 있으며 사업계획 승인 및 인허가 과정에서 세부 사항이 변동될 수 있으니 계약 전 반드시 견본주택 및 분양 홍보관을 방문하여 확인하시기 바랍니다.
          </p>
          <p className="text-[11px] text-slate-400">
            © 2026 {COMPLEX_INFO.name}. All rights reserved. 분양홍보관 대표번호: 1688-7520
          </p>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Marker Detail Modal */}
      <MarkerDetailModal
        marker={selectedMarker}
        onClose={() => setSelectedMarker(null)}
        onOpenOceanSim={() => {
          setSelectedMarker(null);
          setIsOceanSimOpen(true);
        }}
        onOpenInterest={() => {
          setSelectedMarker(null);
          setIsInterestOpen(true);
        }}
      />

      {/* 2. Ocean View Dedicated Simulator Modal */}
      <OceanViewModal
        isOpen={isOceanSimOpen}
        onClose={() => setIsOceanSimOpen(false)}
        onOpenInterest={() => {
          setIsOceanSimOpen(false);
          setIsInterestOpen(true);
        }}
      />

      {/* 3. Amenities Showcase Gallery Modal */}
      <AmenitiesGalleryModal
        isOpen={isAmenitiesOpen}
        onClose={() => setIsAmenitiesOpen(false)}
        onSelectMarker={(m) => {
          setIsAmenitiesOpen(false);
          setSelectedMarker(m);
        }}
      />

      {/* 4. Interest Registration / VIP Tour Reservation Modal */}
      <InterestRegistrationModal
        isOpen={isInterestOpen}
        onClose={() => {
          setIsInterestOpen(false);
          setTargetUnitForInterest(undefined);
        }}
        initialUnitType={targetUnitForInterest}
      />

      {/* 5. High-Resolution Poster Download / Print Modal */}
      <PosterDownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        onOpenGoogleDrive={() => {
          setIsDownloadOpen(false);
          setIsGoogleDriveOpen(true);
        }}
      />

      {/* 6. Google Drive Cloud Storage & File Manager Modal */}
      <GoogleDriveModal
        isOpen={isGoogleDriveOpen}
        onClose={() => setIsGoogleDriveOpen(false)}
      />

      {/* 7. Unit Side-by-Side Comparison Modal */}
      <UnitComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        onOpenInterest={(uId) => {
          setIsComparisonOpen(false);
          setTargetUnitForInterest(uId);
          setIsInterestOpen(true);
        }}
        onOpenGoogleDrive={() => {
          setIsComparisonOpen(false);
          setIsGoogleDriveOpen(true);
        }}
      />
    </div>
  );
}
