# 다대포 오션시티 프레스티지 (Dadaepo Ocean City Prestige)
## 📌 프로젝트 종합 컨텍스트 및 아키텍처 인수인계 문서

---

### 1. 기본 메타데이터 및 환경 정보
* **프로젝트명**: 다대포 오션시티 프레스티지 조감도 홍보관
* **Applet ID**: `9a146f38-fe92-4138-a716-9cf3f937a00c`
* **운영/배포 도메인**: `https://dadeapo.ai.studio/`
* **개발 서버 URL**: `https://ais-dev-llsqufsxxls2h2vizapy5w-352695920491.asia-east1.run.app`
* **최고 관리자 계정**: `flatdnc@gmail.com`
* **Firebase 프로젝트 ID**: `analytical-basis-qv9wh`
* **Firestore 데이터베이스 ID**: `ai-studio-9a146f38-fe92-4138-a716-9cf3f937a00c`
* **OAuth 클라이언트 ID**: `974415515221-2j8nrak3ss69qt16ro4aker3c3919d8l.apps.googleusercontent.com`

---

### 2. 기술 스택 및 라이브러리
* **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Motion, Lucide React, Canvas-Confetti
* **Backend & DB**: Cloud Firestore, Firebase Authentication (Google Auth + Drive OAuth Scope)
* **외부 연동**: Google Drive REST API v3, Google Chat Incoming Webhook (Cards V2)
* **빌드 시스템**: `vite build` (`npm run build`), 산출물 경로: `/dist`

---

### 3. 데이터베이스 스키마 및 보안 규칙 (`firestore.rules`)

#### ① `interestRegistrations/{registrationId}` (VIP 관심고객 및 방문예약 DB)
* **문서 필드**:
  - `id`: 고유 식별자 (`inq_...`)
  - `name`: 고객 성명
  - `phone`: 연락처
  - `unitType`: 희망 평형 (`59`, `84A`, `84B`, `128`)
  - `primaryInterest`: 관심 요소 (`ocean`, `transit`, `complex`)
  - `wantsOceanView`: 바다 조망 희망 여부 (boolean)
  - `status`: 상담 상태 (`접수대기`, `상담예정`, `상담완료`, `부재중`, `계약진행`)
  - `registrationCode`: 고객 확인용 접수코드 (예: `VIP-729401`)
  - `visitDate`: 홍보관 방문 희망일 (YYYY-MM-DD)
  - `visitTime`: 방문 시간대 (예: `14:00 - 15:00`)
  - `notes`: 관리자 메모
  - `createdAt`: 접수 타임스탬프 (ISO 8601)
* **보안 권한**:
  - `create`: 모든 방문자 허용 (유효성 검사 적용)
  - `read`, `update`, `delete`: 최고 관리자(`flatdnc@gmail.com`)만 허용

#### ② `siteSettings/{settingId}` (사이트 전역 공유 설정)
* **주요 문서 ID**:
  - `promoVideo`: `{ videoUrl, videoTitle, isGoogleDrive, driveFileId, updatedAt }`
  - `integrations`: `{ googleChatWebhookUrl, updatedAt }`
* **보안 권한**:
  - `read`: 누구나 읽기 허용 (GitHub 배포 도메인 및 일반 방문자 공유용)
  - `write`: 관리자(`flatdnc@gmail.com`)만 수정 허용

---

### 4. 주요 서비스 모듈 및 핵심 로직 구조

```
src/
├── config/
│   └── videoConfig.ts          # 기본 비디오 번들 import, 구글 드라이브 URL 변환 유틸
├── services/
│   ├── firebaseAuth.ts         # Firebase/Firestore 초기화 및 Google Drive OAuth 스코프
│   ├── googleDriveService.ts   # Google Drive 폴더 생성, 파일 업로드, 파일 목록 조회
│   ├── googleChatService.ts    # Google Chat Webhook 실시간 카드 알림 전송 및 Firestore 연동
│   ├── siteConfigService.ts    # Firestore 기반 비디오/웹훅 전역 동기화 서비스
│   └── interestRegistrationService.ts # 고객 접수, Firestore 저장, Web Audio 알림음
├── components/
│   ├── PromoVideoSection.tsx   # 고화질 홍보영상 플레이어 (HTML5 + Drive Iframe 이중 지원)
│   ├── AdminLeadDashboardModal.tsx # 고객DB 관리, 엑셀 다운로드, Google Chat 웹훅 설정
│   ├── InterestRegistrationModal.tsx # VIP 관심고객/방문예약 접수 모달
│   └── ... (평면도, 드론 조감도, 커뮤니티 안내 등)
└── data/
    └── apartmentData.ts        # 단지 정보, 핫스팟 좌표, 평형별 스펙 데이터
```

---

### 5. 핵심 연동 기능 명세

#### (1) 공식 홍보영상 자동 재생 및 구글 드라이브 연동 (`PromoVideoSection.tsx`)
* **기본 모드**: `src/assets/videos/dadaepo_promo_brand_video.mp4`를 Vite 번들러가 직접 임포트하여 `dist/assets/`에 패키징. 어떤 도메인에서도 업로드 창 없이 즉시 자동 재생.
* **클라우드 공유 모드**: 관리자가 구글 드라이브 링크를 입력하면 `siteSettings/promoVideo`에 저장되어 배포 도메인의 모든 방문자에게 실시간 적용.
* **구글 드라이브 임베드**: `https://drive.google.com/file/d/{id}/preview` 형태로 변환되어 무제한 스트리밍 재생.

#### (2) 구글 채팅(Google Chat) 고객DB 실시간 푸시 알림 (`googleChatService.ts`)
* 고객이 방문예약 또는 관심고객을 접수하면, 즉시 구글 챗 스페이스의 Incoming Webhook으로 알림 카드(Cards V2) 발송.
* Webhook URL은 `siteSettings/integrations`에 저장되어 관리자가 한 번만 등록하면 모든 방문자의 접수 건이 관리자 구글 채팅방으로 즉시 전송.

---

### 6. 유지보수 및 배포 가이드라인
1. **코드 변경 후 배포**:
   - `npm run build` 실행 시 `dist/`에 최신 번들 파일이 생성됩니다.
   - AI Studio 우측 상단 **[Deploy] / [Publish]** 버튼 또는 GitHub Push를 통해 배포 도메인에 반영합니다.
2. **보안 규칙 수정 시**:
   - `firestore.rules` 파일 편집 후 `deploy_firebase` 툴을 통해 Firebase 클라우드에 배포합니다.
