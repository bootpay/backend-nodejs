// 입점사 지급 요청 (/v1/sdk/payouts 계열)
//
// 가맹점 지정 금액(manual) 정산 방식의 쇼핑몰이 입점사와 지급액을 정해 지급 원장에 등록한다.
// 실제 송금은 부트페이 배치가 약 5분 간격으로 처리하므로, 결과는 detail()/list() 의 status 로 확인한다.

/**
 * 지급 상태 — 응답의 status 는 숫자가 아니라 이 문자열이다.
 * ready 송금 대기 · held 보류 · sending 송금 준비 · requested 송금 요청 완료 · processing 지급사 처리 중 ·
 * succeeded 성공 · failed 실패 · cancelled 취소 · unknown 결과 확인 필요 · void 지급 대상 제외
 */
export type PayoutStatus =
    | 'ready'
    | 'held'
    | 'sending'
    | 'requested'
    | 'processing'
    | 'succeeded'
    | 'failed'
    | 'cancelled'
    | 'unknown'
    | 'void'

/**
 * 지급 요청 파라미터 (POST /v1/sdk/payouts)
 * 같은 merchant_payout_id(앞뒤 공백 제외)로 다시 보내면 새로 만들지 않고 처음 항목을 돌려준다.
 */
export interface PayoutCreateParams {
    /** 이 프로젝트에 속한 입점사 ID (PG 판매자 등록을 마쳐야 한다 — 18378) */
    sub_seller_id: string
    /** 지급액 — 1원 이상 정수 */
    amount: number
    /** 가맹점 지급 번호이자 프로젝트별 멱등 키 (앞뒤 공백 제외 1~100자) */
    merchant_payout_id: string
    /** 가맹점 주문 번호 */
    order_number?: string
    /** 지급 예정일 YYYY-MM-DD (한국 시간 오늘 이후, 미지정시 오늘) */
    payout_date?: string
    idempotency_key?: string
}

/** 지급 목록 조회 파라미터 (GET /v1/sdk/payouts) — 최근 생성 순 */
export interface PayoutListParams {
    status?: PayoutStatus
    sub_seller_id?: string
    /** 지급 예정일 시작 YYYY-MM-DD (포함) */
    from?: string
    /** 지급 예정일 끝 YYYY-MM-DD (포함) */
    to?: string
    /** 기본 1 */
    page?: number
    /** 기본 20, 최대 100 */
    limit?: number
    idempotency_key?: string
}

/** 지급 항목 — 등록·조회·목록 응답이 같은 형태다 */
export interface CommercePayout {
    id?: string
    merchant_payout_id?: string
    sub_seller_id?: string
    amount?: number
    status?: PayoutStatus
    payout_date?: string
    order_number?: string | null
    /** 마지막 지급 결과 코드 — 아직 결과가 없으면 null */
    last_code?: string | null
    /** 마지막 지급 결과 메시지 — 아직 결과가 없으면 null */
    last_message?: string | null
    created_at?: string
    updated_at?: string
}
