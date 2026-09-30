import defaultPromoVideo from '../assets/videos/dadaepo_promo_brand_video.mp4';

export interface SitePromoVideoConfig {
  videoUrl: string;
  videoTitle: string;
  isGoogleDrive: boolean;
  driveFileId?: string;
  updatedAt?: string;
}

export const DEFAULT_PROMO_CONFIG: SitePromoVideoConfig = {
  videoUrl: defaultPromoVideo,
  videoTitle: '다대포 오션시티 프레스티지 공식 홍보영상',
  isGoogleDrive: false,
};

// Extract Google Drive File ID from any Google Drive sharing link
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url) return null;
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1 && match1[1]) return match1[1];
  const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match2 && match2[1]) return match2[1];
  const match3 = url.match(/\/open\?id=([a-zA-Z0-9_-]+)/);
  if (match3 && match3[1]) return match3[1];
  return null;
}

// Convert Google Drive link to streaming preview embed URL
export function toGoogleDriveEmbedUrl(urlOrId: string): string {
  const fileId = extractGoogleDriveFileId(urlOrId) || urlOrId;
  return `https://drive.google.com/file/d/${fileId}/preview`;
}
