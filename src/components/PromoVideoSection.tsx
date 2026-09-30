import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Upload, 
  Link as LinkIcon, 
  Sparkles, 
  Waves, 
  Train, 
  CheckCircle2, 
  HardDrive, 
  Film, 
  RefreshCw,
  X,
  FolderOpen,
  Share2,
  AlertCircle
} from 'lucide-react';
import { IMAGES } from '../data/apartmentData';
import { 
  DEFAULT_PROMO_CONFIG, 
  SitePromoVideoConfig, 
  extractGoogleDriveFileId, 
  toGoogleDriveEmbedUrl 
} from '../config/videoConfig';
import { 
  fetchSharedPromoVideoConfig, 
  saveSharedPromoVideoConfig, 
  subscribePromoVideoConfig,
  getLocalPromoVideoConfig 
} from '../services/siteConfigService';
import { 
  uploadFileToDrive, 
  getOrCreateApartmentFolder, 
  listDriveFiles,
  DriveFileItem 
} from '../services/googleDriveService';

interface PromoVideoSectionProps {
  onOpenInterest: () => void;
  onOpenGoogleDrive?: () => void;
}

export const PromoVideoSection: React.FC<PromoVideoSectionProps> = ({
  onOpenInterest,
  onOpenGoogleDrive,
}) => {
  const [config, setConfig] = useState<SitePromoVideoConfig>(() => getLocalPromoVideoConfig());
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [activeScene, setActiveScene] = useState<number>(0);
  const [showDriveModal, setShowDriveModal] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [driveVideos, setDriveVideos] = useState<DriveFileItem[]>([]);
  const [isSearchingDrive, setIsSearchingDrive] = useState<boolean>(false);
  const [videoLoadError, setVideoLoadError] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch & Subscribe to shared promo video configuration from Firestore
  useEffect(() => {
    // Initial fetch from Firestore
    fetchSharedPromoVideoConfig().then((latest) => {
      setConfig(latest);
    });

    // Realtime subscription
    const unsubscribe = subscribePromoVideoConfig((updated) => {
      setConfig(updated);
      setVideoLoadError(false);
    });

    return () => unsubscribe();
  }, []);

  // When config changes, update HTML5 video element if applicable
  useEffect(() => {
    if (!config.isGoogleDrive && videoRef.current) {
      videoRef.current.src = config.videoUrl;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [config.videoUrl, config.isGoogleDrive]);

  // Storyboard highlights matching the luxury complex
  const scenes = [
    {
      id: 0,
      title: '01. 다대포항역 1분 초역세권 & 오션 테라스',
      desc: '1호선 다대포항역 도보 1분 (약 50m) 출퇴근 특권과 바다를 굽어보는 하이엔드 테라스',
      icon: Train,
      tag: '초역세권',
      color: 'from-orange-500 to-amber-600',
      timeText: '00:00 - 00:09',
      narration: '"다대포항역 도보 1분 초역세권의 빠른 교통, 일상의 여유를 엽니다."'
    },
    {
      id: 1,
      title: '02. 눈부신 영구 오션뷰 & 인피니티 풀',
      desc: '단지 내 오션뷰 인피니티 풀과 거실 발아래 펼쳐지는 180° 파노라마 수평선',
      icon: Waves,
      tag: '바다조망',
      color: 'from-cyan-500 to-blue-600',
      timeText: '00:10 - 00:19',
      narration: '"발아래 펼쳐지는 눈부신 바다, 다대포의 독보적인 오션 프리미엄"'
    },
    {
      id: 2,
      title: '03. 명품 스카이라운지 & 프리미엄 커뮤니티',
      desc: '39층 스카이라운지, 스크린 골프 클럽, 카페테리아와 120m 스트리트몰 원스톱 라이프',
      icon: Sparkles,
      tag: '하이엔드 시설',
      color: 'from-purple-500 to-indigo-600',
      timeText: '00:20 - 00:29',
      narration: '"일상의 품격을 완성하는 호텔급 커뮤니티와 프리미엄 라이프스타일"'
    }
  ];

  // Save and apply Google Drive URL or custom link to Firestore & local storage
  const handleApplyUrl = async (urlToApply?: string) => {
    const target = (urlToApply || inputUrl).trim();
    if (!target) return;

    setIsSaving(true);
    try {
      const updated = await saveSharedPromoVideoConfig(target);
      setConfig(updated);
      setVideoLoadError(false);
      setShowDriveModal(false);
      setInputUrl('');
      setStatusMessage('홍보영상이 성공적으로 연동되었습니다! 깃허브 및 모든 접속자에게 동일하게 재생됩니다.');
      setTimeout(() => setStatusMessage(null), 5000);
      setIsPlaying(true);
    } catch (err: any) {
      console.error('Save video config failed:', err);
      setStatusMessage('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default pre-packaged video
  const handleResetToDefault = async () => {
    setIsSaving(true);
    try {
      const updated = await saveSharedPromoVideoConfig(
        DEFAULT_PROMO_CONFIG.videoUrl,
        DEFAULT_PROMO_CONFIG.videoTitle
      );
      setConfig(updated);
      setVideoLoadError(false);
      setShowDriveModal(false);
      setIsPlaying(true);
      setStatusMessage('기본 내장 고화질 홍보영상으로 복원되었습니다.');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle local video file upload (Plays locally & offers 1-click cloud sync)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setConfig({
        videoUrl: localUrl,
        videoTitle: file.name,
        isGoogleDrive: false,
      });
      setIsPlaying(true);
      setShowDriveModal(false);
      if (videoRef.current) {
        videoRef.current.src = localUrl;
        videoRef.current.play().catch(() => {});
      }

      // Prompt cloud synchronization
      setStatusMessage(`'${file.name}' 영상이 브라우저에서 재생 중입니다. 깃허브 배포 시 모든 방문자에게 공유하려면 [구글 드라이브 영상 연동]을 통해 드라이브 링크를 등록해 주세요.`);
      setTimeout(() => setStatusMessage(null), 7000);
    }
  };

  // Search user's Google Drive for uploaded video files
  const handleSearchDriveVideos = async () => {
    setIsSearchingDrive(true);
    setStatusMessage(null);
    try {
      let folderId: string | undefined;
      try {
        folderId = await getOrCreateApartmentFolder();
      } catch (e) {
        // Fallback
      }

      const files = await listDriveFiles(folderId);
      const videos = files.filter(
        (f) => f.mimeType.startsWith('video/') || f.name.endsWith('.mp4') || f.name.endsWith('.mov') || f.name.endsWith('.webm')
      );
      setDriveVideos(videos);

      if (videos.length === 0) {
        setStatusMessage('구글 드라이브 폴더에서 검색된 동영상이 없습니다. 상단 입력창에 공유 링크를 직접 붙여넣으실 수 있습니다.');
      } else {
        setStatusMessage(`구글 드라이브에서 ${videos.length}개의 동영상을 찾았습니다. 아래 목록에서 선택하세요.`);
      }
    } catch (err: any) {
      console.warn('Drive search error:', err);
      setStatusMessage('구글 드라이브 권한이 필요합니다. 상단에 구글 드라이브 공유 링크를 직접 붙여넣어 주세요.');
    } finally {
      setIsSearchingDrive(false);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullScreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const driveEmbedUrl = config.isGoogleDrive && config.driveFileId
    ? `https://drive.google.com/file/d/${config.driveFileId}/preview`
    : extractGoogleDriveFileId(config.videoUrl)
    ? toGoogleDriveEmbedUrl(config.videoUrl)
    : null;

  return (
    <section className="space-y-4">
      {/* Hidden File Input for Local Video Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        className="hidden"
      />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              OFFICIAL BRAND MOVIE
            </span>
            <span className="text-slate-600 text-xs hidden sm:inline">|</span>
            <span className="text-xs text-cyan-300 font-medium hidden sm:inline-flex items-center gap-1">
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              다대포항역 1분 초역세권 & 바다조망
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-serif break-keep">
            다대포 오션시티 프레스티지 공식 홍보영상
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 break-keep">
            도보 1분 다대포항역의 쾌속 교통과 눈부신 오션뷰 파노라마를 고화질 영상으로 감상하세요.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setShowDriveModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            title="구글 드라이브 홍보영상 공유 링크 등록 & 연동"
          >
            <HardDrive className="w-4 h-4 text-white" />
            <span>구글 드라이브 영상 연동</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
            title="PC에 보관된 동영상 파일 직접 재생"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>파일 올리기</span>
          </button>

          {(config.isGoogleDrive || config.videoUrl !== DEFAULT_PROMO_CONFIG.videoUrl) && (
            <button
              onClick={handleResetToDefault}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer border border-slate-800"
              title="기본 탑재 홍보영상으로 초기화"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>기본 영상</span>
            </button>
          )}
        </div>
      </div>

      {/* Realtime Status Notice */}
      {statusMessage && (
        <div className="bg-blue-950/90 border border-blue-700 p-3 rounded-xl text-xs text-blue-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="break-keep">{statusMessage}</span>
          </div>
          {onOpenGoogleDrive && (
            <button
              onClick={onOpenGoogleDrive}
              className="text-xs font-bold text-blue-300 underline hover:text-white ml-2 cursor-pointer shrink-0"
            >
              Drive 보관함
            </button>
          )}
        </div>
      )}

      {/* Main Video Theater Player (16:9 Aspect Ratio) */}
      <div className="relative w-full aspect-video max-h-[580px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group flex items-center justify-center">
        {driveEmbedUrl ? (
          /* 1. Google Drive Native Video Embed Preview Player */
          <div className="relative w-full h-full bg-slate-950">
            <iframe
              src={driveEmbedUrl}
              className="w-full h-full border-0 rounded-3xl"
              allow="autoplay; fullscreen"
              title="다대포 오션시티 공식 홍보영상"
            />
          </div>
        ) : (
          /* 2. Bundled High-Performance HTML5 Video Player */
          <video
            ref={videoRef}
            src={config.videoUrl}
            autoPlay
            playsInline
            loop
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => {
              console.warn('Video failed to load, falling back to bundled default');
              setVideoLoadError(true);
            }}
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer"
            poster={IMAGES.sunsetAerial}
          />
        )}

        {/* Video Overlays: Status Badge */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/85 border border-slate-700/80 backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide truncate max-w-[200px]">
              {config.videoTitle}
            </span>
            <span className="text-[10px] text-amber-400 font-semibold px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-800/60 shrink-0">
              {driveEmbedUrl ? '구글 드라이브 연동' : '고화질 스트리밍'}
            </span>
          </div>
        </div>

        {/* Play/Pause Overlay Icon for HTML5 Video */}
        {!driveEmbedUrl && !isPlaying && (
          <div 
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 cursor-pointer"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-2xl transform hover:scale-110 active:scale-95 transition-all border-2 border-white/60">
              <Play className="w-8 h-8 sm:w-9 sm:h-9 ml-1 fill-slate-950" />
            </div>
          </div>
        )}

        {/* Floating Custom Controls Bar (for HTML5 video) */}
        {!driveEmbedUrl && (
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20 flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-800/90 opacity-90 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold transition-transform cursor-pointer shadow-md"
                title={isPlaying ? '일시정지' : '재생'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 ml-0.5 fill-slate-950" />}
              </button>

              <button
                onClick={toggleMute}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                title={isMuted ? '음소거 해제' : '음소거'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <div className="hidden sm:block text-xs text-slate-300">
                <span className="font-semibold text-white">공식 브랜드 홍보영상</span>
                <span className="text-slate-500 mx-2">|</span>
                <span className="text-[11px] text-amber-300">1호선 다대포항역 1분 · 전 세대 오션뷰 특화</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDriveModal(true)}
                className="px-2.5 py-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-blue-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="구글 드라이브 링크로 영상 연동"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Drive 링크</span>
              </button>

              <button
                onClick={toggleFullScreen}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="전체화면"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3 Key Narrative Video Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenes.map((sc) => {
          const Icon = sc.icon;
          const isActive = activeScene === sc.id;

          return (
            <div
              key={sc.id}
              onClick={() => setActiveScene(sc.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-950 border-amber-500/80 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/40'
                  : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border text-white ${
                  sc.id === 0 ? 'border-orange-500 text-orange-300' : sc.id === 1 ? 'border-cyan-500 text-cyan-300' : 'border-purple-500 text-purple-300'
                }`}>
                  {sc.tag}
                </span>
                <span className="text-[11px] font-mono text-slate-500">{sc.timeText}</span>
              </div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mb-1 break-keep">
                <Icon className={`w-4 h-4 shrink-0 ${sc.id === 0 ? 'text-orange-400' : sc.id === 1 ? 'text-cyan-400' : 'text-purple-400'}`} />
                <span>{sc.title}</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed break-keep">
                {sc.desc}
              </p>
              <p className="text-[11px] text-amber-300/90 font-medium italic mt-2 pt-2 border-t border-slate-800/80 break-keep">
                {sc.narration}
              </p>
            </div>
          );
        })}
      </div>

      {/* Google Drive Video Integration Modal */}
      {showDriveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    Google Drive 홍보영상 연동 설정
                  </h4>
                  <p className="text-xs text-slate-400">
                    깃허브 배포 및 모든 접속자에게 실시간 공유되는 영상 링크
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDriveModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Notice for GitHub Deployments */}
              <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-3 text-xs text-blue-200 leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-blue-300">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>깃허브 배포 및 모든 접속자 공유 안내</span>
                </p>
                <p className="text-[11px] text-slate-300 break-keep">
                  구글 드라이브에 동영상을 올리신 후 <strong>[링크 복사]</strong>(링크가 있는 모든 사용자 보기 권한)를 하여 아래에 등록하시면, Firestore를 통해 <strong>깃허브 배포 도메인으로 접속하는 모든 방문자에게 업로드 창 없이 영상이 즉시 재생</strong>됩니다.
                </p>
              </div>

              {/* Option 1: Direct Paste Google Drive Link */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  구글 드라이브 공유 링크 붙여넣기
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/1w8y.../view?usp=sharing"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 font-mono"
                  />
                  <button
                    onClick={() => handleApplyUrl()}
                    disabled={isSaving || !inputUrl.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    {isSaving ? '저장 중...' : '연동 적용'}
                  </button>
                </div>
              </div>

              {/* Option 2: Search Google Drive Folder */}
              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">
                    내 Google Drive에서 동영상 탐색
                  </span>
                  <button
                    onClick={handleSearchDriveVideos}
                    disabled={isSearchingDrive}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>{isSearchingDrive ? '탐색 중...' : '드라이브 영상 검색'}</span>
                  </button>
                </div>

                {driveVideos.length > 0 && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto bg-slate-950 p-2 rounded-xl border border-slate-800">
                    {driveVideos.map((vid) => (
                      <div
                        key={vid.id}
                        onClick={() => handleApplyUrl(`https://drive.google.com/file/d/${vid.id}/preview`)}
                        className="p-2 hover:bg-slate-900 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Film className="w-4 h-4 text-blue-400 shrink-0" />
                          <span className="text-xs font-medium text-white truncate">{vid.name}</span>
                        </div>
                        <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 shrink-0 ml-2">
                          선택
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Option 3: Reset or Local File */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={handleResetToDefault}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>기본 내장 고화질 영상으로 재생</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>PC에서 파일 직접 올리기</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
