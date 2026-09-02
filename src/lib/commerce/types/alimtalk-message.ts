// 알림톡 발송내역·집계 (GET /v1/alimtalk/messages 계열)

/** 발송 상태 — 접수 직후에는 requested 이고, 벤더 결과 동기화로 확정된다. */
export type AlimtalkMessageStatus = 'requested' | 'success' | 'failed' | 'canceled'

/**
 * 발송내역 조회 파라미터 (GET /v1/alimtalk/messages)
 * ⚠️ 기간 기본값은 최근 30일이고 최대 조회 폭은 92일이다 — 초과분은 거부하지 않고 시작일을 당겨 잘라낸다.
 *    실제 적용된 구간은 응답의 period 로 확인한다.
 */
export interface AlimtalkMessageListParams {
    template_code?: string
    status?: AlimtalkMessageStatus | string
    /** 발송 시 넘긴 멱등키 */
    ref_id?: string
    /** 수신번호 (하이픈 무관, 정확 매칭) */
    to?: string
    s_at?: string
    e_at?: string
    page?: number
    /** 서버 기본 20, 최대 100 */
    limit?: number
}

/** 기간 집계 조회 파라미터 (GET /v1/alimtalk/messages/stats) */
export interface AlimtalkMessageStatsParams {
    s_at?: string
    e_at?: string
}

export interface AlimtalkMessage {
    receipt_id?: string
    ref_id?: string
    template_code?: string
    to?: string
    status?: AlimtalkMessageStatus | string
    /** 폴백이 꺼진 건이면 null, 켜진 건이면 LMS */
    fallback_type?: string | null
    error_code?: string | null
    error_message?: string | null
    requested_at?: string | null
    sent_at?: string | null
}

export interface AlimtalkPeriod {
    from?: string
    to?: string
}

export interface AlimtalkMessageListResponse {
    list?: AlimtalkMessage[]
    count?: number
    page?: number
    per?: number
    /** 실제로 적용된 조회 구간 — 요청 기간이 92일을 넘으면 여기서 잘린 값을 확인한다 */
    period?: AlimtalkPeriod
}

export interface AlimtalkMessageStatsTotals {
    sent?: number
    success?: number
    failed?: number
    fallback?: number
    opted_out_hit?: number
    rejected?: number
    canceled?: number
    success_rate?: number
}

export interface AlimtalkMessageStatsBilling {
    /** 성공 − 폴백이다 — 폴백분은 LMS 단가로 따로 계산된다 */
    billable_count?: number
    unit_price?: number
    /** 'default' 면 잠정 단가다(확정 청구액이 아니다) */
    unit_price_source?: string
    fallback_count?: number
    fallback_unit_price?: number
    amount?: number
}

export interface AlimtalkMessageStatsResponse {
    period?: AlimtalkPeriod
    totals?: AlimtalkMessageStatsTotals
    daily?: Array<Record<string, any>>
    billing?: AlimtalkMessageStatsBilling
}
