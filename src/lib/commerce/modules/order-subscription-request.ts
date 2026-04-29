import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    OrderSubscriptionRequest,
    OrderSubscriptionRequestListParams,
    OrderSubscriptionRequestUpdateParams
} from '../types'

/**
 * V1 OrderSubscription Request 조회/승인 모듈
 *
 * 본인 모드 (user role): project_id 없이 호출 → 본인 요청 목록/단건
 * 슈퍼바이저 모드 (supervisor role): project_id 포함 → 프로젝트 전체 + update (승인/거절)
 *
 * 구매자측 요청 생성 (pause/resume/termination 등) 은
 * `commerce.orderSubscription.requestIng.*` 모듈을 사용한다.
 */
export class OrderSubscriptionRequestModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 요청 목록 조회 (user / supervisor 공용)
     */
    async list(
        params?: OrderSubscriptionRequestListParams
    ): Promise<BootpayCommerceResponse<{ items: OrderSubscriptionRequest[]; total: number }>> {
        const queryParams = new URLSearchParams()
        if (params) {
            if (params.project_id) queryParams.append('project_id', params.project_id)
            if (params.page !== undefined) queryParams.append('page', params.page.toString())
            if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
            if (params.request_type !== undefined) queryParams.append('request_type', params.request_type.toString())
            if (params.status !== undefined) queryParams.append('status', params.status.toString())
            if (params.s_at) queryParams.append('s_at', params.s_at)
            if (params.e_at) queryParams.append('e_at', params.e_at)
            if (params.keyword) queryParams.append('keyword', params.keyword)
        }
        const query = queryParams.toString()
        return this.bootpay.get<{ items: OrderSubscriptionRequest[]; total: number }>(
            `order-subscription-requests${query ? `?${query}` : ''}`
        )
    }

    /**
     * 요청 단건 조회 (user / supervisor 공용)
     */
    async detail(
        orderSubscriptionRequestHistoryId: string,
        projectId?: string
    ): Promise<BootpayCommerceResponse<OrderSubscriptionRequest>> {
        const queryParams = new URLSearchParams()
        if (projectId) queryParams.append('project_id', projectId)
        const query = queryParams.toString()
        return this.bootpay.get<OrderSubscriptionRequest>(
            `order-subscription-requests/${orderSubscriptionRequestHistoryId}${query ? `?${query}` : ''}`
        )
    }

    /**
     * 요청 승인/거절 (supervisor 전용)
     */
    async update(
        params: OrderSubscriptionRequestUpdateParams
    ): Promise<BootpayCommerceResponse<OrderSubscriptionRequest>> {
        const { order_subscription_request_history_id, ...rest } = params
        return this.bootpay.put<OrderSubscriptionRequest>(
            `order-subscription-requests/${order_subscription_request_history_id}`,
            rest
        )
    }
}
