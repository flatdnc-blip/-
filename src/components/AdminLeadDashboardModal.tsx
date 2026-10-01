import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Download, 
  HardDrive, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  Phone, 
  Calendar, 
  Clock,
  ExternalLink, 
  ShieldCheck, 
  FileSpreadsheet, 
  SlidersHorizontal,
  Trash2,
  Edit3,
  Bell,
  LayoutGrid,
  Table as TableIcon,
  MessageSquare,
  Sparkles,
  Waves,
  Train,
  CalendarDays,
  UserCheck,
  MessageCircle,
  Send
} from 'lucide-react';
import { 
  StoredInterestRegistration, 
  fetchAllRegistrations, 
  updateRegistrationStatus, 
  deleteRegistration, 
  downloadRegistrationsAsCSV, 
  saveRegistrationsCSVToDrive,
  subscribeToInterestRegistrations,
  requestNotificationPermission,
  sendLeadTelegramAndMark,
  sendAllUnsentLeads
} from '../services/interestRegistrationService';
import {
  getGoogleChatWebhookUrl,
  saveGoogleChatWebhookUrl,
  sendLeadToGoogleChat
} from '../services/googleChatService';
import {
  getTelegramConfig,
  getTelegramConfigAsync,
  saveTelegramConfig,
  sendTestMessageToTelegram,
  TelegramConfig
} from '../services/telegramService';

interface AdminLeadDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGoogleDrive: () => void;
}

export const AdminLeadDashboardModal: React.FC<AdminLeadDashboardModalProps> = ({
  isOpen,
  onClose,
  onOpenGoogleDrive,
}) => {
  const [leads, setLeads] = useState<StoredInterestRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedCustomDate, setSelectedCustomDate] = useState<string>('');
  const [viewStyle, setViewStyle] = useState<'cards' | 'table' | 'schedule'>('cards');
  const [editingNotesLead, setEditingNotesLead] = useState<StoredInterestRegistration | null>(null);
  const [notesInput, setNotesInput] = useState<string>('');
  const [driveSaving, setDriveSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [activeNotificationTab, setActiveNotificationTab] = useState<'telegram' | 'googleChat'>('telegram');
  const [chatWebhookUrl, setChatWebhookUrl] = useState('');
  const [isTestingChat, setIsTestingChat] = useState(false);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({
    botToken: '',
    chatId: '',
    enabled: true,
  });
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [sendingLeadId, setSendingLeadId] = useState<string | null>(null);
  const [isSendingUnsent, setIsSendingUnsent] = useState(false);
  const [unsentProgress, setUnsentProgress] = useState<{ current: number; total: number } | null>(null);

  // Detect screen size on mount to select optimal view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setChatWebhookUrl(getGoogleChatWebhookUrl());
      getTelegramConfigAsync().then((cfg) => {
        setTelegramConfig(cfg);
      });
      if (window.innerWidth >= 1024) {
        setViewStyle('table');
      } else {
        setViewStyle('cards');
      }
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    }
  }, []);

  // Real-time Firestore onSnapshot Subscription
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const unsubscribe = subscribeToInterestRegistrations((liveLeads) => {
      setLeads(liveLeads);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Filtered leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.registrationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.visitDate && lead.visitDate.includes(searchQuery)) ||
      (lead.notes && lead.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesUnit = unitFilter === 'all' || lead.unitType === unitFilter;
    
    let matchesDate = true;
    if (dateFilter === 'has_visit') {
      matchesDate = Boolean(lead.visitDate && lead.visitDate.trim() !== '');
    } else if (dateFilter === 'today') {
      matchesDate = lead.visitDate === todayStr;
    } else if (dateFilter === 'tomorrow') {
      matchesDate = lead.visitDate === tomorrowStr;
    } else if (dateFilter === 'custom' && selectedCustomDate) {
      matchesDate = lead.visitDate === selectedCustomDate;
    }

    return matchesSearch && matchesStatus && matchesUnit && matchesDate;
  });

  // Calculate reservation stats
  const totalReservations = leads.filter((l) => l.visitDate && l.visitDate.trim() !== '').length;
  const todayReservations = leads.filter((l) => l.visitDate === todayStr).length;
  const unsentCount = leads.filter((l) => !l.telegramNotified).length;

  const handleStatusChange = async (id: string, newStatus: StoredInterestRegistration['status']) => {
    await updateRegistrationStatus(id, newStatus);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    setActionMessage('상담 상태가 실시간으로 변경되었습니다.');
    setTimeout(() => setActionMessage(null), 2500);
  };

  const handleOpenNotesModal = (lead: StoredInterestRegistration) => {
    setEditingNotesLead(lead);
    setNotesInput(lead.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!editingNotesLead) return;
    await updateRegistrationStatus(editingNotesLead.id, editingNotesLead.status, notesInput);
    setLeads((prev) => prev.map((l) => (l.id === editingNotesLead.id ? { ...l, notes: notesInput } : l)));
    setEditingNotesLead(null);
    setActionMessage('상담원 메모가 저장되었습니다.');
    setTimeout(() => setActionMessage(null), 2500);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('해당 관심고객 데이터를 영구 삭제하시겠습니까?')) {
      await deleteRegistration(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setActionMessage('데이터가 삭제되었습니다.');
      setTimeout(() => setActionMessage(null), 2500);
    }
  };

  const handleExportCSV = () => {
    downloadRegistrationsAsCSV(leads);
    setActionMessage('엑셀(CSV) 파일이 다운로드되었습니다.');
    setTimeout(() => setActionMessage(null), 2500);
  };

  const handleSaveToDrive = async () => {
    setDriveSaving(true);
    setActionMessage(null);
    try {
      const fileName = await saveRegistrationsCSVToDrive(leads);
      setActionMessage(`'${fileName}'이 Google Drive에 안전하게 저장되었습니다.`);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      console.error('Drive save failed:', err);
      setActionMessage(err.message || 'Google Drive 저장 실패');
    } finally {
      setDriveSaving(false);
    }
  };

  const handleToggleNotification = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      setActionMessage('실시간 데스크톱 브라우저 알림이 켜졌습니다!');
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleSaveChatWebhook = () => {
    saveGoogleChatWebhookUrl(chatWebhookUrl);
    setActionMessage('Google Chat Webhook URL이 성공적으로 저장되었습니다.');
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleSaveTelegram = async () => {
    await saveTelegramConfig(telegramConfig);
    setActionMessage('텔레그램 알림 설정이 클라우드에 성공적으로 저장되었습니다.');
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    const res = await sendTestMessageToTelegram(telegramConfig.botToken, telegramConfig.chatId);
    setActionMessage(res.message);
    setTimeout(() => setActionMessage(null), 5000);
    setIsTestingTelegram(false);
  };

  const handleSendSingleLead = async (lead: StoredInterestRegistration) => {
    setSendingLeadId(lead.id);
    const res = await sendLeadTelegramAndMark(lead);
    if (res.success) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? { ...l, telegramNotified: true, telegramNotifiedAt: new Date().toISOString() }
            : l
        )
      );
      setActionMessage(`[${lead.name}] 고객님의 접수 정보가 텔레그램으로 전송되었습니다.`);
    } else {
      setActionMessage(`전송 실패: ${res.message}`);
    }
    setTimeout(() => setActionMessage(null), 4000);
    setSendingLeadId(null);
  };

  const handleSendAllUnsent = async () => {
    const unsent = leads.filter((l) => !l.telegramNotified);
    if (unsent.length === 0) {
      setActionMessage('텔레그램으로 보낼 미발송 고객 데이터가 없습니다.');
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    setIsSendingUnsent(true);
    setUnsentProgress({ current: 0, total: unsent.length });

    const result = await sendAllUnsentLeads(leads, (curr, tot) => {
      setUnsentProgress({ current: curr, total: tot });
    });

    setLeads((prev) =>
      prev.map((l) =>
        !l.telegramNotified
          ? { ...l, telegramNotified: true, telegramNotifiedAt: new Date().toISOString() }
          : l
      )
    );

    setActionMessage(`기존 미발송 고객 ${result.sent}건의 텔레그램 발송이 완료되었습니다!`);
    setTimeout(() => setActionMessage(null), 5000);
    setIsSendingUnsent(false);
    setUnsentProgress(null);
  };

  const handleTestGoogleChat = async () => {
    setIsTestingChat(true);
    const mockLead: StoredInterestRegistration = leads.find(l => l.visitDate) || leads[0] || {
      id: 'test_lead_' + Date.now(),
      name: '김다대 (홍보관 방문테스트)',
      phone: '010-8888-9999',
      unitType: '84A',
      primaryInterest: 'ocean',
      status: '접수대기',
      registrationCode: 'VIP-777777',
      wantsOceanView: true,
      createdAt: new Date().toISOString(),
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: '14:00',
      notes: '테스트 방문 예약 알림 메시지입니다.',
    };

    const res = await sendLeadToGoogleChat(mockLead, chatWebhookUrl);
    setActionMessage(res.message);
    setTimeout(() => setActionMessage(null), 4000);
    setIsTestingChat(false);
  };

  // Group leads by visit date for Schedule view
  const groupedByDate: { [date: string]: StoredInterestRegistration[] } = {};
  leads
    .filter((l) => l.visitDate && l.visitDate.trim() !== '')
    .forEach((lead) => {
      const d = lead.visitDate || '미지정';
      if (!groupedByDate[d]) groupedByDate[d] = [];
      groupedByDate[d].push(lead);
    });

  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-5 bg-slate-950/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  ADMINISTRATION SYSTEM
                </span>
                <span className="text-slate-600 text-xs hidden sm:inline">|</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE 실시간 연동 중
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-bold text-white font-serif break-keep">
                VIP 관심고객 접수 & 홍보관 방문예약 관리
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Realtime Messenger Notification Button (Telegram & Google Chat) */}
            <button
              onClick={() => {
                setShowChatSettings(true);
                setActiveNotificationTab('telegram');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border bg-sky-950/70 text-sky-300 border-sky-600 hover:bg-sky-900 shadow-sm"
              title="실시간 텔레그램 / Google Chat 알림 연동"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">실시간 메신저 알림</span>
              {telegramConfig.enabled && telegramConfig.botToken && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="텔레그램 알림 활성화됨" />
              )}
            </button>

            {/* Notification Permission Toggle */}
            <button
              onClick={handleToggleNotification}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
                  : 'bg-amber-950/60 text-amber-300 border-amber-700 hover:bg-amber-900'
              }`}
              title="신규 접수 시 브라우저 알림 설정"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {notificationPermission === 'granted' ? '알림 켜짐' : '알림 켜기'}
              </span>
            </button>

            {/* View Style Switcher (Cards vs Table vs Schedule) */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewStyle('cards')}
                className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  viewStyle === 'cards'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="카드 리스트 보기"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden md:inline">카드형</span>
              </button>
              <button
                onClick={() => setViewStyle('table')}
                className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  viewStyle === 'table'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="테이블 보기"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">테이블형</span>
              </button>
              <button
                onClick={() => setViewStyle('schedule')}
                className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  viewStyle === 'schedule'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="날짜별 방문 예약 일정표 보기"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="hidden md:inline">방문 일정표</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Message Alert */}
        {actionMessage && (
          <div className="bg-emerald-950/90 border-b border-emerald-800 px-4 py-2 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="break-keep">{actionMessage}</span>
          </div>
        )}

        {/* Unsent Leads Notification Banner */}
        {unsentCount > 0 && telegramConfig.botToken && (
          <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 border-b border-sky-700/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs animate-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2 text-sky-200">
              <Send className="w-4 h-4 text-sky-400 shrink-0 animate-pulse" />
              <span>
                텔레그램 알림을 아직 보내지 않은 기존 고객이 <strong className="text-white font-bold underline underline-offset-2">{unsentCount}명</strong> 있습니다.
              </span>
            </div>
            <button
              onClick={handleSendAllUnsent}
              disabled={isSendingUnsent}
              className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isSendingUnsent
                  ? `텔레그램 발송 중 (${unsentProgress?.current}/${unsentProgress?.total})...`
                  : `미발송 고객 전체 텔레그램 전송 (${unsentCount}건)`}
              </span>
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-slate-950/80 p-3 sm:p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider break-keep">총 관심고객 접수</p>
                <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-0.5">{leads.length}건</p>
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px]">
                <span className="text-slate-500">실시간 누적 DB</span>
                {unsentCount > 0 ? (
                  <span className="text-amber-400 font-semibold">미발송 {unsentCount}건</span>
                ) : (
                  <span className="text-emerald-400 font-semibold">전송 100%</span>
                )}
              </div>
            </div>
            <div className="bg-slate-950/80 p-3 sm:p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider break-keep">홍보관 방문 예약</p>
              <p className="text-xl sm:text-2xl font-black text-cyan-400 font-mono mt-0.5">
                {totalReservations}건
              </p>
              <p className="text-[10px] text-cyan-400/80 break-keep">오늘 방문: {todayReservations}건</p>
            </div>
            <div className="bg-slate-950/80 p-3 sm:p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider break-keep">상담 대기</p>
              <p className="text-xl sm:text-2xl font-black text-orange-400 font-mono mt-0.5">
                {leads.filter((l) => l.status === '접수대기').length}건
              </p>
              <p className="text-[10px] text-slate-500 break-keep">연락 대기 고객</p>
            </div>
            <div className="bg-slate-950/80 p-3 sm:p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider break-keep">상담 완료</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-0.5">
                {leads.filter((l) => l.status === '상담완료').length}건
              </p>
              <p className="text-[10px] text-slate-500 break-keep">방문/전화 완료</p>
            </div>
          </div>

          {/* Search & Date Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-950/60 p-2.5 sm:p-3 rounded-2xl border border-slate-800/80">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="고객명, 연락처, 코드, 방문날짜(YYYY-MM-DD), 메모..."
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Date Filter Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">전체 날짜</option>
                  <option value="has_visit">방문예약 고객만</option>
                  <option value="today">오늘 방문예약 ({todayStr})</option>
                  <option value="tomorrow">내일 방문예약 ({tomorrowStr})</option>
                  <option value="custom">날짜 직접선택</option>
                </select>
              </div>

              {dateFilter === 'custom' && (
                <input
                  type="date"
                  value={selectedCustomDate}
                  onChange={(e) => setSelectedCustomDate(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                />
              )}

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">전체 상태</option>
                <option value="접수대기">접수대기</option>
                <option value="상담완료">상담완료</option>
                <option value="부재">부재</option>
                <option value="보류">보류</option>
              </select>

              {/* Unit Filter */}
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">전체 평형</option>
                <option value="59">59㎡</option>
                <option value="84A">84㎡ A</option>
                <option value="84B">84㎡ B</option>
                <option value="128">128㎡ 펜트</option>
              </select>
            </div>
          </div>

          {/* VIEW 1: SCHEDULE AGENDA VIEW (Grouped by Visit Date!) */}
          {viewStyle === 'schedule' && (
            <div className="space-y-4">
              {sortedDates.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs bg-slate-950/60 rounded-2xl border border-slate-800">
                  {loading ? '실시간 데이터를 불러오는 중입니다...' : '홍보관 방문 예약 일정이 없습니다.'}
                </div>
              ) : (
                sortedDates.map((date) => {
                  const dayLeads = groupedByDate[date];
                  const isToday = date === todayStr;

                  return (
                    <div key={date} className="bg-slate-950/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                      <div className={`px-4 py-3 border-b flex items-center justify-between ${
                        isToday ? 'bg-amber-950/50 border-amber-600/50' : 'bg-slate-900 border-slate-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Calendar className={`w-4 h-4 ${isToday ? 'text-amber-400' : 'text-slate-400'}`} />
                          <h4 className="text-sm font-bold text-white font-mono">
                            {date}
                          </h4>
                          {isToday && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                              오늘 예약
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-300">
                          총 {dayLeads.length}명 방문 예정
                        </span>
                      </div>

                      <div className="divide-y divide-slate-800/60">
                        {dayLeads.map((lead) => (
                          <div key={lead.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors">
                            <div className="flex items-start sm:items-center gap-3">
                              <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs shrink-0 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{lead.visitTime || '시간 미지정'}</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-extrabold text-white">{lead.name} 고객님</span>
                                  <span className="text-[10px] font-mono text-slate-500">{lead.registrationCode}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                  <a href={`tel:${lead.phone}`} className="text-cyan-400 font-mono hover:underline flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    <span>{lead.phone}</span>
                                  </a>
                                  <span>·</span>
                                  <span className="font-bold text-slate-200">
                                    희망평형: {lead.unitType === '59' ? '59㎡' : lead.unitType === '84A' ? '84㎡A' : lead.unitType === '84B' ? '84㎡B' : '128㎡'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                value={lead.status}
                                onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                                  lead.status === '상담완료'
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                    : lead.status === '부재'
                                    ? 'bg-rose-950 text-rose-300 border-rose-700'
                                    : lead.status === '보류'
                                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                                    : 'bg-orange-950 text-orange-300 border-orange-700'
                                }`}
                              >
                                <option value="접수대기">접수대기</option>
                                <option value="상담완료">상담완료</option>
                                <option value="부재">부재</option>
                                <option value="보류">보류</option>
                              </select>

                              {lead.telegramNotified ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-medium whitespace-nowrap">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>알림완료</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSendSingleLead(lead)}
                                  disabled={sendingLeadId === lead.id}
                                  className="px-2 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-600 text-sky-200 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1 whitespace-nowrap"
                                  title="텔레그램으로 알림 즉시 발송"
                                >
                                  <Send className="w-3 h-3 text-sky-400" />
                                  <span>{sendingLeadId === lead.id ? '전송...' : '알림발송'}</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenNotesModal(lead)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer"
                              >
                                메모
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VIEW 2: RESPONSIVE CARDS VIEW */}
          {viewStyle === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredLeads.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 text-xs bg-slate-950/60 rounded-2xl border border-slate-800">
                  {loading ? '실시간 데이터를 불러오는 중입니다...' : '검색 조건에 일치하는 관심고객 데이터가 없습니다.'}
                </div>
              ) : (
                filteredLeads.map((lead) => {
                  const typeLabel = 
                    lead.unitType === '59' ? '59㎡' : 
                    lead.unitType === '84A' ? '84㎡A' : 
                    lead.unitType === '84B' ? '84㎡B' : 
                    lead.unitType === '128' ? '128㎡ 펜트' : lead.unitType;

                  return (
                    <div
                      key={lead.id}
                      className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 shadow-lg transition-all"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-extrabold text-white">
                              {lead.name}
                            </span>
                            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                              {lead.registrationCode}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            접수: {new Date(lead.createdAt).toLocaleString('ko-KR', {
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>

                        {/* Status Dropdown */}
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                            lead.status === '상담완료'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : lead.status === '부재'
                              ? 'bg-rose-950 text-rose-300 border-rose-700'
                              : lead.status === '보류'
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : 'bg-orange-950 text-orange-300 border-orange-700'
                          }`}
                        >
                          <option value="접수대기">접수대기</option>
                          <option value="상담완료">상담완료</option>
                          <option value="부재">부재</option>
                          <option value="보류">보류</option>
                        </select>
                      </div>

                      {/* Scheduled Visit Reservation Badge */}
                      {lead.visitDate ? (
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 font-bold">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-amber-400" />
                            <span>홍보관 방문 예약: {lead.visitDate}</span>
                          </div>
                          <div className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{lead.visitTime || '시간 미지정'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                          방문 예약 없음 (온라인/전화 상담 희망)
                        </div>
                      )}

                      {/* Customer Details & Specs */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 block font-semibold">연락처</span>
                          <a
                            href={`tel:${lead.phone}`}
                            className="font-mono text-cyan-400 font-bold hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-3 h-3 text-cyan-400" />
                            <span>{lead.phone}</span>
                          </a>
                        </div>

                        <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 block font-semibold">희망 평형</span>
                          <span className="font-bold text-white block mt-0.5">{typeLabel}</span>
                        </div>
                      </div>

                      {/* Counselor Notes */}
                      <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">상담 메모</span>
                          <p className="text-xs text-slate-300 break-keep mt-0.5 whitespace-pre-wrap">
                            {lead.notes ? lead.notes : <span className="text-slate-500 italic">등록된 상담 메모가 없습니다.</span>}
                          </p>
                        </div>
                        <button
                          onClick={() => handleOpenNotesModal(lead)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-1"
                          title="상담 메모 수정"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>메모</span>
                        </button>
                      </div>

                      {/* Card Footer: Notification Status & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-1.5">
                          {lead.telegramNotified ? (
                            <span 
                              className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full font-medium"
                              title={lead.telegramNotifiedAt ? `발송일시: ${new Date(lead.telegramNotifiedAt).toLocaleString('ko-KR')}` : ''}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>텔레그램 발송됨</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full font-medium">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>알림 미발송</span>
                            </span>
                          )}

                          <button
                            onClick={() => handleSendSingleLead(lead)}
                            disabled={sendingLeadId === lead.id}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border ${
                              lead.telegramNotified
                                ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                : 'bg-sky-950/80 border-sky-600 text-sky-200 hover:bg-sky-900'
                            }`}
                            title={lead.telegramNotified ? "텔레그램으로 다시 발송" : "텔레그램으로 고객 접수 알림 즉시 발송"}
                          >
                            <Send className="w-3 h-3 text-sky-400" />
                            <span>{sendingLeadId === lead.id ? '전송 중...' : lead.telegramNotified ? '재전송' : '텔레그램 발송'}</span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>데이터 삭제</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VIEW 3: FULL TABLE VIEW (With Visit Reservation Date/Time Column!) */}
          {viewStyle === 'table' && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-xs min-w-[880px]">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap">접수코드</th>
                      <th className="px-4 py-3 whitespace-nowrap">고객명</th>
                      <th className="px-4 py-3 whitespace-nowrap">연락처</th>
                      <th className="px-4 py-3 whitespace-nowrap">희망평형</th>
                      <th className="px-4 py-3 whitespace-nowrap">방문예약일시</th>
                      <th className="px-4 py-3 whitespace-nowrap">접수일시</th>
                      <th className="px-4 py-3 whitespace-nowrap">상담상태</th>
                      <th className="px-4 py-3 whitespace-nowrap">텔레그램 알림</th>
                      <th className="px-4 py-3">상담메모 / 관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                          {loading ? '실시간 데이터를 불러오는 중입니다...' : '검색 조건에 일치하는 데이터가 없습니다.'}
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                            {lead.registrationCode}
                          </td>
                          <td className="px-4 py-3 font-bold text-white whitespace-nowrap">
                            {lead.name}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-300 whitespace-nowrap">
                            <a href={`tel:${lead.phone}`} className="hover:text-amber-400 hover:underline">
                              {lead.phone}
                            </a>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 font-bold text-slate-200">
                              {lead.unitType === '59' ? '59㎡' : lead.unitType === '84A' ? '84㎡A' : lead.unitType === '84B' ? '84㎡B' : lead.unitType === '128' ? '128㎡' : lead.unitType}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {lead.visitDate ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-[11px]">
                                <Calendar className="w-3 h-3 text-amber-400" />
                                {lead.visitDate} {lead.visitTime}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">미신청</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                            {new Date(lead.createdAt).toLocaleString('ko-KR', {
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                              className={`px-2 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                                lead.status === '상담완료'
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                  : lead.status === '부재'
                                  ? 'bg-rose-950 text-rose-300 border-rose-700'
                                  : lead.status === '보류'
                                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                                  : 'bg-orange-950 text-orange-300 border-orange-700'
                              }`}
                            >
                              <option value="접수대기">접수대기</option>
                              <option value="상담완료">상담완료</option>
                              <option value="부재">부재</option>
                              <option value="보류">보류</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {lead.telegramNotified ? (
                                <span 
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-medium"
                                  title={lead.telegramNotifiedAt ? `발송일시: ${new Date(lead.telegramNotifiedAt).toLocaleString('ko-KR')}` : ''}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>전송완료</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-950/60 border border-amber-800/60 text-amber-300 font-medium">
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  <span>미발송</span>
                                </span>
                              )}
                              <button
                                onClick={() => handleSendSingleLead(lead)}
                                disabled={sendingLeadId === lead.id}
                                className={`px-2 py-0.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                                  lead.telegramNotified
                                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                                    : 'bg-sky-950/80 border-sky-600 text-sky-200 hover:bg-sky-900'
                                }`}
                                title={lead.telegramNotified ? '텔레그램 재전송' : '텔레그램으로 알림 즉시 발송'}
                              >
                                <Send className="w-3 h-3 text-sky-400" />
                                <span>{sendingLeadId === lead.id ? '전송...' : lead.telegramNotified ? '재전송' : '발송'}</span>
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenNotesModal(lead)}
                                className="text-slate-300 hover:text-amber-400 text-xs flex items-center gap-1 max-w-[200px] text-left truncate cursor-pointer"
                                title="상담 메모 상세 보기 및 수정"
                              >
                                <Edit3 className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                                <span className="truncate">{lead.notes || '메모 작성...'}</span>
                              </button>

                              <button
                                onClick={() => handleDelete(lead.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                                title="삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal for Counselor Notes Full Screen Edit */}
        {editingNotesLead && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <span>상담원 상세 메모 & 상담일지</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    고객명: <strong className="text-white">{editingNotesLead.name}</strong> ({editingNotesLead.phone})
                    {editingNotesLead.visitDate && (
                      <span className="text-amber-300 ml-2">
                        [방문예약: {editingNotesLead.visitDate} {editingNotesLead.visitTime}]
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setEditingNotesLead(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  상담 내용 및 특별 요청사항 기록
                </label>
                <textarea
                  rows={6}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="예: 바다조망 84A 타입 고층 로얄동 선호, 주말 모델하우스 방문상담 요청..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingNotesLead(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300"
                >
                  메모 저장
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Realtime Messenger Notification Settings (Telegram & Google Chat) */}
        {showChatSettings && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-4 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      실시간 메신저 알림 연동 설정
                    </h4>
                    <p className="text-xs text-slate-400">
                      신규 관심고객 접수 및 홍보관 방문예약 시 스마트폰으로 즉시 알림
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChatSettings(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveNotificationTab('telegram')}
                  className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeNotificationTab === 'telegram'
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>텔레그램 (무료 추천 ⭐)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNotificationTab('googleChat')}
                  className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeNotificationTab === 'googleChat'
                      ? 'bg-blue-600 text-white font-bold shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Google Chat (기업용)</span>
                </button>
              </div>

              {/* TAB 1: TELEGRAM SETTINGS */}
              {activeNotificationTab === 'telegram' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-sky-950/40 border border-sky-800/60 rounded-2xl p-3.5 text-xs text-sky-200 leading-relaxed space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-sky-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>개인 계정도 1분 만에 100% 무료 연동 가능한 텔레그램 알림</span>
                    </p>
                    <p className="text-[11px] text-slate-300 break-keep">
                      구글 정책과 무관하게 개인 스마트폰 텔레그램 앱으로 손님의 성함, 연락처, 방문일시를 1초 만에 받아보실 수 있습니다.
                    </p>
                  </div>

                  {/* Toggle Active */}
                  <div className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <div>
                      <span className="text-xs font-semibold text-white block">텔레그램 실시간 알림 발송</span>
                      <span className="text-[11px] text-slate-400 block">고객 신청서 제출 시 관리자에게 즉시 메시지 발송</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={telegramConfig.enabled}
                        onChange={(e) => setTelegramConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                    </label>
                  </div>

                  {/* Bot Token Input */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      1. 텔레그램 봇 토큰 (Bot Token) <span className="text-sky-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={telegramConfig.botToken}
                      onChange={(e) => setTelegramConfig(prev => ({ ...prev, botToken: e.target.value }))}
                      placeholder="예: 7123456789:AAHk..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-400 font-mono"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      ※ 텔레그램에서 @BotFather에게 /newbot 명령어로 발급받은 토큰
                    </p>
                  </div>

                  {/* Chat ID Input */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      2. 내 채팅 ID (Chat ID) <span className="text-sky-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={telegramConfig.chatId}
                      onChange={(e) => setTelegramConfig(prev => ({ ...prev, chatId: e.target.value }))}
                      placeholder="예: 123456789 (숫자)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-400 font-mono"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      ※ 텔레그램에서 @userinfobot에게 받은 나의 고유 숫자 ID
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleTestTelegram}
                      disabled={isTestingTelegram || !telegramConfig.botToken || !telegramConfig.chatId}
                      className="flex-1 py-2.5 px-3 bg-sky-900/60 hover:bg-sky-800 border border-sky-700 text-sky-200 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isTestingTelegram ? '전송 중...' : '테스트 알림 즉시 발송'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveTelegram}
                      className="py-2.5 px-5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      설정 저장하기
                    </button>
                  </div>

                  {/* Batch Send for Existing Unsent Leads */}
                  <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                      <div>
                        <span className="font-bold text-white block">기존 고객DB 텔레그램 발송 이력 관리</span>
                        <span className="text-[11px] text-slate-400">
                          전체 {leads.length}명 중 텔레그램 미발송 고객: <strong className={unsentCount > 0 ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>{unsentCount}명</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSendAllUnsent}
                        disabled={isSendingUnsent || unsentCount === 0 || !telegramConfig.botToken || !telegramConfig.chatId}
                        className="py-2 px-3.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {isSendingUnsent
                            ? `발송 중 (${unsentProgress?.current}/${unsentProgress?.total})...`
                            : `미발송 ${unsentCount}건 텔레그램 일괄 전송`}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 3-Step Guide */}
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-[11px] space-y-2 text-slate-300">
                    <p className="font-bold text-sky-400 flex items-center gap-1">
                      <span>📖 텔레그램 2분 초간단 설정 순서</span>
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-400 leading-relaxed">
                      <li>
                        텔레그램 검색창에 <code className="text-white bg-slate-800 px-1 py-0.5 rounded">@BotFather</code> 검색 ➔ 대화방에서 <code className="text-amber-300">/newbot</code> 입력 ➔ 봇 이름 & 아이디(영문_bot) 입력 ➔ 발급된 <strong>HTTP API 토큰</strong> 복사
                      </li>
                      <li>
                        텔레그램 검색창에 <code className="text-white bg-slate-800 px-1 py-0.5 rounded">@userinfobot</code> 검색 ➔ 아무 글자나 보내고 표시되는 <strong>Id(숫자)</strong> 복사
                      </li>
                      <li className="text-amber-300 font-semibold">
                        ⚠️ 1단계에서 만든 내 봇 대화방으로 들어가 하단의 [시작(Start)] 버튼을 꼭 눌러주세요! (눌러야 봇이 메시지를 보낼 수 있습니다)
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {/* TAB 2: GOOGLE CHAT SETTINGS */}
              {activeNotificationTab === 'googleChat' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-3 text-xs text-amber-200 leading-relaxed space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Google Workspace 기업용 계정 전용 안내</span>
                    </p>
                    <p className="text-[11px] text-slate-300 break-keep">
                      구글 공식 정책상 인커밍 웹훅은 유료 Google Workspace 계정에서만 생성 가능합니다. 일반 @gmail.com 계정은 상단의 <strong>[텔레그램]</strong> 탭을 이용해 주세요.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Google Chat Webhook URL
                    </label>
                    <input
                      type="url"
                      value={chatWebhookUrl}
                      onChange={(e) => setChatWebhookUrl(e.target.value)}
                      placeholder="https://chat.googleapis.com/v1/spaces/.../messages?key=...&token=..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-400 font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleTestGoogleChat}
                      disabled={isTestingChat}
                      className="flex-1 py-2 px-3 bg-blue-900/60 hover:bg-blue-800 border border-blue-700 text-blue-200 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isTestingChat ? '전송 중...' : '구글챗 테스트 전송'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveChatWebhook}
                      className="py-2 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      저장하기
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-800 pt-3 flex justify-end">
                <button
                  onClick={() => setShowChatSettings(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition-colors cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 text-center sm:text-left break-keep">
            ※ 실시간 고객 데이터는 Firestore와 연동되어 신규 접수 및 예약 시 즉시 갱신됩니다.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSaveToDrive}
              disabled={driveSaving || leads.length === 0}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-blue-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              title="Google Drive에 CSV 백업"
            >
              <HardDrive className="w-4 h-4 text-blue-400" />
              <span>{driveSaving ? 'Drive 저장 중...' : 'Drive 백업'}</span>
            </button>
            <button
              onClick={handleExportCSV}
              disabled={leads.length === 0}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>엑셀 다운로드</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
