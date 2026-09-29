import React, { useState, useEffect } from 'react';
import { 
  X, 
  FolderSync, 
  HardDrive, 
  Upload, 
  FileText, 
  FileImage, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  User as UserIcon,
  Sparkles,
  Download,
  AlertTriangle
} from 'lucide-react';
import { 
  googleSignIn, 
  logout, 
  getAccessToken, 
  initAuth, 
  User 
} from '../services/firebaseAuth';
import { 
  listDriveFiles, 
  getOrCreateApartmentFolder, 
  uploadFileToDrive, 
  deleteDriveFile, 
  generateApartmentBrochureContent, 
  DriveFileItem 
} from '../services/googleDriveService';
import { IMAGES, COMPLEX_INFO } from '../data/apartmentData';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Destructive delete confirmation modal state
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Check existing auth state
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        loadFolderAndFiles(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setFiles([]);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  const loadFolderAndFiles = async (currentToken?: string) => {
    setIsLoadingFiles(true);
    setStatusMessage(null);
    try {
      const fId = await getOrCreateApartmentFolder();
      setFolderId(fId);
      const fileList = await listDriveFiles(fId);
      setFiles(fileList);
    } catch (err: any) {
      console.error('Failed to load drive files:', err);
      setStatusMessage({ type: 'error', text: err.message || '파일 목록을 불러오지 못했습니다.' });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatusMessage({ type: 'success', text: `${res.user.displayName || 'Google'} 계정으로 연결되었습니다.` });
        loadFolderAndFiles(res.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Google 로그인에 실패했습니다.' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setFiles([]);
    setStatusMessage({ type: 'info', text: 'Google 계정에서 로그아웃되었습니다.' });
  };

  // Save Apartment Brochure Document to Google Drive
  const handleSaveBrochureToDrive = async () => {
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const fId = folderId || (await getOrCreateApartmentFolder());
      const content = generateApartmentBrochureContent();
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const fileName = `다대포_오션시티_프레스티지_분양카탈로그_${new Date().toISOString().slice(0, 10)}.md`;

      const uploaded = await uploadFileToDrive(fileName, blob, fId, '다대포 오션시티 프레스티지 공식 분양 카탈로그');
      setStatusMessage({ type: 'success', text: `'${fileName}' 파일이 구글 드라이브에 저장되었습니다.` });
      const fileList = await listDriveFiles(fId);
      setFiles(fileList);
    } catch (err: any) {
      console.error('Save brochure failed:', err);
      setStatusMessage({ type: 'error', text: err.message || '카탈로그 저장에 실패했습니다.' });
    } finally {
      setIsUploading(false);
    }
  };

  // Save Aerial View Poster to Google Drive
  const handleSaveAerialImageToDrive = async () => {
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const fId = folderId || (await getOrCreateApartmentFolder());
      // Fetch the sunset aerial image blob
      const imgRes = await fetch(IMAGES.sunsetAerial);
      const imgBlob = await imgRes.blob();
      const fileName = `다대포_오션시티_프레스티지_전체조감도_${new Date().toISOString().slice(0, 10)}.jpg`;

      await uploadFileToDrive(fileName, imgBlob, fId, '다대포 해수욕장 오션뷰 & 다대포항역 초역세권 조감도');
      setStatusMessage({ type: 'success', text: `'${fileName}' 조감도가 구글 드라이브에 안전하게 저장되었습니다.` });
      const fileList = await listDriveFiles(fId);
      setFiles(fileList);
    } catch (err: any) {
      console.error('Save image failed:', err);
      setStatusMessage({ type: 'error', text: err.message || '조감도 저장에 실패했습니다.' });
    } finally {
      setIsUploading(false);
    }
  };

  // Custom File Upload
  const handleCustomFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMessage(null);
    try {
      const fId = folderId || (await getOrCreateApartmentFolder());
      await uploadFileToDrive(file.name, file, fId, '사용자 업로드 분양 참고자료');
      setStatusMessage({ type: 'success', text: `'${file.name}' 파일이 구글 드라이브에 업로드되었습니다.` });
      const fileList = await listDriveFiles(fId);
      setFiles(fileList);
    } catch (err: any) {
      console.error('Upload error:', err);
      setStatusMessage({ type: 'error', text: err.message || '파일 업로드 실패' });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Confirm and Execute Deletion (Required by skill for destructive operations)
  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDriveFile(fileToDelete.id);
      setStatusMessage({ type: 'success', text: `'${fileToDelete.name}' 파일이 삭제되었습니다.` });
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setFileToDelete(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      setStatusMessage({ type: 'error', text: err.message || '파일 삭제에 실패했습니다.' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Google Drive 분양 자료 클라우드 보관함
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Google Workspace
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                조감도 고화질 이미지, 분양 카탈로그 및 안내 자료를 내 Google Drive에 안전하게 보관하세요.
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

        {/* Status Notification Banner */}
        {statusMessage && (
          <div className={`px-4 py-2 text-xs flex items-center gap-2 border-b ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-950/80 border-rose-800 text-rose-300'
              : 'bg-blue-950/80 border-blue-800 text-blue-300'
          }`}>
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
            {statusMessage.type === 'info' && <Sparkles className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* User Authentication Status */}
          {!user ? (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">
                  Google 계정을 연결하여 분양 자료를 Drive에 보관하세요
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  사용자의 허가를 받아 고화질 조감도, 분양 상세 카탈로그, 관심고객 신청서를 내 Google Drive 전용 폴더(다대포 오션시티 프레스티지 분양자료)에 자동으로 동기화합니다.
                </p>
              </div>

              {/* Official Google Sign-In Button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleSignIn}
                  disabled={isLoggingIn}
                  className="flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isLoggingIn ? 'Google 계정 연결 중...' : 'Google 계정으로 로그인하여 드라이브 연결'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Connected User Profile Card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full border border-blue-500/40" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{user.displayName || 'Google 사용자'}</span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.2 rounded-full font-semibold">
                        Drive 연동됨
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadFolderAndFiles()}
                    disabled={isLoadingFiles}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="새로고침"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin text-blue-400' : ''}`} />
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>로그아웃</span>
                  </button>
                </div>
              </div>

              {/* Fast Action Buttons: Save to Google Drive */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleSaveAerialImageToDrive}
                  disabled={isUploading}
                  className="bg-slate-950/80 hover:bg-slate-800/90 border border-amber-500/40 hover:border-amber-400 p-3.5 rounded-xl text-left transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <FileImage className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] text-amber-300 font-bold bg-amber-950/80 px-1.5 py-0.5 rounded">JPG 고화질</span>
                  </div>
                  <h5 className="text-xs font-bold text-white mb-0.5">조감도 저장</h5>
                  <p className="text-[11px] text-slate-400">다대포 해수욕장 & 역세권 조감도</p>
                </button>

                <button
                  onClick={handleSaveBrochureToDrive}
                  disabled={isUploading}
                  className="bg-slate-950/80 hover:bg-slate-800/90 border border-blue-500/40 hover:border-blue-400 p-3.5 rounded-xl text-left transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] text-blue-300 font-bold bg-blue-950/80 px-1.5 py-0.5 rounded">E-카탈로그</span>
                  </div>
                  <h5 className="text-xs font-bold text-white mb-0.5">분양 리포트 저장</h5>
                  <p className="text-[11px] text-slate-400">단지개요, 평형, 입지분석 자료</p>
                </button>

                <label className="bg-slate-950/80 hover:bg-slate-800/90 border border-slate-700 hover:border-slate-500 p-3.5 rounded-xl text-left transition-all cursor-pointer group shadow-sm block">
                  <input
                    type="file"
                    onChange={handleCustomFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <Upload className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded">내 파일</span>
                  </div>
                  <h5 className="text-xs font-bold text-white mb-0.5">직접 파일 업로드</h5>
                  <p className="text-[11px] text-slate-400">청약 서류나 참고 이미지 보관</p>
                </label>
              </div>

              {/* Saved Files List Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderSync className="w-4 h-4 text-blue-400" />
                    <span>내 Drive 보관 파일 ({files.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    폴더: 다대포 오션시티 프레스티지 분양자료
                  </span>
                </div>

                {isLoadingFiles ? (
                  <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2 bg-slate-950/40 rounded-xl">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    <span>Google Drive 파일 조회 중...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800/60 space-y-2">
                    <FolderSync className="w-8 h-8 mx-auto text-slate-600" />
                    <p>아직 드라이브에 보관된 분양 자료가 없습니다.</p>
                    <p className="text-[11px] text-slate-600">위 버튼을 눌러 조감도나 분양 카탈로그를 저장해보세요.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 max-h-64 overflow-y-auto">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 flex items-center justify-between hover:bg-slate-900/60 transition-colors text-xs gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {file.mimeType.includes('image') ? (
                            <FileImage className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-500">
                              {file.createdTime ? new Date(file.createdTime).toLocaleDateString('ko-KR') : ''}
                              {file.size ? ` · ${(Number(file.size) / 1024).toFixed(1)} KB` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors"
                            >
                              <span>Drive에서 열기</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          )}
                          <button
                            onClick={() => setFileToDelete(file)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                            title="파일 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Google Drive API v3 · 안전한 OAuth 2.0 클라이언트 인증
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>

      {/* MANDATORY User Confirmation Dialog for Destructive Operations */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/40 rounded-2xl p-5 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-white mb-1">
                파일을 삭제하시겠습니까?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Google Drive에서 <strong className="text-rose-300">'{fileToDelete.name}'</strong> 파일이 영구 삭제됩니다. 이 작업은 취소할 수 없습니다.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>삭제 확인</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
