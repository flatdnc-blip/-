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
  Trees, 
  RotateCcw,
  CheckCircle2,
  HardDrive,
  Film
} from 'lucide-react';
import { IMAGES } from '../data/apartmentData';
import { uploadFileToDrive, getOrCreateApartmentFolder } from '../services/googleDriveService';

interface PromoVideoSectionProps {
  onOpenInterest: () => void;
  onOpenGoogleDrive?: () => void;
}

export const PromoVideoSection: React.FC<PromoVideoSectionProps> = ({
  onOpenInterest,
  onOpenGoogleDrive,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [activeScene, setActiveScene] = useState<number>(0);
  const [customVideoName, setCustomVideoName] = useState<string>('공식 브랜드 홍보영상');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>('');
  const [driveUploadStatus, setDriveUploadStatus] = useState<string | null>(null);
  const [isUploadingToDrive, setIsUploadingToDrive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scenes from the official promotional video
  const scenes = [
    {
      id: 0,
      title: '01. 다대포항역 초역세권',
      desc: '1호선 다대포항역 도보 1분 (약 50m) 출퇴근 특권',
      icon: Train,
      tag: '초역세권',
      color: 'from-orange-500 to-amber-600',
      timeText: '00:00 - 00:09',
      narration: '"다대포항역 초역세권의 빠른 교통, 일상의 여유를 엽니다."'
    },
    {
      id: 1,
      title: '02. 눈부신 영구 오션뷰',
      desc: '거실과 테라스 발아래 펼쳐지는 투명한 바다와 노을',
      icon: Waves,
      tag: '바다조망',
      color: 'from-cyan-500 to-blue-600',
      timeText: '00:10 - 00:19',
      narration: '"발아래 펼쳐지는 투명한 바다, 다대포의 눈부신 오션 프리미엄"'
    },
    {
      id: 2,
      title: '03. 명품 단지 조경 & 분수',
      desc: '단지 내 중앙 수경공원과 힐링 산책로 프리미엄',
      icon: Trees,
      tag: '단지조경',
      color: 'from-emerald-500 to-teal-600',
      timeText: '00:20 - 00:29',
      narration: '"이미 완성된 구도심의 편리함 위에 프리미엄을 더하다"'
    }
  ];

  // Handle local video upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setCustomVideoName(file.name);
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleApplyUrl = () => {
    if (inputUrl.trim()) {
      setVideoSrc(inputUrl.trim());
      setCustomVideoName('외부 등록 영상');
      setShowUrlInput(false);
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.src = inputUrl.trim();
        videoRef.current.play().catch(() => {});
      }
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

  // Upload loaded video to Google Drive
  const handleSaveVideoToDrive = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setDriveUploadStatus('업로드된 로컬 동영상 파일이 없습니다. [동영상 파일 업로드]를 먼저 진행해 주세요.');
      setTimeout(() => setDriveUploadStatus(null), 3500);
      return;
    }

    setIsUploadingToDrive(true);
    setDriveUploadStatus(null);
    try {
      const folderId = await getOrCreateApartmentFolder();
      await uploadFileToDrive(file.name, file, folderId, '다대포 오션시티 프레스티지 공식 홍보 동영상');
      setDriveUploadStatus(`'${file.name}'이 Google Drive에 성공적으로 업로드되었습니다.`);
      setTimeout(() => setDriveUploadStatus(null), 4000);
    } catch (err: any) {
      console.error('Video upload to drive failed:', err);
      setDriveUploadStatus(err.message || 'Google Drive 업로드에 실패했습니다.');
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  return (
    <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-4 sm:p-7 backdrop-blur-md shadow-2xl space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              OFFICIAL BRAND MOVIE
            </span>
            <span className="text-slate-600 text-xs hidden sm:inline">|</span>
            <span className="text-xs text-cyan-300 font-medium hidden sm:inline-flex items-center gap-1">
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              다대포항역 초역세권 & 오션 프리미엄
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-serif break-keep">
            다대포 오션시티 프레스티지 공식 홍보영상
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 break-keep">
            도보 1분 다대포항역의 스피드와 발아래 펼쳐지는 눈부신 바다의 파노라마를 영상으로 감상하세요.
          </p>
        </div>

        {/* Upload & Link Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            title="소장하신 홍보 영상 파일(MP4, MOV, WebM) 업로드 및 재생"
          >
            <Upload className="w-4 h-4 text-slate-950" />
            <span>동영상 파일 올리기</span>
          </button>

          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
            title="동영상 웹 주소 등록"
          >
            <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>URL 등록</span>
          </button>

          {videoSrc && (
            <button
              onClick={handleSaveVideoToDrive}
              disabled={isUploadingToDrive}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-950/80 hover:bg-blue-900 text-blue-300 hover:text-white border border-blue-700/60 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Google Drive에 이 동영상 저장"
            >
              <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              <span>{isUploadingToDrive ? 'Drive 저장 중...' : 'Drive에 영상 저장'}</span>
            </button>
          )}
        </div>
      </div>

      {/* URL Input Bar */}
      {showUrlInput && (
        <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl animate-in fade-in duration-150">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="동영상 파일 URL(mp4, webm)을 입력하세요..."
            className="flex-1 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={handleApplyUrl}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg cursor-pointer"
          >
            적용
          </button>
          <button
            onClick={() => setShowUrlInput(false)}
            className="px-2 py-1.5 text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            취소
          </button>
        </div>
      )}

      {/* Drive Status Message */}
      {driveUploadStatus && (
        <div className="bg-blue-950/90 border border-blue-700 p-3 rounded-xl text-xs text-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{driveUploadStatus}</span>
          </div>
          {onOpenGoogleDrive && (
            <button
              onClick={onOpenGoogleDrive}
              className="text-xs font-bold text-blue-300 underline hover:text-white ml-2 cursor-pointer"
            >
              Drive 보관함 보기
            </button>
          )}
        </div>
      )}

      {/* Main Video Player Container (16:9 Aspect Ratio) */}
      <div className="relative w-full aspect-video max-h-[580px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group flex items-center justify-center">
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            playsInline
            loop
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer"
            poster={IMAGES.sunsetAerial}
          />
        ) : (
          /* High-Definition Interactive Simulated Video Player */
          <div className="relative w-full h-full overflow-hidden select-none cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img
              src={
                activeScene === 0 
                  ? IMAGES.dayAerial 
                  : activeScene === 1 
                  ? IMAGES.penthouseView 
                  : IMAGES.amenitiesShowcase
              }
              alt="홍보 영상 배경"
              className="w-full h-full object-cover transform scale-105 transition-transform duration-1000 ease-out"
            />
            {/* Cinematic Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/60" />

            {/* Center Play Button Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/90 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-amber-500/40 transform hover:scale-110 active:scale-95 transition-all mb-4 group-hover:scale-105 border-2 border-white/60">
                <Play className="w-8 h-8 sm:w-9 sm:h-9 ml-1 fill-slate-950" />
              </div>
              <span className="text-sm sm:text-base font-bold text-white tracking-tight drop-shadow-md">
                {scenes[activeScene].title}
              </span>
              <p className="text-xs sm:text-sm text-amber-300 font-medium max-w-md mt-1 drop-shadow">
                {scenes[activeScene].narration}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-[11px] px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 backdrop-blur-md">
                  ※ 상단 [동영상 파일 올리기]를 눌러 업로드하신 영상을 즉시 전체화면으로 감상하실 수 있습니다.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Video Overlays: Floating Scene Badge */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-700/80 backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide">
              {customVideoName}
            </span>
            <span className="text-[10px] text-amber-400 font-semibold px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-800/60">
              4K UHD
            </span>
          </div>
        </div>

        {/* Player Bottom Control Strip */}
        <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex items-center justify-between gap-3 z-20">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <button
              onClick={toggleMute}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title={isMuted ? '음소거 해제' : '음소거'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>

            <div className="hidden sm:block text-xs font-mono text-slate-300">
              {scenes[activeScene].timeText}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenInterest}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <span>분양상담 예약</span>
            </button>

            <button
              onClick={toggleFullScreen}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="전체화면"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Key Video Chapter Cards (Matching the Uploaded Video Scenes) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenes.map((sc) => {
          const Icon = sc.icon;
          const isActive = activeScene === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => setActiveScene(sc.id)}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-950 border-amber-500/80 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/40'
                  : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border text-white ${
                  sc.id === 0 ? 'border-orange-500 text-orange-300' : sc.id === 1 ? 'border-cyan-500 text-cyan-300' : 'border-emerald-500 text-emerald-300'
                }`}>
                  {sc.tag}
                </span>
                <span className="text-[11px] font-mono text-slate-500">{sc.timeText}</span>
              </div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mb-1">
                <Icon className={`w-4 h-4 ${sc.id === 0 ? 'text-orange-400' : sc.id === 1 ? 'text-cyan-400' : 'text-emerald-400'}`} />
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
    </section>
  );
};
