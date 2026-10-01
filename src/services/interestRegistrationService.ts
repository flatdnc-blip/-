import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './firebaseAuth';
import { uploadFileToDrive, getOrCreateApartmentFolder } from './googleDriveService';
import { sendLeadToGoogleChat } from './googleChatService';
import { sendLeadToTelegram } from './telegramService';

export interface StoredInterestRegistration {
  id: string;
  name: string;
  phone: string;
  unitType: string;
  primaryInterest: string;
  status: '접수대기' | '상담완료' | '부재' | '보류';
  registrationCode: string;
  wantsOceanView: boolean;
  createdAt: string;
  notes?: string;
  visitDate?: string;
  visitTime?: string;
  telegramNotified?: boolean;
  telegramNotifiedAt?: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const COLLECTION_NAME = 'interestRegistrations';
const LOCAL_STORAGE_KEY = 'dadaepo_backup_inquiries';
const NOTIFICATION_SOUND_ENABLED_KEY = 'dadaepo_notification_sound';

// Play pleasant web audio chime for new incoming lead
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Note 1: E5 (659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.35);

    // Note 2: B5 (987.77Hz) after 120ms
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.18, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (e) {
    // Audio context may be restricted by autoplay policy
  }
}

/**
 * Request Browser Notification API Permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Failed to request notification permission:', err);
    return 'denied';
  }
}

/**
 * Send Browser Notification for newly received VIP customer lead
 */
export function sendLeadNotification(lead: StoredInterestRegistration) {
  playNotificationChime();

  // Dispatch custom in-app messenger event for toast UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('new-lead-registered', {
        detail: lead,
      })
    );
  }

  // Native Browser Notification API
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const typeLabel = lead.unitType === '59' ? '59㎡' : lead.unitType === '84A' ? '84㎡A' : lead.unitType === '84B' ? '84㎡B' : lead.unitType === '128' ? '128㎡' : lead.unitType;
      const interestLabel = lead.primaryInterest === 'ocean' ? '바다조망' : lead.primaryInterest === 'transit' ? '초역세권' : lead.primaryInterest === 'investment' ? '투자/가치' : '단지편의';

      const notif = new Notification('🔔 [다대포 오션시티] 신규 VIP 관심고객 접수!', {
        body: `고객명: ${lead.name} (${lead.phone})\n희망평형: ${typeLabel} | 관심: ${interestLabel}\n접수코드: ${lead.registrationCode}`,
        tag: lead.id,
        requireInteraction: false,
      });

      notif.onclick = () => {
        window.focus();
        window.dispatchEvent(new CustomEvent('open-admin-lead-dashboard'));
        notif.close();
      };
    } catch (e) {
      console.warn('Browser notification error:', e);
    }
  }
}

// Local storage helpers
function saveToLocalStorage(record: StoredInterestRegistration) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing: StoredInterestRegistration[] = raw ? JSON.parse(raw) : [];
    const updated = [record, ...existing.filter((item) => item.id !== record.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

export function getFromLocalStorage(): StoredInterestRegistration[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Submit a new VIP Interest Registration to Firestore and broadcast notification
 */
export async function submitInterestRegistration(data: {
  name: string;
  phone: string;
  unitType: string;
  primaryInterest: string;
  wantsOceanView: boolean;
  visitDate?: string;
  visitTime?: string;
}): Promise<StoredInterestRegistration> {
  const code = 'VIP-' + Math.floor(100000 + Math.random() * 900000);
  const id = 'reg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const record: StoredInterestRegistration = {
    id,
    name: data.name.trim(),
    phone: data.phone.trim(),
    unitType: data.unitType,
    primaryInterest: data.primaryInterest,
    status: '접수대기',
    registrationCode: code,
    wantsOceanView: data.wantsOceanView,
    createdAt: now,
    notes: '',
    visitDate: data.visitDate || '',
    visitTime: data.visitTime || '',
    telegramNotified: false,
  };

  // 1. Save to local storage
  saveToLocalStorage(record);

  // 2. Trigger notification
  sendLeadNotification(record);

  // 2.1 Send Google Chat message to admin (if configured)
  sendLeadToGoogleChat(record).catch((e) => console.warn('Google Chat dispatch error:', e));

  // 2.2 Send Telegram message to admin (if configured) and update status
  try {
    const telegramRes = await sendLeadToTelegram(record);
    if (telegramRes && telegramRes.success) {
      record.telegramNotified = true;
      record.telegramNotifiedAt = new Date().toISOString();
      saveToLocalStorage(record);
    }
  } catch (e) {
    console.warn('Telegram dispatch error:', e);
  }

  // 3. Save to Firestore
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, record);
    return record;
  } catch (error) {
    console.warn('Firestore write failed, fallback to local storage:', error);
    return record;
  }
}

/**
 * Fetch all interested registrations (Admin only)
 */
export async function fetchAllRegistrations(): Promise<StoredInterestRegistration[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const remoteList: StoredInterestRegistration[] = [];
    snapshot.forEach((d) => {
      remoteList.push(d.data() as StoredInterestRegistration);
    });

    if (remoteList.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remoteList));
      return remoteList;
    }
    return getFromLocalStorage();
  } catch (error) {
    console.warn('Firestore fetch failed, returning local cached list:', error);
    return getFromLocalStorage();
  }
}

/**
 * Subscribe to Real-Time Interest Registrations Updates from Firestore (onSnapshot)
 * Supports instant auto-updating for admin dashboard + new lead alert
 */
export function subscribeToInterestRegistrations(
  onUpdate: (leads: StoredInterestRegistration[], newLead?: StoredInterestRegistration) => void
): () => void {
  let isInitial = true;
  let prevCount = 0;

  // Initial load from local cache
  const cached = getFromLocalStorage();
  prevCount = cached.length;
  onUpdate(cached);

  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));

  let unsubscribeFirestore = () => {};

  try {
    unsubscribeFirestore = onSnapshot(
      q,
      (snapshot) => {
        const remoteList: StoredInterestRegistration[] = [];
        let newlyAddedLead: StoredInterestRegistration | undefined;

        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && !isInitial) {
            newlyAddedLead = change.doc.data() as StoredInterestRegistration;
          }
        });

        snapshot.forEach((d) => {
          remoteList.push(d.data() as StoredInterestRegistration);
        });

        isInitial = false;

        if (remoteList.length > 0) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remoteList));
          if (newlyAddedLead) {
            sendLeadNotification(newlyAddedLead);
          }
          onUpdate(remoteList, newlyAddedLead);
        }
      },
      (error) => {
        console.warn('Real-time listener notice (unauthenticated fallback to local events):', error.message);
        // Fallback to local storage if Firestore permission denied for non-admin
      }
    );
  } catch (err) {
    console.warn('onSnapshot setup fallback:', err);
  }

  // Cross-tab and in-memory event listener
  const handleLocalLeadEvent = (e: Event) => {
    const customEvent = e as CustomEvent<StoredInterestRegistration>;
    const updated = getFromLocalStorage();
    onUpdate(updated, customEvent.detail);
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_KEY) {
      const updated = getFromLocalStorage();
      onUpdate(updated);
    }
  };

  window.addEventListener('new-lead-registered', handleLocalLeadEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    unsubscribeFirestore();
    window.removeEventListener('new-lead-registered', handleLocalLeadEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}

/**
 * Update registration status and counselor notes
 */
export async function updateRegistrationStatus(
  id: string, 
  status: StoredInterestRegistration['status'],
  notes?: string
): Promise<void> {
  const localList = getFromLocalStorage();
  const updatedList = localList.map((item) => 
    item.id === id ? { ...item, status, ...(notes !== undefined ? { notes } : {}) } : item
  );
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));

  // Notify listeners
  window.dispatchEvent(new CustomEvent('new-lead-registered', { detail: updatedList.find(i => i.id === id) }));

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { 
      status, 
      ...(notes !== undefined ? { notes } : {}) 
    });
  } catch (error) {
    console.warn('Firestore update failed:', error);
  }
}

/**
 * Update notification status on a lead (marks telegramNotified: true)
 */
export async function updateLeadNotificationStatus(
  id: string,
  telegramNotified: boolean,
  telegramNotifiedAt?: string
): Promise<void> {
  const timestamp = telegramNotifiedAt || new Date().toISOString();
  const localList = getFromLocalStorage();
  const updatedList = localList.map((item) => 
    item.id === id ? { ...item, telegramNotified, telegramNotifiedAt: timestamp } : item
  );
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));

  window.dispatchEvent(new CustomEvent('new-lead-registered'));

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { 
      telegramNotified, 
      telegramNotifiedAt: timestamp 
    });
  } catch (error) {
    console.warn('Firestore updateLeadNotificationStatus failed:', error);
  }
}

/**
 * Send a specific lead to Telegram and mark it notified in DB
 */
export async function sendLeadTelegramAndMark(
  lead: StoredInterestRegistration
): Promise<{ success: boolean; message: string }> {
  const res = await sendLeadToTelegram(lead);
  if (res.success) {
    await updateLeadNotificationStatus(lead.id, true, new Date().toISOString());
  }
  return res;
}

/**
 * Batch send Telegram messages for all unsent leads in DB
 */
export async function sendAllUnsentLeads(
  leads: StoredInterestRegistration[],
  onProgress?: (current: number, total: number) => void
): Promise<{ total: number; sent: number; failed: number }> {
  const unsent = leads.filter(l => !l.telegramNotified);
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < unsent.length; i++) {
    const lead = unsent[i];
    if (onProgress) {
      onProgress(i + 1, unsent.length);
    }
    const res = await sendLeadTelegramAndMark(lead);
    if (res.success) {
      sent++;
    } else {
      failed++;
    }
    // Small 300ms pause to respect Telegram API rate limits
    await new Promise(r => setTimeout(r, 300));
  }

  return { total: unsent.length, sent, failed };
}

/**
 * Delete registration (Admin only)
 */
export async function deleteRegistration(id: string): Promise<void> {
  const localList = getFromLocalStorage();
  const filtered = localList.filter((item) => item.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));

  window.dispatchEvent(new CustomEvent('new-lead-registered'));

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore delete failed:', error);
  }
}

/**
 * Export registrations to CSV string with UTF-8 BOM (Korean Excel compatible)
 */
export function generateRegistrationsCSV(records: StoredInterestRegistration[]): string {
  const headers = ['접수코드', '성명', '연락처', '희망평형', '관심분야', '방문예약일자', '방문예약시간', '오션뷰선호', '상태', '접수일시', '상담메모'];
  const rows = records.map((r) => [
    r.registrationCode || '',
    `"${r.name.replace(/"/g, '""')}"`,
    `"${r.phone.replace(/"/g, '""')}"`,
    r.unitType || '',
    r.primaryInterest || '',
    r.visitDate || '미정',
    r.visitTime || '미정',
    r.wantsOceanView ? '예' : '아니오',
    r.status || '접수대기',
    r.createdAt ? new Date(r.createdAt).toLocaleString('ko-KR') : '',
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  return '\uFEFF' + csvContent; // UTF-8 BOM for Microsoft Excel
}

/**
 * Trigger CSV file download in browser
 */
export function downloadRegistrationsAsCSV(records: StoredInterestRegistration[]): void {
  const csv = generateRegistrationsCSV(records);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `다대포_오션시티_프레스티지_관심고객명단_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Save registrations CSV directly into Google Drive
 */
export async function saveRegistrationsCSVToDrive(records: StoredInterestRegistration[]): Promise<string> {
  const csv = generateRegistrationsCSV(records);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const folderId = await getOrCreateApartmentFolder();
  const fileName = `관심고객명단_DB_${new Date().toISOString().slice(0, 10)}.csv`;
  await uploadFileToDrive(fileName, blob, folderId, '실시간 분양상담 관심고객 접수 명단 (CSV)');
  return fileName;
}
