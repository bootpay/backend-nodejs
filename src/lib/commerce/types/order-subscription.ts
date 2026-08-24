import { ListParams } from './common'

export interface CommerceOrderSubscription {
    order_subscription_id?: string
    seller_id?: string
    project_id?: string
    order_id?: string
    order_pre_id?: string
    user_id?: string
    user_group_id?: string
    wallet_id?: string

    subscription_billing_type?: number
    subscription_payment_cycle_type?: number
    subscription_payment_date?: number
    subscription_billing_base_day?: number

    quantity?: number
    is_first_prepaid?: boolean

    one_unit_price?: number
    one_unit_tax_free_price?: number
    price?: number
    tax_free_price?: number
    setup_price?: number

    unit?: number
    order_name?: string
    product_name?: string
    option_names?: string[]

    service_start_at?: string
    service_end_at?: string

    last_billing_created_at?: string
    latest_purchased_at?: string
    latest_failed_at?: string
    payment_next_at?: string

    current_duration?: number
    created_last_duration?: number
    payment_last_duration?: number
    total_subscription_duration?: number

    membership_type?: number
    use_subscription_times?: boolean

    renewal_status?: number
    cancel_status?: number
    status?: number
    cancel_at?: string
}

/**
 * 정기구독 목록 조회 파라미터 (GET /v1/order_subscriptions)
 * limit 미지정시 서버 기본값과 동일한 20 이 적용된다.
 * ⚠️ 날짜 키는 search_date_from / search_date_to (또는 s_at / e_at) 다. orders 의 css_at / cse_at 와 다르다.
 */
export interface OrderSubscriptionListParams extends ListParams {
    search_date_from?: string
    search_date_to?: string
    s_at?: string
    e_at?: string
    request_type?: string
    user_group_id?: string
    user_id?: string
    status?: number
}

/**
 * 구독 계약 변경 파라미터 (PUT /v1/order_subscriptions/{order_subscription_id})
 * 바뀐 값만 보내면 된다. 서버가 supervisor scope 를 요구한다.
 */
export interface OrderSubscriptionUpdateParams {
    order_subscription_id: string
    product_id?: string
    product_option_id?: string
    order_name?: string
    total_subscription_duration?: number
    quantity?: number
    address_id?: string
    username?: string
    phone?: string
    email?: string
    use_free_trial?: boolean
    free_trial_day?: number
    service_start_at?: string
    next_billing_at?: string
    billing_key?: string
    status?: number
    payment_next_at?: string
    service_end_at?: string
    /** 미지정시 자동 생성 (Idempotency-Key 헤더로 전송, body 에는 포함되지 않는다) */
    idempotency_key?: string
}

// Request Ing Types
export interface OrderSubscriptionPauseParams {
    order_subscription_id?: string
    order_number?: string
    reason?: string
    paused_at?: string
    expected_resume_at?: string
    /** 미지정시 자동 생성 (Idempotency-Key 헤더로 전송, body 에는 포함되지 않는다) */
    idempotency_key?: string
}

export interface OrderSubscriptionResumeParams {
    order_subscription_id?: string
    order_number?: string
    reason?: string
    resume_at?: string
    /** 미지정시 자동 생성 (Idempotency-Key 헤더로 전송, body 에는 포함되지 않는다) */
    idempotency_key?: string
}

/**
 * 중도인수 요청 파라미터 (POST /v1/order_subscriptions/requests/ing/purchase)
 */
export interface OrderSubscriptionPurchaseParams {
    order_subscription_id?: string
    order_number?: string
    price?: number
    tax_free_price?: number
    reason?: string
    /** 미지정시 자동 생성 (Idempotency-Key 헤더로 전송, body 에는 포함되지 않는다) */
    idempotency_key?: string
}

/**
 * 구독 이전/승계 요청 파라미터 (POST /v1/order_subscriptions/requests/ing/transfer)
 */
export interface OrderSubscriptionTransferParams {
    order_subscription_id?: string
    new_user_id?: string
    new_username?: string
    new_user_email?: string
    new_user_phone?: string
    new_user_address?: string
    wallet_id?: string
    reason?: string
    /** 미지정시 자동 생성 (Idempotency-Key 헤더로 전송, body 에는 포함되지 않는다) */
    idempotency_key?: string
}

export interface OrderSubscriptionTerminationParams {
    order_subscription_id?: string
    order_number?: string
    termination_fee?: number
    last_bill_refund_price?: number
    final_fee?: number
    service_end_at?: string
    reason?: string
    /** 미지정시 자동 생성 (Idempotency-Key 헤더로 전송, body 에는 포함되지 않는다) */
    idempotency_key?: string
}

export interface CalcTerminateFeeResponse {
    termination_fee?: number
    refund_amount?: number
    last_bill_refund_price?: number
    final_fee?: number
}

export interface SupervisorOrderSubscriptionApproveParams {
    reason?: string
    /** 미지정시 호출마다 자동 생성 */
    idempotency_key?: string
}

export interface SupervisorOrderSubscriptionRejectParams {
    reason?: string
    /** 미지정시 호출마다 자동 생성 */
    idempotency_key?: string
}

export interface SupervisorOrderSubscriptionTerminateParams {
    reason?: string
    termination_fee?: number
    last_bill_refund_price?: number
    final_fee?: number
    service_end_at?: string
    cancel_date?: string
    /** 미지정시 호출마다 자동 생성 */
    idempotency_key?: string
}

export interface SupervisorOrderSubscriptionPauseParams {
    reason?: string
    paused_at: string
    expected_resume_at?: string
    /** 미지정시 호출마다 자동 생성 */
    idempotency_key?: string
}

export interface SupervisorOrderSubscriptionResumeParams {
    reason?: string
    /** 미지정시 호출마다 자동 생성 */
    idempotency_key?: string
}

/**
 * 수시결제(온디맨드) charge_key 즉시 결제 파라미터
 * charge_key 는 body 로만 전송된다 (URL/query 금지 — 액세스 로그 노출 방지)
 */
export interface SupervisorOrderSubscriptionChargeParams {
    charge_key: string
    price: number
    tax_free_price?: number
    user?: Record<string, any>
    metadata?: Record<string, any>
    /** 미지정시 자동 생성 (Idempotency-Key 헤더로 전송, body 에는 포함되지 않는다) */
    idempotency_key?: string
}

/**
 * 수시결제(온디맨드) charge_key 해지 파라미터
 */
export interface SupervisorOrderSubscriptionChargeRevokeParams {
    charge_key: string
    user?: Record<string, any>
    /** 미지정시 자동 생성 (Idempotency-Key 헤더로 전송, body 에는 포함되지 않는다) */
    idempotency_key?: string
}

export interface OrderSubscriptionChargeResponse {
    order_id?: string
    order_number?: string
    receipt_id?: string
    charge_key?: string
    price?: number
    tax_free_price?: number
    status?: number
    [key: string]: unknown
}

export interface OrderSubscriptionChargeRevokeResponse {
    charge_key?: string
    revoked_at?: string
    status?: number
    [key: string]: unknown
}
