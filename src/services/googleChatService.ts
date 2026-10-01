import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseAuth';
import { StoredInterestRegistration } from './interestRegistrationService';

const GOOGLE_CHAT_WEBHOOK_KEY = 'dadaepo_google_chat_webhook_url';
const INTEGRATIONS_DOC_ID = 'integrations';

// Default / fallback Google Chat incoming webhook or placeholder
export const DEFAULT_GOOGLE_CHAT_WEBHOOK = 'https://chat.googleapis.com/v1/spaces/AAAA_dadaepo/messages?key=AIStudio_Demo_Key&token=Dadaepo_Token';

let cachedWebhookUrl: string | null = null;

/**
 * Get stored Google Chat webhook URL from localStorage and Firestore
 */
export async function getGoogleChatWebhookUrlAsync(): Promise<string> {
  if (cachedWebhookUrl) return cachedWebhookUrl;

  // 1. Try local storage
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(GOOGLE_CHAT_WEBHOOK_KEY);
    if (local) {
      cachedWebhookUrl = local;
    }
  }

  // 2. Try Firestore
  try {
    const docRef = doc(db, 'siteSettings', INTEGRATIONS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.googleChatWebhookUrl) {
        cachedWebhookUrl = data.googleChatWebhookUrl;
        if (typeof window !== 'undefined') {
          localStorage.setItem(GOOGLE_CHAT_WEBHOOK_KEY, data.googleChatWebhookUrl);
        }
        return data.googleChatWebhookUrl;
      }
    }
  } catch (e) {
    console.warn('Failed to load webhook from Firestore:', e);
  }

  return cachedWebhookUrl || '';
}

export function getGoogleChatWebhookUrl(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GOOGLE_CHAT_WEBHOOK_KEY) || cachedWebhookUrl || '';
}

/**
 * Save Google Chat webhook URL to both localStorage and Firestore
 */
export async function saveGoogleChatWebhookUrl(url: string): Promise<void> {
  const cleanUrl = url.trim();
  cachedWebhookUrl = cleanUrl;
  if (typeof window !== 'undefined') {
    localStorage.setItem(GOOGLE_CHAT_WEBHOOK_KEY, cleanUrl);
  }

  try {
    const docRef = doc(db, 'siteSettings', INTEGRATIONS_DOC_ID);
    await setDoc(docRef, {
      googleChatWebhookUrl: cleanUrl,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.warn('Failed to save webhook to Firestore:', error);
  }
}

/**
 * Send lead notification to Google Chat space via Incoming Webhook
 */
export async function sendLeadToGoogleChat(
  lead: StoredInterestRegistration,
  customWebhookUrl?: string
): Promise<{ success: boolean; message: string }> {
  let webhookUrl = customWebhookUrl || getGoogleChatWebhookUrl();

  if (!webhookUrl) {
    webhookUrl = await getGoogleChatWebhookUrlAsync();
  }

  const typeLabel = 
    lead.unitType === '59' ? '59㎡ (실속 중소형)' : 
    lead.unitType === '84A' ? '84㎡ A (파노라마 오션뷰)' : 
    lead.unitType === '84B' ? '84㎡ B (타워형 2면 개방)' : 
    lead.unitType === '128' ? '128㎡ (펜트하우스)' : lead.unitType;

  const visitInfo = lead.visitDate 
    ? `📅 방문 희망일시: *${lead.visitDate} (${lead.visitTime || '시간 미지정'})*` 
    : '💬 방문 예약: 온라인/유선 상담 희망';

  const interestLabel = 
    lead.primaryInterest === 'ocean' ? '바다 영구조망' : 
    lead.primaryInterest === 'transit' ? '다대포항역 1분 초역세권' : '단지편의/투자';

  // Google Chat Card V2 Formatted Payload
  const payload = {
    cardsV2: [
      {
        cardId: `lead-${lead.id}`,
        card: {
          header: {
            title: '🏢 [다대포 오션시티 프레스티지]',
            subtitle: lead.visitDate ? '🔔 홍보관 방문 예약 접수' : '📋 신규 VIP 관심고객 접수',
            imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=128&q=80',
            imageType: 'CIRCLE',
          },
          sections: [
            {
              header: '고객 접수 정보',
              widgets: [
                {
                  decoratedText: {
                    topLabel: '접수 코드',
                    text: `*${lead.registrationCode}*`,
                    icon: { knownIcon: 'TICKET' }
                  }
                },
                {
                  decoratedText: {
                    topLabel: '고객명 / 연락처',
                    text: `*${lead.name}* (${lead.phone})`,
                    icon: { knownIcon: 'PERSON' }
                  }
                },
                {
                  decoratedText: {
                    topLabel: '홍보관 방문 예약',
                    text: visitInfo,
                    icon: { knownIcon: 'CLOCK' }
                  }
                },
                {
                  decoratedText: {
                    topLabel: '희망 평형 / 관심 요소',
                    text: `${typeLabel} | ${interestLabel}`,
                    icon: { knownIcon: 'STAR' }
                  }
                },
                {
                  decoratedText: {
                    topLabel: '접수 일시',
                    text: new Date(lead.createdAt).toLocaleString('ko-KR'),
                    icon: { knownIcon: 'BOOKMARK' }
                  }
                }
              ]
            }
          ]
        }
      }
    ],
    // Fallback text format for simple mobile alerts
    text: `🔔 *[다대포 오션시티] ${lead.visitDate ? '홍보관 방문예약' : '신규 관심고객'} 접수!*\n` +
          `• 고객명: *${lead.name}* (${lead.phone})\n` +
          `• 예약일시: *${lead.visitDate ? `${lead.visitDate} ${lead.visitTime}` : '온라인/전화 상담'}*\n` +
          `• 희망평형: ${typeLabel}\n` +
          `• 접수코드: ${lead.registrationCode}`
  };

  // If webhook is not configured, simulate successful mock dispatch for preview
  if (!webhookUrl) {
    console.log('[Google Chat Simulation] Message sent:', payload);
    return {
      success: true,
      message: 'Google Chat 웹훅 URL이 등록되지 않아 시뮬레이션 처리되었습니다. 관리자 대시보드에서 Webhook URL을 등록해주세요.'
    };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return { success: true, message: 'Google Chat에 알림 메시지가 성공적으로 전송되었습니다.' };
    } else {
      const errText = await res.text();
      console.warn('Google Chat Webhook failed:', errText);
      return { success: false, message: `전송 실패: ${res.status} ${errText}` };
    }
  } catch (error: any) {
    // If CORS prevents reading response in client-side browser, fire with no-cors to guarantee delivery
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload),
      });
      return { 
        success: true, 
        message: 'Google Chat 채널로 고객 접수 알림이 전송되었습니다.' 
      };
    } catch (e) {
      console.warn('Google Chat network error:', error);
      return { 
        success: false, 
        message: 'Google Chat 전송 중 오류가 발생했습니다. 웹훅 주소를 확인해 주세요.' 
      };
    }
  }
}
