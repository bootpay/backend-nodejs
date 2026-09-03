import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { CommerceOrder, CommerceOrderPurchase, OrderListParams, OrderPurchaseUpdateItem } from '../types'

export class OrderModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 주문 목록 조회
     * GET /v1/orders
     * limit 은 서버 기본 20 · 최대 50 (초과분은 서버가 50 으로 클램프한다).
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
            if (params.search_date_from) queryParams.append('search_date_from', params.search_date_from)
            if (params.search_date_to) queryParams.append('search_date_to', params.search_date_to)
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
     * 배송추적 조회 — 발주(배송) 단위 운송장·택배사·배송추적 상태·추적 이력
     * GET /v1/orders/:order_number/purchases
     *
     * 주문 상세의 order_purchases 와 같은 값이다. 배송만 확인하려는 서버가
     * 결제·상품·고객까지 받지 않도록 이 면만 떼어 둔 것이다.
     *
     * @param orderNumber 주문번호 (order_id 아님)
     */
    async purchases(orderNumber: string): Promise<BootpayCommerceResponse<CommerceOrderPurchase[]>> {
        return this.bootpay.get<CommerceOrderPurchase[]>(`orders/${ orderNumber }/purchases`)
    }

    /**
     * 발송처리 — 발주(배송) 단위 상태·운송장 갱신
     * PUT /v1/orders/:order_number/purchases
     *
     * 발송 완료(status 4)로 넘기면서 운송장을 같이 넣으면 배송 추적이 자동으로 붙는다.
     * 그 뒤 택배사가 알려주는 단계는 주문 상세의 order_purchases[].d_ts 로 읽는다 —
     * 따로 폴링할 필요가 없고, 배송 완료를 받으면 발주 상태도 스스로 넘어간다.
     *
     * ⚠️ 배송은 주문이 아니라 발주 단위다. 경로의 주문에 딸리지 않은
     *    order_purchase_number 를 섞으면 요청 전체가 ORDER_PURCHASE_NOT_FOUND 로 거절된다.
     *
     * @param orderNumber 주문번호 (order_id 아님)
     * @param purchases 갱신할 발주 목록 (한 번에 최대 50건)
     */
    async updatePurchases(
        orderNumber: string,
        purchases: OrderPurchaseUpdateItem[]
    ): Promise<BootpayCommerceResponse<CommerceOrderPurchase[]>> {
        return this.bootpay.put<CommerceOrderPurchase[]>(`orders/${ orderNumber }/purchases`, { purchases })
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
