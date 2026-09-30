import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseAuth';
import { DEFAULT_PROMO_CONFIG, SitePromoVideoConfig, extractGoogleDriveFileId } from '../config/videoConfig';

const COLLECTION_NAME = 'siteSettings';
const DOC_ID = 'promoVideo';
const LOCAL_STORAGE_KEY = 'dadaepo_promo_video_config';

/**
 * Get cached config from localStorage
 */
export function getLocalPromoVideoConfig(): SitePromoVideoConfig {
  if (typeof window === 'undefined') return DEFAULT_PROMO_CONFIG;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse local video config:', e);
  }
  return DEFAULT_PROMO_CONFIG;
}

/**
 * Save config to localStorage
 */
export function setLocalPromoVideoConfig(config: SitePromoVideoConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save local video config:', e);
  }
}

/**
 * Fetch shared video config from Firestore
 */
export async function fetchSharedPromoVideoConfig(): Promise<SitePromoVideoConfig> {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<SitePromoVideoConfig>;
      const config: SitePromoVideoConfig = {
        videoUrl: data.videoUrl || DEFAULT_PROMO_CONFIG.videoUrl,
        videoTitle: data.videoTitle || DEFAULT_PROMO_CONFIG.videoTitle,
        isGoogleDrive: !!data.isGoogleDrive,
        driveFileId: data.driveFileId,
        updatedAt: data.updatedAt,
      };
      setLocalPromoVideoConfig(config);
      return config;
    }
  } catch (error) {
    console.warn('Failed to fetch video config from Firestore, fallback to local:', error);
  }
  return getLocalPromoVideoConfig();
}

/**
 * Save shared video config to Firestore and localStorage
 */
export async function saveSharedPromoVideoConfig(
  urlOrLink: string,
  title?: string
): Promise<SitePromoVideoConfig> {
  const driveFileId = extractGoogleDriveFileId(urlOrLink);
  const isDrive = !!driveFileId;
  const config: SitePromoVideoConfig = {
    videoUrl: urlOrLink.trim(),
    videoTitle: title || (isDrive ? '구글 드라이브 공식 홍보영상' : '공식 브랜드 홍보영상'),
    isGoogleDrive: isDrive,
    driveFileId: driveFileId || undefined,
    updatedAt: new Date().toISOString(),
  };

  // 1. Save local
  setLocalPromoVideoConfig(config);

  // 2. Save to Firestore for all visitors
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    await setDoc(docRef, config);
  } catch (error) {
    console.warn('Failed to save video config to Firestore:', error);
  }

  return config;
}

/**
 * Subscribe to realtime updates for the promotional video config
 */
export function subscribePromoVideoConfig(
  onUpdate: (config: SitePromoVideoConfig) => void
): () => void {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<SitePromoVideoConfig>;
          const config: SitePromoVideoConfig = {
            videoUrl: data.videoUrl || DEFAULT_PROMO_CONFIG.videoUrl,
            videoTitle: data.videoTitle || DEFAULT_PROMO_CONFIG.videoTitle,
            isGoogleDrive: !!data.isGoogleDrive,
            driveFileId: data.driveFileId,
            updatedAt: data.updatedAt,
          };
          setLocalPromoVideoConfig(config);
          onUpdate(config);
        }
      },
      (err) => {
        console.warn('Video config subscription notice:', err);
      }
    );
  } catch (e) {
    console.warn('Subscription setup error:', e);
    return () => {};
  }
}
