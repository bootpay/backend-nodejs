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
 * 조정항목 추가 파라미터 (POST /v1/order_subscriptions/{order_subscription_id}/adjustments)
 *
 * 회차 지정 방법 3가지 (아래로 갈수록 넓다):
 *   - duration: 5                      → 5회차 한 건만
 *   - duration_from: 3, duration_to: 7 → 3~7회차 각각 한 건씩 (총 5건)
 *   - duration_from: 3, is_unlimited: true → 3회차부터 계약 끝까지 (레코드는 1건, duration_to 는 무시)
 * 상한은 계약 총회차이며, 총회차가 무제한인 계약은 60회차까지다.
 * 이미 결제가 끝난 회차는 거절된다. 범위 중 한 회차라도 최종 금액이 음수면 전부 거절된다(부분 반영 없음).
 */
export interface OrderSubscriptionAdjustmentCreateParams extends CommerceOrderSubscriptionAdjustment {
    /** 범위 조정 시작 회차 */
    duration_from?: number
    /** 범위 조정 종료 회차 (is_unlimited 가 true 면 무시된다) */
    duration_to?: number
    /** duration_from 회차부터 계약 끝까지 적용 */
    is_unlimited?: boolean
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
