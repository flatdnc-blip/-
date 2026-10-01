import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseAuth';
import { StoredInterestRegistration } from './interestRegistrationService';

const TELEGRAM_CONFIG_KEY = 'dadaepo_telegram_config';
const INTEGRATIONS_DOC_ID = 'integrations';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

const DEFAULT_CONFIG: TelegramConfig = {
  botToken: '',
  chatId: '',
  enabled: false,
};

let cachedTelegramConfig: TelegramConfig | null = null;

/**
 * Get stored Telegram configuration (localStorage first, then fallback)
 */
export function getTelegramConfig(): TelegramConfig {
  if (cachedTelegramConfig) return cachedTelegramConfig;
  if (typeof window === 'undefined') return DEFAULT_CONFIG;

  try {
    const raw = localStorage.getItem(TELEGRAM_CONFIG_KEY);
    if (raw) {
      cachedTelegramConfig = JSON.parse(raw);
      return cachedTelegramConfig as TelegramConfig;
    }
  } catch (e) {
    console.warn('Failed to parse local Telegram config:', e);
  }

  return DEFAULT_CONFIG;
}

/**
 * Get stored Telegram configuration asynchronously from Firestore & localStorage
 */
export async function getTelegramConfigAsync(): Promise<TelegramConfig> {
  const local = getTelegramConfig();
  if (local.botToken && local.chatId) {
    return local;
  }

  try {
    const docRef = doc(db, 'siteSettings', INTEGRATIONS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.telegramBotToken && data.telegramChatId) {
        const config: TelegramConfig = {
          botToken: data.telegramBotToken,
          chatId: data.telegramChatId,
          enabled: data.telegramEnabled ?? true,
        };
        cachedTelegramConfig = config;
        if (typeof window !== 'undefined') {
          localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
        }
        return config;
      }
    }
  } catch (e) {
    console.warn('Failed to load Telegram config from Firestore:', e);
  }

  return local;
}

/**
 * Save Telegram configuration to both localStorage and Firestore
 */
export async function saveTelegramConfig(config: TelegramConfig): Promise<void> {
  cachedTelegramConfig = config;
  if (typeof window !== 'undefined') {
    localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
  }

  try {
    const docRef = doc(db, 'siteSettings', INTEGRATIONS_DOC_ID);
    await setDoc(docRef, {
      telegramBotToken: config.botToken.trim(),
      telegramChatId: config.chatId.trim(),
      telegramEnabled: config.enabled,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.warn('Failed to save Telegram config to Firestore:', error);
  }
}

/**
 * Format lead data into beautiful HTML text for Telegram
 */
export function formatLeadTelegramMessage(lead: StoredInterestRegistration): string {
  const typeLabel = 
    lead.unitType === '59' ? '59㎡ (실속 중소형)' : 
    lead.unitType === '84A' ? '84㎡ A (파노라마 오션뷰)' : 
    lead.unitType === '84B' ? '84㎡ B (타워형 2면 개방)' : 
    lead.unitType === '128' ? '128㎡ (펜트하우스)' : lead.unitType;

  const visitInfo = lead.visitDate 
    ? `📅 <b>홍보관 방문예약</b>: <code>${lead.visitDate} (${lead.visitTime || '시간 미지정'})</code>` 
    : '💬 <b>상담 방식</b>: 온라인 / 유선 전화 상담 희망';

  const interestLabel = 
    lead.primaryInterest === 'ocean' ? '바다 영구조망 프리미엄' : 
    lead.primaryInterest === 'transit' ? '다대포항역 1분 초역세권' : '단지 편의시설 / 투자';

  const formattedDate = new Date(lead.createdAt).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return [
    `🏢 <b>[다대포 오션시티 프레스티지]</b>`,
    lead.visitDate ? `🔔 <b>홍보관 방문예약 신청 접수!</b>` : `📋 <b>신규 VIP 관심고객 접수!</b>`,
    ``,
    `👤 <b>고객 성명</b>: <b>${lead.name}</b> 님`,
    `📞 <b>연락처</b>: <a href="tel:${lead.phone}">${lead.phone}</a>`,
    `🏷️ <b>접수 코드</b>: <code>${lead.registrationCode}</code>`,
    `🏠 <b>희망 평형</b>: ${typeLabel}`,
    `✨ <b>주요 관심</b>: ${interestLabel}`,
    visitInfo,
    lead.notes ? `📝 <b>메모</b>: ${lead.notes}` : '',
    ``,
    `⏰ <b>접수 일시</b>: ${formattedDate}`,
    `🔗 <i>실시간 상담 및 고객 관리는 다대포 관리자 대시보드에서 확인하실 수 있습니다.</i>`
  ].filter(Boolean).join('\n');
}

/**
 * Send lead notification to Telegram via Bot API
 */
export async function sendLeadToTelegram(
  lead: StoredInterestRegistration,
  customConfig?: TelegramConfig
): Promise<{ success: boolean; message: string }> {
  let config = customConfig || getTelegramConfig();

  if (!config.botToken || !config.chatId) {
    config = await getTelegramConfigAsync();
  }

  // If not enabled or no token, silently return
  if (!config.enabled || !config.botToken || !config.chatId) {
    return {
      success: false,
      message: '텔레그램 봇 토큰 또는 채팅 ID가 설정되지 않았습니다.',
    };
  }

  const messageText = formatLeadTelegramMessage(lead);

  try {
    const url = `https://api.telegram.org/bot${config.botToken.trim()}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.chatId.trim(),
        text: messageText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, message: '텔레그램으로 실시간 알림이 발송되었습니다.' };
    } else {
      console.warn('Telegram API Error:', data);
      let errorMsg = data.description || '전송 실패';
      if (data.error_code === 400 && data.description?.includes('chat not found')) {
        errorMsg = '채팅방을 찾을 수 없습니다. 텔레그램에서 생성하신 봇을 검색하여 [시작(Start)]을 먼저 눌러주세요.';
      } else if (data.error_code === 401 || data.error_code === 404) {
        errorMsg = '봇 토큰(Bot Token)이 올바르지 않습니다. @BotFather가 준 토큰을 다시 확인해주세요.';
      }
      return { success: false, message: `텔레그램 전송 실패: ${errorMsg}` };
    }
  } catch (error: any) {
    console.warn('Telegram network request error:', error);
    return { success: false, message: `네트워크 오류: ${error.message || '전송 실패'}` };
  }
}

/**
 * Send test message to Telegram
 */
export async function sendTestMessageToTelegram(
  botToken: string,
  chatId: string
): Promise<{ success: boolean; message: string }> {
  if (!botToken.trim()) {
    return { success: false, message: '봇 토큰(Bot Token)을 입력해 주세요.' };
  }
  if (!chatId.trim()) {
    return { success: false, message: '채팅 ID(Chat ID)를 입력해 주세요.' };
  }

  const testText = [
    `🏢 <b>[다대포 오션시티 프레스티지]</b>`,
    `✅ <b>텔레그램 실시간 알림 연동 테스트 성공!</b>`,
    ``,
    `축하합니다! 텔레그램 알림 봇 연동이 정상적으로 완료되었습니다.`,
    `이제 홈페이지에서 고객이 방문예약 또는 관심고객을 신청할 때마다 이곳으로 실시간 띵동 알림이 도착합니다.`,
    ``,
    `• <b>테스트 발송 시간</b>: ${new Date().toLocaleString('ko-KR')}`,
    `• <b>관리자 계정</b>: flatdnc@gmail.com`
  ].join('\n');

  try {
    const url = `https://api.telegram.org/bot${botToken.trim()}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: testText,
        parse_mode: 'HTML',
      }),
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, message: '🎉 텔레그램으로 테스트 메시지가 즉시 전송되었습니다! 텔레그램 앱을 확인해 보세요.' };
    } else {
      let errorMsg = data.description || '전송 실패';
      if (data.description?.includes('chat not found')) {
        errorMsg = '채팅방을 찾을 수 없습니다. 텔레그램에서 만드신 봇 대화창에 들어가 [시작(Start)] 버튼을 먼저 눌러주세요!';
      } else if (data.error_code === 401 || data.error_code === 404) {
        errorMsg = '봇 토큰(Bot Token)이 올바르지 않습니다. @BotFather가 발급한 토큰을 다시 확인해주세요.';
      }
      return { success: false, message: `오류: ${errorMsg}` };
    }
  } catch (error: any) {
    return { success: false, message: `전송 중 네트워크 오류: ${error.message}` };
  }
}
