// 알림톡 발송결과·검수결과 웹훅 설정 (/v1/alimtalk/webhook 계열)
//
// ⚠️ 주문·구독 통합 웹훅(webhook.sendTest)과 완전히 별개다.
//    알림톡 이벤트를 기존 주문 웹훅 URL 로 태우면 그 수신 서버가 모르는 payload 를 받아 기존 연동이 깨진다.
//
// ## 서명 검증
//   X-Bootpay-Signature: sha256=HMAC_SHA256(secret, "{X-Bootpay-Timestamp}.{raw_body}")
//   타임스탬프가 5분 이상 지난 요청은 거부한다(replay 방지).

/** 발송 접수 (기본 미구독) */
export const ALIMTALK_WEBHOOK_EVENT_REQUESTED = 300
/** 전달 성공 */
export const ALIMTALK_WEBHOOK_EVENT_DELIVERED = 301
/** 전달 실패 */
export const ALIMTALK_WEBHOOK_EVENT_FAILED = 302
/** 예약 취소 */
export const ALIMTALK_WEBHOOK_EVENT_CANCELED = 303
/** 문자(LMS) 대체발송 전환 */
export const ALIMTALK_WEBHOOK_EVENT_FALLBACK = 304
/** 검수 승인 */
export const ALIMTALK_WEBHOOK_EVENT_INSPECT_APPROVED = 310
/** 검수 반려 */
export const ALIMTALK_WEBHOOK_EVENT_INSPECT_REJECTED = 311
/** 수신거부 등록 (기본 미구독) */
export const ALIMTALK_WEBHOOK_EVENT_OPTOUT = 320

/**
 * 웹훅 설정 저장 파라미터 (PUT /v1/alimtalk/webhook)
 * url 은 **https 만** 허용한다(아니면 3028). 최초 저장 시 서명 시크릿이 자동 발급된다.
 */
export interface AlimtalkWebhookUpdateParams {
    url?: string
    /**
     * 구독할 이벤트 코드. 목록에 없는 값은 저장 시 조용히 버려진다(유령 구독 방지).
     * 비우면 기본 구독셋(301·302·303·304·310·311)이 적용된다.
     */
    events?: number[]
    enabled?: boolean
}

/** 웹훅 전송 이력 조회 파라미터 (GET /v1/alimtalk/webhook/deliveries) */
export interface AlimtalkWebhookDeliveriesParams {
    page?: number
    /** 서버 기본 20, 최대 100 */
    limit?: number
}

export interface AlimtalkWebhookSetting {
    /** 미설정이면 false 로만 온다 */
    configured?: boolean
    url?: string
    events?: number[]
    enabled?: boolean
    /** 조회시에는 앞 12자만 노출된다 — 원문은 rotateSecret 응답에서만 볼 수 있다 */
    secret?: string
}

export interface AlimtalkWebhookDelivery {
    delivery_id?: string
    event?: string
    event_code?: number
    url?: string
    status?: string
    retry_count?: number
    max_retry?: number
    tags?: string[]
    created_at?: string | null
}

export interface AlimtalkWebhookDeliveriesResponse {
    list?: AlimtalkWebhookDelivery[]
    count?: number
    page?: number
    per?: number
}

export interface AlimtalkWebhookTestResponse {
    delivery_id?: string
    url?: string
    queued?: boolean
}
