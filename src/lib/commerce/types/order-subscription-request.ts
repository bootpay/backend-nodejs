export interface OrderSubscriptionRequest {
    order_subscription_request_history_id?: string
    order_subscription_id?: string
    project_id?: string
    user_id?: string
    request_type?: number
    status?: number
    reason?: string
    requested_at?: string
    processed_at?: string | null
    created_at?: string
    updated_at?: string
}

/**
 * 구독 변경요청 목록 조회 파라미터 (GET /v1/order-subscription-requests)
 * project_id 를 주면 supervisor 모드(프로젝트 전체 검색), 없으면 본인 요청만 조회한다.
 * page/limit 미지정시 각각 1 / 20 이 적용된다.
 */
export interface OrderSubscriptionRequestListParams {
    project_id?: string
    order_subscription_id?: string
    page?: number
    limit?: number
    request_type?: number
    status?: number
    s_at?: string
    e_at?: string
    keyword?: string
    user_id?: string
    user_group_id?: string
    /** 미지정시 자동 생성 (Idempotency-Key 헤더로 전송, query 에는 포함되지 않는다) */
    idempotency_key?: string
}

export type OrderSubscriptionRequestApprovalAction = 'approve' | 'reject'

/**
 * 구독 변경요청 승인/반려 파라미터 (PUT /v1/order-subscription-requests/{id})
 * ⚠️ 승인과 반려는 별도 액션이 아니라 approval 값으로 갈린다.
 *    서버가 params[:action] 을 Rails 예약어로 쓰기 때문에 키 이름이 approval 이다.
 */
export interface OrderSubscriptionRequestUpdateParams {
    order_subscription_request_history_id: string
    approval: OrderSubscriptionRequestApprovalAction
    reason?: string
    price?: number
    tax_free_price?: number
    termination_fee?: number
    last_bill_refund_price?: number
    final_fee?: number
    service_end_at?: string
    /** 미지정시 자동 생성 (Idempotency-Key 헤더로 전송, body 에는 포함되지 않는다) */
    idempotency_key?: string
    [extra: string]: unknown
}
