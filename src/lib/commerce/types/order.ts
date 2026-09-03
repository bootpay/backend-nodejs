import { ListParams } from './common'

// Constants
export const SUBSCRIPTION_BILLING_TYPE_NONE = 0
export const SUBSCRIPTION_BILLING_TYPE_EACH = 1
export const SUBSCRIPTION_BILLING_TYPE_GROUP = 2

export interface CommerceChosenProductOption {
    chosen_product_option_id?: string
    product_id?: string
    product_option_id?: string
    product_name?: string
    option_name?: string
    price?: number
    tax_free_price?: number
    qty?: number
}

export interface CommerceOrder {
    order_id?: string
    order_pre_id?: string
    chosen_product_options?: CommerceChosenProductOption[]

    parent_order_id?: string
    user_id?: string
    seller_id?: string
    project_id?: string
    status?: number
    currency?: number
    is_subscription?: boolean
    is_leaf?: boolean
    total_price?: number
    tax_free_price?: number
    discount_amount?: number
    delivery_price?: number
    payment_method?: string
    receipt_id?: string
    webhook_url?: string
    created_at?: string
    updated_at?: string

    cancelled_request_history?: CommerceOrderCancellationRequestHistory[]
}

/**
 * 발주(배송) — 배송은 주문이 아니라 발주 단위로 움직인다.
 * 한 주문이 나뉘어 나가면 운송장도 나뉜다.
 * status 는 가맹점이 처리한 단계, d_ts 는 택배사가 알려준 단계로 서로 따로 움직인다.
 */
export interface CommerceOrderPurchase {
    order_purchase_id?: string
    order_purchase_number?: string
    /** 발주 상태 — 2 발주확인 · 3 준비중 · 4 발송완료 · 5 배송완료 (음수는 취소·오류·무효) */
    status?: number
    progress_status?: number
    delivery_type?: number
    delivery_company_code?: string
    tracking_number?: string
    /** 배송추적 상태 — 0 추적없음 · 1~3 수거·집화 · 4 배송완료 · 5~8 실패·오류 */
    d_ts?: number
    sent_at?: string
    delivered_at?: string
    last_synced_at?: string
    tracking_histories?: CommerceOrderTrackingHistory[]
}

export interface CommerceOrderTrackingHistory {
    trakler_status?: string
    delivery_tracking_status?: number
    location?: string
    description?: string
    occurred_at?: string
    source?: string
    created_at?: string
}

/**
 * 발송처리 항목 (PUT /v1/orders/:order_number/purchases)
 * 경로의 주문에 딸린 발주만 갱신된다 — 다른 주문의 번호를 섞으면 요청 전체가 거절된다.
 */
export interface OrderPurchaseUpdateItem {
    order_purchase_number: string
    /** 2 발주확인 · 3 준비중 · 4 발송완료 · 5 배송완료. 취소·무효는 이 API 로 못 한다 */
    status: number
    delivery_company_code?: string
    tracking_number?: string
    delivery_type?: number
    chosen_product_option_id?: string
}

export interface CommerceOrderCancellationRequestHistory {
    order_cancellation_request_history_id?: string
    order_id?: string
    status?: number
    cancel_reason?: string
    cancel_type?: number
    requested_at?: string
    processed_at?: string
}

/**
 * 주문 목록 조회 파라미터 (GET /v1/orders)
 * limit 은 서버 기본 20 · 최대 50 이며, 50 초과를 보내도 서버가 50 으로 클램프한다.
 * ⚠️ 날짜 키의 정식 이름은 search_date_from / search_date_to 다.
 *    css_at / cse_at 는 서버가 받아주는 별칭이며 하위호환을 위해 남겨둔다.
 */
export interface OrderListParams extends ListParams {
    user_id?: string
    user_group_id?: string
    status?: number[]
    payment_status?: number[]
    cs_type?: string
    search_date_from?: string
    search_date_to?: string
    css_at?: string
    cse_at?: string
    subscription_billing_type?: number
    order_subscription_ids?: string[]
}
