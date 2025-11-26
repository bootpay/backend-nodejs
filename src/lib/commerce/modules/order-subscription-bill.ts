import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { CommerceOrderSubscriptionBill, OrderSubscriptionBillListParams } from '../types'

export class OrderSubscriptionBillModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 정기구독 청구 목록 조회
     * @param params 조회 파라미터
     */
    async list(params?: OrderSubscriptionBillListParams): Promise<BootpayCommerceResponse<{ items: CommerceOrderSubscriptionBill[]; total: number }>> {
        const queryParams = new URLSearchParams()
        if (params) {
            if (params.page !== undefined) queryParams.append('page', params.page.toString())
            if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
            if (params.keyword) queryParams.append('keyword', params.keyword)
            if (params.order_subscription_id) queryParams.append('order_subscription_id', params.order_subscription_id)
            if (params.status && params.status.length > 0) {
                queryParams.append('status', params.status.join(','))
            }
        }
        const query = queryParams.toString()
        return this.bootpay.get<{ items: CommerceOrderSubscriptionBill[]; total: number }>(`order_subscription_bills${query ? `?${query}` : ''}`)
    }

    /**
     * 정기구독 청구 상세 조회
     * @param orderSubscriptionBillId 청구 ID
     */
    async detail(orderSubscriptionBillId: string): Promise<BootpayCommerceResponse<CommerceOrderSubscriptionBill>> {
        return this.bootpay.get<CommerceOrderSubscriptionBill>(`order_subscription_bills/${orderSubscriptionBillId}`)
    }

    /**
     * 정기구독 청구 수정
     * @param orderSubscriptionBill 청구 정보
     */
    async update(orderSubscriptionBill: CommerceOrderSubscriptionBill): Promise<BootpayCommerceResponse<CommerceOrderSubscriptionBill>> {
        if (!orderSubscriptionBill.order_subscription_bill_id) {
            return Promise.reject({ success: false, error: 'order_subscription_bill_id is required' })
        }
        return this.bootpay.put<CommerceOrderSubscriptionBill>(
            `order_subscription_bills/${orderSubscriptionBill.order_subscription_bill_id}`,
            orderSubscriptionBill
        )
    }
}
