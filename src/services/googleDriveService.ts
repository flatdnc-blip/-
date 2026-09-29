import { getAccessToken } from './firebaseAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
}

const FOLDER_NAME = '다대포 오션시티 프레스티지 분양자료';

/**
 * Find or create dedicated folder in user's Google Drive
 */
export async function getOrCreateApartmentFolder(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('Google 로그인이 필요합니다.');

  // Search for folder
  const query = `mimeType = 'application/vnd.google-apps.folder' and name = '${FOLDER_NAME}' and trashed = false`;
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id, name)`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!searchRes.ok) {
    const err = await searchRes.json().catch(() => ({}));
    throw new Error(err.error?.message || '구글 드라이브 폴더 검색 실패');
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: '다대포 오션시티 프레스티지 아파트 홍보 조감도, 카탈로그 및 분양 자료 보관함',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || '구글 드라이브 폴더 생성 실패');
  }

  const folderData = await createRes.json();
  return folderData.id;
}

/**
 * List files in the apartment folder or general Drive
 */
export async function listDriveFiles(folderId?: string): Promise<DriveFileItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Google 로그인이 필요합니다.');

  let query = 'trashed = false';
  if (folderId) {
    query += ` and '${folderId}' in parents`;
  }

  const fields = 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, iconLink, thumbnailLink)';
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=createdTime desc&pageSize=50&fields=${encodeURIComponent(fields)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || '구글 드라이브 파일 목록 조회 실패');
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Upload file to Google Drive using multipart upload
 */
export async function uploadFileToDrive(
  name: string,
  blob: Blob,
  folderId?: string,
  description?: string
): Promise<DriveFileItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Google 로그인이 필요합니다.');

  const metadata: Record<string, any> = {
    name,
    description: description || '다대포 오션시티 프레스티지 분양 관련 자료',
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
  const mediaHeader = `${delimiter}Content-Type: ${blob.type || 'application/octet-stream'}\r\n\r\n`;

  const blobArrayBuffer = await blob.arrayBuffer();

  const multipartBlob = new Blob(
    [metadataPart, mediaHeader, new Uint8Array(blobArrayBuffer), closeDelimiter],
    { type: `multipart/related; boundary=${boundary}` }
  );

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,createdTime,thumbnailLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBlob,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || '구글 드라이브 파일 업로드 실패');
  }

  return await res.json();
}

/**
 * Delete a file from Google Drive (Mandatory user confirmation handled by UI)
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Google 로그인이 필요합니다.');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || '구글 드라이브 파일 삭제 실패');
  }
}

/**
 * Generate a comprehensive markdown brochure file content
 */
export function generateApartmentBrochureContent(): string {
  return `# 다대포 오션시티 프레스티지 분양 카탈로그 & 입지 분석 리포트

## 1. 사업 개요
- 사업명: 다대포 오션시티 프레스티지
- 대지위치: 부산광역시 사하구 다대로 (부산 1호선 다대포항역 1·2번 출구 바로 앞)
- 건축규모: 지하 3층 ~ 지상 최고 39층, 6개동 랜드마크 타워
- 총 세대수: 986세대 (59㎡, 84㎡A/B, 104㎡, 128㎡ 펜트하우스)
- 주차대수: 세대당 1.68대 (광폭 주차 및 전기차 급속충전 시설)
- 전 세대 바다조망 비율: 약 88% 영구 파노라마 오션뷰 설계

## 2. 4대 핵심 프리미엄 가치
1) **180° 영구 파노라마 바다조망 (다대포 해수욕장 앞)**
   - 부산 3대 선셋 낙조와 은빛 백사장을 거실에서 영구 조망
   - 프레임리스 강화유리 난간대 시공으로 시야 간섭 제로
   - 다대포 해수욕장 도보 3분 (약 250m)

2) **부산도시철도 1호선 다대포항역 도보 1분 (50m 초역세권)**
   - 단지 주출입구 바로 앞 지하철역 출구
   - 서면역, 남포동, KTX 부산역 환승 없는 직통 이동
   - 천마산터널, 을숙도대교, 남항대교 광역 해안순환망 직결
   - 가덕도 신공항 및 도시철도 사상-하단선 연결 호재

3) **원스톱 명품 편의시설 & 하이엔드 커뮤니티**
   - 39층 스카이라운지 & 프라이빗 오션 테라스
   - 오션뷰 피트니스 & 18타석 GDR+ 실내 골프클럽 (스크린 4룸)
   - 호텔식 핀란드 편백나무 건·습식 사우나 & 탄산 온천스파
   - 120m 유러피언 원스톱 스트리트몰 상가 (65개실)
   - 단지 내 국공립 어린이집 & 프리미엄 에듀센터

4) **도심 속 천혜의 자연 힐링 라이프**
   - 14만㎡ 다대포 해변공원 & 솔숲 생태탐방로 (도보 2분)
   - 국가지정 명승 몰운대 유원지 & 해안 둘레길 (차량 3분)
   - 기네스북 등재 다대포 꿈의 낙조분수 (도보 5분)
   - 지상에 차가 없는 100% 공원형 에코 단지 (녹지율 42%)

---
* 분양홍보관 대표번호: 1688-7520
* 본 문서는 Google Drive 클라우드 보관함에 공식 저장된 문서입니다.
`;
}
