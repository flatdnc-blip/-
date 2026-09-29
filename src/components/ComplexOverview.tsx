import React from 'react';
import { 
  PREMIUM_FEATURES, 
  COMPLEX_INFO 
} from '../data/apartmentData';
import { 
  Waves, 
  Train, 
  Sparkles, 
  Trees, 
  Building2, 
  MapPin, 
  Car, 
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

interface ComplexOverviewProps {
  onOpenOceanSim: () => void;
  onOpenAmenities: () => void;
  onOpenInterest: () => void;
}

export const ComplexOverview: React.FC<ComplexOverviewProps> = ({
  onOpenOceanSim,
  onOpenAmenities,
  onOpenInterest,
}) => {
  return (
    <section className="mt-12 space-y-12">
      {/* 4 Key Pillars Banner */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
            THE PRESTIGE ADVANTAGE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif mt-1 break-keep">
            다대포의 가치를 바꾸는 4대 핵심 프리미엄
          </h2>
          <p className="text-sm text-slate-400 mt-2 break-keep">
            바다조망부터 초역세권, 완벽한 편의시설과 자연까지 모두 갖춘 단 하나의 랜드마크
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PREMIUM_FEATURES.map((feature) => (
            <div
              key={feature.number}
              className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-amber-500/40 group-hover:text-amber-400 font-mono transition-colors">
                    {feature.number}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 text-amber-400">
                    {feature.number === '01' && <Waves className="w-4 h-4 text-cyan-400" />}
                    {feature.number === '02' && <Train className="w-4 h-4 text-orange-400" />}
                    {feature.number === '03' && <Sparkles className="w-4 h-4 text-purple-400" />}
                    {feature.number === '04' && <Trees className="w-4 h-4 text-emerald-400" />}
                  </div>
                </div>

                <span className="text-xs font-semibold text-amber-300">
                  {feature.subtitle}
                </span>
                <h3 className="text-lg font-bold text-white mb-2 break-keep">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4 break-keep">
                  {feature.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                <span className="text-[11px] text-slate-500 break-keep">{feature.statLabel}</span>
                <span className="text-lg font-black text-white font-mono">{feature.stat}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Overview Table & Location Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl">
        {/* Left 7 Columns: Architectural Specs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">ARCHITECTURAL OVERVIEW</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-serif break-keep">
                단지 건축 개요 및 공급 스펙
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 block mb-1">사업명</span>
              <span className="font-bold text-slate-200 text-sm break-keep">{COMPLEX_INFO.name}</span>
            </div>
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 block mb-1">대지 위치</span>
              <span className="font-bold text-slate-200 break-keep">{COMPLEX_INFO.location}</span>
            </div>
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 block mb-1">건축 규모</span>
              <span className="font-bold text-slate-200 break-keep">{COMPLEX_INFO.scale}</span>
            </div>
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 block mb-1">총 세대수</span>
              <span className="font-bold text-amber-400 font-mono text-sm">{COMPLEX_INFO.units}</span>
            </div>
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 block mb-1">주차 대수</span>
              <span className="font-bold text-slate-200 break-keep">{COMPLEX_INFO.parking}</span>
            </div>
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 block mb-1">교통 접근성</span>
              <span className="font-bold text-orange-400 font-semibold break-keep">{COMPLEX_INFO.transitTime}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={onOpenOceanSim}
              className="px-4 py-2.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/60 rounded-xl text-xs font-bold text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Waves className="w-3.5 h-3.5" />
              <span>바다조망 시뮬레이터 확인</span>
            </button>
            <button
              onClick={onOpenAmenities}
              className="px-4 py-2.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-800/60 rounded-xl text-xs font-bold text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>커뮤니티 & 편의시설 갤러리</span>
            </button>
          </div>
        </div>

        {/* Right 5 Columns: VIP Tour & Counseling CTA Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 p-6 rounded-2xl border border-amber-500/30 flex flex-col justify-between shadow-xl">
          <div>
            <div className="inline-block px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-3">
              VIP PRIVATE COUNSELING
            </div>
            <h4 className="text-xl font-bold text-white font-serif mb-2 break-keep">
              분양 홍보관 VIP 사전예약 & 상담
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4 break-keep">
              다대포 해수욕장 영구 조망 로얄동·호수 및 1호선 다대포항역 초역세권 프리미엄을 가장 먼저 선점할 수 있는 VIP 사전 방문 상담을 예약하세요.
            </p>

            <ul className="space-y-2 mb-6 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="break-keep">선착순 로얄층 바다조망 세대 우선 안내</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="break-keep">분양가, 중도금 무이자 혜택 및 계약 조건 상세 상담</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="break-keep">단지 내 120m 스트리트몰 상가 특별 분양 안내</span>
              </li>
            </ul>
          </div>

          <div>
            <button
              onClick={onOpenInterest}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer text-center"
            >
              관심고객 등록 및 VIP 상담 예약
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              분양문의 대표번호 : <strong className="text-amber-400">1688-7520</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
