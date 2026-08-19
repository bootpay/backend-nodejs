import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { CommerceOrderSubscriptionAdjustment, OrderSubscriptionAdjustmentUpdateParams } from '../types'
import { randomUUID } from 'crypto'

/**
 * 구독 가감산 조정항목 모듈
 *
 * ⚠️ /adjustments 한 경로에 POST · PUT · DELETE 세 동사가 걸려 있다.
 *    경로만 보고 메서드를 유추하지 말 것.
 */
export class OrderSubscriptionAdjustmentModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 가감산 조정항목 추가
     * POST /v1/order_subscriptions/{order_subscription_id}/adjustments
     * type 미전달시 서버가 price > 0 이면 SETUP_PRICE, 아니면 PERIOD_DISCOUNT 로 자동 판정한다.
     * @param orderSubscriptionId 정기구독 ID
     * @param adjustment 조정 정보 (price/duration/tax_free_price 미지정시 각각 0 / 1 / 0)
     * @param idempotencyKey 미지정시 자동 생성
     */
    async create(
        orderSubscriptionId: string,
        adjustment: CommerceOrderSubscriptionAdjustment,
        idempotencyKey?: string
    ): Promise<BootpayCommerceResponse<CommerceOrderSubscriptionAdjustment>> {
        const payload = this.compact({
            price: 0,
            duration: 1,
            tax_free_price: 0,
            ...adjustment
        })
        return this.bootpay.post<CommerceOrderSubscriptionAdjustment>(
            `order_subscriptions/${orderSubscriptionId}/adjustments`,
            payload,
            { headers: this.supervisorHeaders(idempotencyKey) }
        )
    }

    /**
     * 특정 회차의 조정항목을 통째로 교체
     * PUT /v1/order_subscriptions/{order_subscription_id}/adjustments
     * 서버는 duration(회차) 단위로 adjustments 배열을 갈아끼운다.
     * @param params 수정 파라미터
     */
    async update(params: OrderSubscriptionAdjustmentUpdateParams): Promise<BootpayCommerceResponse<CommerceOrderSubscriptionAdjustment>> {
        if (!params.order_subscription_id) {
            return Promise.reject({ success: false, error: 'order_subscription_id is required' })
        }
        const { order_subscription_id, idempotency_key, ...payload } = params
        return this.bootpay.put<CommerceOrderSubscriptionAdjustment>(
            `order_subscriptions/${order_subscription_id}/adjustments`,
            this.compact({ duration: 1, ...payload }),
            { headers: this.supervisorHeaders(idempotency_key) }
        )
    }

    /**
     * 조정항목 삭제
     * DELETE /v1/order_subscriptions/{order_subscription_id}/adjustments
     * ⚠️ 대상 ID 는 query 가 아니라 body 로 보낸다.
     * @param orderSubscriptionId 정기구독 ID
     * @param orderSubscriptionAdjustmentId 조정 ID
     * @param idempotencyKey 미지정시 자동 생성
     */
    async delete(
        orderSubscriptionId: string,
        orderSubscriptionAdjustmentId: string,
        idempotencyKey?: string
    ): Promise<BootpayCommerceResponse<null>> {
        return this.bootpay.delete<null>(`order_subscriptions/${orderSubscriptionId}/adjustments`, {
            data: { order_subscription_adjustment_id: orderSubscriptionAdjustmentId },
            headers: this.supervisorHeaders(idempotencyKey)
        })
    }

    /**
     * null/undefined 값을 제거한다. (Ruby SDK 의 payload.compact 와 동일 동작)
     */
    private compact(payload: Record<string, any>): Record<string, any> {
        return Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
        )
    }

    /**
     * 조정항목 API 요청 헤더 — 서버가 supervisor scope 를 요구한다.
     * Idempotency-Key 는 미지정시 매 호출마다 생성된다.
     */
    private supervisorHeaders(idempotencyKey?: string): Record<string, string> {
        return {
            'Idempotency-Key': idempotencyKey || randomUUID(),
            'BOOTPAY-ROLE': 'supervisor'
        }
    }
}
