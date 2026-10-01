# 세션 및 작업 이력 관리 대장 (Session History Log)

---

### [Session 1] 초기 구축 및 다대포 랜드마크 조감도 홍보관 인터페이스
* **수행 작업**:
  - 다대포 오션시티 프레스티지(986세대, 39층 타워, 1호선 다대포항역 1분) 브랜드 아이덴티티 구축.
  - 인터랙티브 360° 항공 조감도 핫스팟 시스템 구현 (다대포 해수욕장, 다대포항역, 꿈의 낙조분수 등).
  - 4개 평형(59㎡, 84㎡A, 84㎡B, 128㎡ 펜트하우스) 2D/3D 평면도 및 자금 조달 계산기 개발.
  - Firebase Authentication 및 Firestore 데이터베이스 연동.

---

### [Session 2] VIP 관심고객 접수 & 관리자 CRM 대시보드 구축
* **수행 작업**:
  - `interestRegistrations` 컬렉션 설계 및 보안 규칙 배포 (`flatdnc@gmail.com` 관리자 권한 부여).
  - 웹 오디오(Web Audio API) 기반 신규 고객 접수 띵동 차임벨 알림 사운드 구현.
  - 실시간 Firestore 리스너(`onSnapshot`)를 활용한 관리자 대시보드 구축 (상태 변경, 메모, 엑셀/CSV 추출, 원클릭 전화/문자 연동).
  - Google Drive REST API 연동 및 공식 자료실 폴더 자동 생성.

---

### [Session 3] 동영상 배포 도메인 재생 오류 해결
* **문제 상황**:
  - 미리보기 환경에서는 동영상이 재생되나, 깃허브 푸시 후 실제 도메인(`dadeapo.ai.studio`) 접속 시 영상이 재생되지 않고 "업로드 안내 창"이 표시됨.
* **근본 원인**:
  1. 브라우저 파일 업로드는 임시 Blob URL(`blob:http://...`)로만 남아 Git 저장소에 파일이 포함되지 않음.
  2. 영상 소스 누락 시 대체 화면이 빈 업로드 버튼으로 설정되어 있었음.
  3. 도메인(`dadeapo.ai.studio`)에 최신 빌드가 재배포되지 않아 구 빌드가 서빙됨.
* **해결 조치**:
  1. `src/assets/videos/dadaepo_promo_brand_video.mp4`를 Vite 번들러 파이프라인에 직접 임포트하여 `dist/assets/`에 영구 패키징.
  2. `PromoVideoSection.tsx`에서 업로드 대기 화면을 제거하고, 기본 영상 또는 구글 드라이브 임베드가 무조건 즉시 재생되도록 개편.
  3. `siteConfigService.ts`를 신설하여 구글 드라이브 공유 링크 등록 시 Firestore(`siteSettings/promoVideo`)에 저장 및 전 방문자 실시간 동기화.
  4. `firestore.rules` 업데이트(siteSettings 읽기 허용) 및 배포 완료.

---

### [Session 4] 구글 챗(Google Chat) 고객DB 실시간 웹훅 연동 및 가이드
* **수행 작업**:
  - 구글 챗 Incoming Webhook을 통한 Cards V2 알림 발송 서비스(`googleChatService.ts`) 보강.
  - 관리자가 입력한 Webhook URL을 Firestore(`siteSettings/integrations`)에 저장하여 모든 접속자의 신청 건이 관리자 채팅방으로 전송되도록 구조화.

---

### [Session 5] 텔레그램(Telegram) 실시간 알림 연동 시스템 구축 (개인 무료 계정 완벽 지원)
* **배경**:
  - Google 공식 정책상 Google Chat 웹훅은 유료 Google Workspace 계정 전용 기능으로, 일반 개인 계정(`@gmail.com`)에서는 웹훅 생성이 비활성화됨.
* **해결 조치**:
  - 개인 계정 제한이 없고 평생 무료인 텔레그램 Bot API 실시간 알림 시스템(`telegramService.ts`) 신규 개발.
  - 고객 신청 시 성함, 연락처, 희망평형, 방문예약일시를 정형화된 HTML 카드로 텔레그램 봇이 1초 만에 전송.
  - 관리자 대시보드 상단에 [실시간 메신저 알림] 모달 개편 (텔레그램 설정 탭 + Google Chat 탭 듀얼 지원).
  - 봇 토큰 및 채팅 ID를 Firestore(`siteSettings/integrations`)에 영구 저장하여 모든 기기/도메인에서 실시간 동기화.
  - [테스트 알림 즉시 발송] 버튼 탑재 및 초보자를 위한 3단계 안내 가이드 내장.

---

### [Session 6] 고객DB 발송 이력 관리 및 기존 미발송 고객 일괄 전송 기능 구현
* **요청 사항**:
  - 메세지를 보냈는지 이력을 체크하여, 보낸 이력이 없는 신규 고객에게만 자동 발송되도록 보장.
  - 기존에 등록되어 있는 관리DB 고객 중 텔레그램으로 보낸 이력이 없는 고객들을 찾아 손쉽게 발송할 수 있도록 개선.
* **해결 조치**:
  - `StoredInterestRegistration`에 `telegramNotified?: boolean`, `telegramNotifiedAt?: string` 필드 도입.
  - 고객 신청 시 텔레그램 발송 성공 여부를 검증하고 Firestore/로컬스토리지에 발송 이력(`telegramNotified: true`) 자동 기록.
  - 관리자 대시보드 상단에 **[미발송 고객 알림 배너]** 신설 (미발송 N명 표시 + 원클릭 전체 전송 버튼).
  - 카드형 / 테이블형 / 방문일정표 각 행마다 **[텔레그램 발송완료 / 미발송 상태 뱃지]** 및 **[텔레그램 발송 / 재전송 버튼]** 탑재.
  - `sendAllUnsentLeads()` 함수를 통해 API 부하 방지 딜레이를 두며 기존 미발송 고객 전체를 안전하게 일괄 전송하도록 구현.
  - 메신저 설정 모달 내에도 **[기존 고객DB 텔레그램 발송 이력 관리 카드]** 추가.

---

### 🚀 현재 프로젝트 상태 (Current Status)
* **빌드 상태**: 정상 (`npm run build` 완료, `dist/` 산출물 최신화)
* **타입스크립트 검사**: 통과 (`tsc --noEmit` 무결점)
* **배포 권장 사항**:
  - 코드베이스 작업 완료 상태이므로, AI Studio 상단 **[Deploy / Publish]** 버튼을 눌러 최신 번들을 `https://dadeapo.ai.studio/`에 배포하거나, GitHub에 최신 커밋을 푸시하시면 모든 변경 사항이 운영 도메인에 완벽히 반영됩니다.
