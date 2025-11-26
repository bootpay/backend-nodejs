import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { CommerceOrder, OrderListParams } from '../types'

export class OrderModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 주문 목록 조회
     * @param params 조회 파라미터
     */
    async list(params?: OrderListParams): Promise<BootpayCommerceResponse<{ items: CommerceOrder[]; total: number }>> {
        const queryParams = new URLSearchParams()
        if (params) {
            if (params.page !== undefined) queryParams.append('page', params.page.toString())
            if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
            if (params.keyword) queryParams.append('keyword', params.keyword)
            if (params.user_id) queryParams.append('user_id', params.user_id)
            if (params.user_group_id) queryParams.append('user_group_id', params.user_group_id)
            if (params.cs_type) queryParams.append('cs_type', params.cs_type)
            if (params.css_at) queryParams.append('css_at', params.css_at)
            if (params.cse_at) queryParams.append('cse_at', params.cse_at)
            if (params.subscription_billing_type !== undefined) {
                queryParams.append('subscription_billing_type', params.subscription_billing_type.toString())
            }
            if (params.status && params.status.length > 0) {
                queryParams.append('status', params.status.join(','))
            }
            if (params.payment_status && params.payment_status.length > 0) {
                queryParams.append('payment_status', params.payment_status.join(','))
            }
            if (params.order_subscription_ids && params.order_subscription_ids.length > 0) {
                queryParams.append('order_subscription_ids', params.order_subscription_ids.join(','))
            }
        }
        const query = queryParams.toString()
        return this.bootpay.get<{ items: CommerceOrder[]; total: number }>(`orders${query ? `?${query}` : ''}`)
    }

    /**
     * 주문 상세 조회
     * @param orderId 주문 ID
     */
    async detail(orderId: string): Promise<BootpayCommerceResponse<CommerceOrder>> {
        return this.bootpay.get<CommerceOrder>(`orders/${orderId}`)
    }

    /**
     * 월별 주문 조회
     * @param userGroupId 사용자 그룹 ID
     * @param searchDate 검색 날짜 (YYYY-MM 형식)
     */
    async month(userGroupId: string, searchDate: string): Promise<BootpayCommerceResponse<any>> {
        const queryParams = new URLSearchParams()
        queryParams.append('user_group_id', userGroupId)
        queryParams.append('search_date', searchDate)
        return this.bootpay.get<any>(`orders/month?${queryParams.toString()}`)
    }
}
