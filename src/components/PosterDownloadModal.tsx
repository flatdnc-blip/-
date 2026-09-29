import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Sparkles, 
  Check, 
  Waves, 
  Train, 
  Building2,
  FileImage
} from 'lucide-react';
import { IMAGES, COMPLEX_INFO } from '../data/apartmentData';

interface PosterDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PosterDownloadModal: React.FC<PosterDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<'sunset' | 'day'>('sunset');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    // Render Canvas Poster
    const renderCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedTheme === 'sunset' ? IMAGES.sunsetAerial : IMAGES.dayAerial;

      img.onload = () => {
        // Set canvas dimensions
        canvas.width = 1920;
        canvas.height = 1080;

        // Draw Base Image
        ctx.drawImage(img, 0, 0, 1920, 1080);

        // Top Vignette & Header Background
        const topGrad = ctx.createLinearGradient(0, 0, 0, 240);
        topGrad.addColorStop(0, 'rgba(10, 15, 30, 0.92)');
        topGrad.addColorStop(0.7, 'rgba(10, 15, 30, 0.6)');
        topGrad.addColorStop(1, 'rgba(10, 15, 30, 0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, 1920, 240);

        // Bottom Vignette & Footer Background
        const bottomGrad = ctx.createLinearGradient(0, 880, 0, 1080);
        bottomGrad.addColorStop(0, 'rgba(10, 15, 30, 0)');
        bottomGrad.addColorStop(0.3, 'rgba(10, 15, 30, 0.7)');
        bottomGrad.addColorStop(1, 'rgba(10, 15, 30, 0.95)');
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, 880, 1920, 200);

        // TOP HEADER TEXT
        ctx.textAlign = 'left';
        ctx.fillStyle = '#f59e0b'; // Amber-500
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('BUSAN DADAEPO PRESTIGE RESIDENCE', 60, 55);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px sans-serif';
        ctx.fillText(COMPLEX_INFO.name, 60, 115);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '22px sans-serif';
        ctx.fillText('다대포 해수욕장 영구 오션뷰 × 1호선 다대포항역 도보 1분 초역세권', 60, 155);

        // KEY CALLOUT 1: Ocean View Highlight (Top Right)
        ctx.fillStyle = 'rgba(6, 182, 212, 0.9)'; // Cyan
        ctx.beginPath();
        ctx.roundRect(1280, 45, 580, 65, 12);
        ctx.fill();

        ctx.fillStyle = '#082f49';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🌊 다대포 해수욕장 180° 영구 바다조망 (도보 3분)', 1570, 87);

        // KEY CALLOUT 2: Subway Station Highlight (Bottom Right over station)
        ctx.fillStyle = 'rgba(249, 115, 22, 0.95)'; // Orange
        ctx.beginPath();
        ctx.roundRect(1250, 780, 610, 75, 12);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText('🚇 1호선 다대포항역 바로 앞 (도보 1분 50m 초역세권)', 1555, 827);

        // KEY CALLOUT 3: Amenities Highlight (Bottom Left)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(60, 780, 660, 75, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f3e8ff';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('🏢 39F 스카이라운지 · 사우나 · GDR골프 · 120m 스트리트몰', 85, 827);

        // FOOTER BAR
        ctx.fillStyle = '#94a3b8';
        ctx.font = '20px sans-serif';
        ctx.fillText('대지위치: 부산광역시 사하구 다대로 (다대포항역 앞) | 총 986세대 랜드마크', 60, 1020);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText('분양문의 1688-7520', 1860, 1020);

        setPreviewUrl(canvas.toDataURL('image/jpeg', 0.92));
      };
    };

    renderCanvas();
  }, [isOpen, selectedTheme]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsGenerating(true);
    const link = document.createElement('a');
    link.download = `다대포_오션시티_프레스티지_홍보조감도_${selectedTheme}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
    setTimeout(() => setIsGenerating(false), 800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <FileImage className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                홍보용 고화질 조감도 포스터 다운로드 및 인쇄
              </h3>
              <p className="text-xs text-slate-400">
                바다조망, 다대포항역 초역세권, 편의시설 안내 문구가 포함된 마케팅 조감도
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

        {/* Theme Switcher Bar */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">배경 테마:</span>
            <button
              onClick={() => setSelectedTheme('sunset')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer font-semibold ${
                selectedTheme === 'sunset'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              황금빛 노을 선셋 조감도
            </button>
            <button
              onClick={() => setSelectedTheme('day')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer font-semibold ${
                selectedTheme === 'day'
                  ? 'bg-sky-500 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              청명한 주간 바다조망 조감도
            </button>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            해상도: 1920 × 1080 FHD 고화질
          </span>
        </div>

        {/* Preview Area */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-950">
          <canvas ref={canvasRef} className="hidden" />

          {previewUrl ? (
            <div className="relative max-w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
              <img
                src={previewUrl}
                alt="홍보 조감도 미리보기"
                className="w-full h-auto max-h-[58vh] object-contain"
              />
            </div>
          ) : (
            <div className="py-20 text-slate-500 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              <span>고화질 홍보 조감도 렌더링 중...</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 hidden sm:block">
            ※ 분양 홍보, 전단지, 온라인 게시용 고화질 이미지로 즉시 활용 가능합니다.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>인쇄하기</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? '저장 중...' : '고화질 조감도 이미지 다운로드'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
