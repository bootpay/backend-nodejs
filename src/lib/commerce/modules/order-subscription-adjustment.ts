import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { CommerceOrderSubscriptionAdjustment, OrderSubscriptionAdjustmentUpdateParams } from '../types'

export class OrderSubscriptionAdjustmentModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 정기구독 조정 생성
     * @param orderSubscriptionId 정기구독 ID
     * @param adjustment 조정 정보
     */
    async create(
        orderSubscriptionId: string,
        adjustment: CommerceOrderSubscriptionAdjustment
    ): Promise<BootpayCommerceResponse<CommerceOrderSubscriptionAdjustment>> {
        return this.bootpay.post<CommerceOrderSubscriptionAdjustment>(
            `order_subscriptions/${orderSubscriptionId}/adjustments`,
            adjustment
        )
    }

    /**
     * 정기구독 조정 수정
     * @param params 수정 파라미터
     */
    async update(params: OrderSubscriptionAdjustmentUpdateParams): Promise<BootpayCommerceResponse<CommerceOrderSubscriptionAdjustment>> {
        if (!params.order_subscription_id) {
            return Promise.reject({ success: false, error: 'order_subscription_id is required' })
        }
        return this.bootpay.put<CommerceOrderSubscriptionAdjustment>(
            `order_subscriptions/${params.order_subscription_id}/adjustments`,
            params
        )
    }

    /**
     * 정기구독 조정 삭제
     * @param orderSubscriptionId 정기구독 ID
     * @param orderSubscriptionAdjustmentId 조정 ID
     */
    async delete(
        orderSubscriptionId: string,
        orderSubscriptionAdjustmentId: string
    ): Promise<BootpayCommerceResponse<null>> {
        return this.bootpay.delete<null>(
            `order_subscriptions/${orderSubscriptionId}/adjustments?order_subscription_adjustment_id=${orderSubscriptionAdjustmentId}`
        )
    }
}
