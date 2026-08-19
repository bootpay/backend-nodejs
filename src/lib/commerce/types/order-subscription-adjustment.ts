// Constants
export const SUBSCRIPTION_ADJUSTMENT_TYPE_PERIOD_DISCOUNT = 1

export interface CommerceOrderSubscriptionAdjustment {
    order_subscription_adjustment_id?: string
    duration?: number
    price?: number
    tax_free_price?: number
    name?: string
    type?: number
    created_at?: string
}

/**
 * 조정항목 수정 파라미터 (PUT /v1/order_subscriptions/{order_subscription_id}/adjustments)
 * 서버는 duration(회차) 단위로 adjustments 배열을 통째로 교체한다. duration 미지정시 1 이 적용된다.
 */
export interface OrderSubscriptionAdjustmentUpdateParams {
    order_subscription_id: string
    duration?: number
    adjustments?: CommerceOrderSubscriptionAdjustment[]
    order_subscription_adjustment_id?: string
    price?: number
    tax_free_price?: number
    name?: string
    type?: number
    /** 미지정시 자동 생성 (Idempotency-Key 헤더로 전송, body 에는 포함되지 않는다) */
    idempotency_key?: string
}
