// 뱅크알람 입금대기 (/v1/sdk/deposits 계열)
//
// 가맹점 서버가 아직 입금되지 않은 주문을 등록하면, 판매자 폰의 입금 알림 중 금액·입금자명이 맞는 것을
// 뱅크알람이 그 주문에 연결해 입금을 확인한다. 결과는 입금 웹훅으로 알린다.
//
// ## 웹훅 서명 검증
//   X-Bootpay-Signature: sha256=HMAC_SHA256(secret, "{X-Bootpay-Timestamp}.{raw_body}")
//   secret 은 deposit.webhookSecret() 응답에서만 원문으로 받는다.

/** 입금 알림을 처음 저장했다 (주문 연결 전, 명시해야 받는다) */
export const BANK_DEPOSIT_WEBHOOK_EVENT_RECEIVED = 400
/** 입금 알림이 입금대기 주문 한 건과 연결되어 입금 확인됐다 */
export const BANK_DEPOSIT_WEBHOOK_EVENT_MATCHED = 401
/** 같은 금액의 입금대기 주문이 여럿이라 판매자가 골라야 한다 */
export const BANK_DEPOSIT_WEBHOOK_EVENT_AMBIGUOUS = 402
/** 입금 알림에 연결할 입금대기 주문이 없다 */
export const BANK_DEPOSIT_WEBHOOK_EVENT_UNMATCHED = 403
/** 판매자가 관리자에서 직접 입금을 확인했다 */
export const BANK_DEPOSIT_WEBHOOK_EVENT_CONFIRMED_MANUALLY = 404
/** 입금 기한이 지나 입금대기 주문이 닫혔다 */
export const BANK_DEPOSIT_WEBHOOK_EVENT_EXPIRED = 405
/** 입금대기 중인 주문을 취소했다 */
export const BANK_DEPOSIT_WEBHOOK_EVENT_CANCELLED = 406
/** 입금 확인을 되돌려 다시 입금대기 상태로 바꿨다 */
export const BANK_DEPOSIT_WEBHOOK_EVENT_REVERTED = 407

/** 판매자가 등록한 입금 계좌 (GET /v1/sdk/deposits/accounts) — 첫 계좌가 대표 계좌다 */
export interface DepositAccount {
    id?: string
    bank_name?: string
    account_no?: string
    holder?: string
    /** 대표 계좌 여부 — 계좌 목록 응답에만 실린다 */
    primary?: boolean
}

export interface DepositAccountsResponse {
    accounts?: DepositAccount[]
}

/** 웹훅 서명 비밀값 (POST /v1/sdk/deposits/webhook_secret) — 이 응답에서만 원문을 준다 */
export interface DepositWebhookSecretResponse {
    secret?: string
}

/**
 * 구매자 알림톡 옵션 (유료)
 * 하나라도 true 면 buyer_phone 이 필요하고(18134), link 는 https 주소여야 한다(18135).
 * 알림톡을 보낼 준비(채널·템플릿·충전)가 안 됐으면 주문을 만들지 않고 18133 으로 거절한다.
 */
export interface DepositNotifyParams {
    /** 입금 안내 알림톡 */
    deposit_guide?: boolean
    /** 입금 확인 알림톡 */
    deposit_paid?: boolean
    /** 알림톡 버튼 링크 (https, 500자 이하) */
    link?: string
}

/**
 * 입금대기 등록 파라미터 (POST /v1/sdk/deposits)
 * 같은 merchant_order_id 로 다시 부르면 기존 주문을 돌려준다(금액·입금자명·계좌가 다르면 18110).
 */
export interface DepositCreateParams {
    /** 가맹점 주문번호 (100자 이하) */
    merchant_order_id: string
    price: number
    /** 은행 입금 알림과 맞춰 볼 입금자명 (50자까지 저장) */
    depositor: string
    /** 미지정시 '무통장 입금' */
    order_name?: string
    memo?: string
    /** 구매자 이름 — 미지정시 입금자명 */
    buyer_name?: string
    buyer_phone?: string
    /** 주면 입금 안내 · 입금 확인 메일을 보낸다 (무료). 형식이 틀리면 18136 */
    buyer_email?: string
    /** deposit.accounts() 의 id — 미지정시 대표 계좌 */
    account_id?: string
    /** 이 주문의 입금 웹훅 주소. 웹훅 서명 비밀값을 먼저 발급받아야 한다(18131) */
    webhook_url?: string
    notify?: DepositNotifyParams
    idempotency_key?: string
}

/** 입금대기 주문에 연결된 입금 알림 — 웹훅 본문에만 실린다 */
export interface DepositNotice {
    key?: string
    bank_name?: string
    account_tail?: string
    depositor?: string
    amount?: number
    received_at?: string | null
}

/** 입금대기 주문 — 등록·조회·취소 응답과 입금 웹훅의 data 가 같은 형태다 */
export interface CommerceDeposit {
    merchant_order_id?: string
    /** 부트페이 주문번호 */
    order_number?: string
    order_name?: string
    amount?: number
    /** 'awaiting' | 'paid' | 'expired' | 'cancelled' */
    status?: string
    buyer_name?: string
    depositor?: string
    account?: DepositAccount | null
    deadline?: string | null
    deadline_label?: string | null
    paid_at?: string | null
    notify?: { deposit_guide?: boolean, deposit_paid?: boolean } | null
    deposit?: DepositNotice | null
}
