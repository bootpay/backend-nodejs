/**
 * 주문 취소 요청 내역 조회 파라미터 (GET /v1/order/cancel)
 * 둘 다 없으면 전체를 조회한다.
 */
export interface OrderCancelListParams {
    order_id?: string
    order_number?: string
    /** 미지정시 자동 생성 (Idempotency-Key 헤더로 전송, query 에는 포함되지 않는다) */
    idempotency_key?: string
}

export interface CancelProduct {
    order_product_id?: string
    product_id?: string
    qty?: number
    cancel_price?: number
}

export interface CancelOrderSubscriptionBill {
    order_subscription_bill_id?: string
    cancel_price?: number
}

export interface RequestCancelParameter {
    cancel_products?: CancelProduct[]
    cancel_order_subscription_bills?: CancelOrderSubscriptionBill[]
    cancel_reason?: string
    cancel_type?: number
    refund_price?: number
}

export interface OrderCancelParams {
    order_number?: string
    request_cancel_parameters?: RequestCancelParameter
    is_supervisor?: boolean
}

/**
 * 취소 요청 승인/반려 파라미터 (PUT /v1/order/cancel/{id}/approve · /reject)
 * 서버는 approve / reject / withdraw 셋 다 params[:id] 를 order_cancellation_request_id 로 동일하게 취급한다.
 * 정식 이름은 order_cancellation_request_id 이며, 구 이름 order_cancel_request_history_id 도 계속 받는다.
 */
export interface OrderCancelActionParams {
    order_cancellation_request_id?: string
    /** @deprecated order_cancellation_request_id 를 사용할 것 (하위호환으로 계속 지원한다) */
    order_cancel_request_history_id?: string
    message?: string
    cancel_reason?: string
    refund_price?: number
    /** 미지정시 자동 생성 (Idempotency-Key 헤더로 전송, body 에는 포함되지 않는다) */
    idempotency_key?: string
}

/**
 * 취소 요청 철회 파라미터 (PUT /v1/order/cancel/{id}/withdraw)
 */
export interface OrderCancelWithdrawParams {
    order_cancellation_request_id?: string
    /** @deprecated order_cancellation_request_id 를 사용할 것 (하위호환으로 계속 지원한다) */
    order_cancel_request_history_id?: string
    /** 미지정시 자동 생성 (Idempotency-Key 헤더로 전송) */
    idempotency_key?: string
}

export interface CommerceOrderCancelRequestHistory {
    order_cancel_request_history_id?: string
    order_id?: string
    order_number?: string
    status?: number
    cancel_reason?: string
    cancel_type?: number
    requested_at?: string
    processed_at?: string
    refund_price?: number
}
