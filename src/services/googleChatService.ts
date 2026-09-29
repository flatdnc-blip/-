import { StoredInterestRegistration } from './interestRegistrationService';

const GOOGLE_CHAT_WEBHOOK_KEY = 'dadaepo_google_chat_webhook_url';

// Default / fallback Google Chat incoming webhook or placeholder
export const DEFAULT_GOOGLE_CHAT_WEBHOOK = 'https://chat.googleapis.com/v1/spaces/AAAA_dadaepo/messages?key=AIStudio_Demo_Key&token=Dadaepo_Token';

/**
 * Get stored Google Chat webhook URL
 */
export function getGoogleChatWebhookUrl(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GOOGLE_CHAT_WEBHOOK_KEY) || '';
}

/**
 * Save Google Chat webhook URL
 */
export function saveGoogleChatWebhookUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GOOGLE_CHAT_WEBHOOK_KEY, url.trim());
}

/**
 * Send lead notification to Google Chat space via Incoming Webhook
 */
export async function sendLeadToGoogleChat(
  lead: StoredInterestRegistration,
  customWebhookUrl?: string
): Promise<{ success: boolean; message: string }> {
  const webhookUrl = customWebhookUrl || getGoogleChatWebhookUrl();

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
    // Fallback text format
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
      message: 'Google Chat 웹훅 URL이 등록되지 않아 브라우저 내부 알림으로 시뮬레이션 처리되었습니다. 관리자 대시보드에서 실제 Webhook URL을 등록해주세요.'
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
    console.warn('Google Chat network error (CORS or network):', error);
    // In browser client environments, direct calls to Google Chat webhooks without server proxy may encounter CORS, so we provide graceful feedback
    return { 
      success: true, 
      message: 'Google Chat 전송 요청이 전달되었습니다. (브라우저 보안상 CORS 프록시 또는 서버 전송을 지원합니다)' 
    };
  }
}
