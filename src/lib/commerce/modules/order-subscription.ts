import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    CommerceOrderSubscription,
    OrderSubscriptionListParams,
    OrderSubscriptionUpdateParams,
    OrderSubscriptionPauseParams,
    OrderSubscriptionResumeParams,
    OrderSubscriptionTerminationParams,
    CalcTerminateFeeResponse,
    SupervisorOrderSubscriptionApproveParams,
    SupervisorOrderSubscriptionRejectParams,
    SupervisorOrderSubscriptionTerminateParams,
    SupervisorOrderSubscriptionPauseParams,
    SupervisorOrderSubscriptionResumeParams
} from '../types'

export class OrderSubscriptionRequestIngModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 정기구독 일시정지
     * @param params 일시정지 파라미터
     */
    async pause(params: OrderSubscriptionPauseParams): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        return this.bootpay.post<CommerceOrderSubscription>('order_subscriptions/requests/ing/pause', params)
    }

    /**
     * 정기구독 재개
     * @param params 재개 파라미터
     */
    async resume(params: OrderSubscriptionResumeParams): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        return this.bootpay.put<CommerceOrderSubscription>('order_subscriptions/requests/ing/resume', params)
    }

    /**
     * 해지 수수료 계산
     * @param orderSubscriptionId 정기구독 ID (선택)
     * @param orderNumber 주문번호 (선택)
     */
    async calculateTerminationFee(
        orderSubscriptionId?: string,
        orderNumber?: string
    ): Promise<BootpayCommerceResponse<CalcTerminateFeeResponse>> {
        if (!orderSubscriptionId && !orderNumber) {
            return Promise.reject({
                success: false,
                error: 'orderSubscriptionId or orderNumber is required'
            })
        }

        const queryParams = new URLSearchParams()
        if (orderSubscriptionId) {
            queryParams.append('order_subscription_id', orderSubscriptionId)
        } else if (orderNumber) {
            queryParams.append('order_number', orderNumber)
        }

        return this.bootpay.get<CalcTerminateFeeResponse>(
            `order_subscriptions/requests/ing/calculate_termination_fee?${queryParams.toString()}`
        )
    }

    /**
     * 주문번호로 해지 수수료 계산
     * @param orderNumber 주문번호
     */
    async calculateTerminationFeeByOrderNumber(
        orderNumber: string
    ): Promise<BootpayCommerceResponse<CalcTerminateFeeResponse>> {
        return this.calculateTerminationFee(undefined, orderNumber)
    }

    /**
     * 정기구독 해지
     * @param params 해지 파라미터
     */
    async termination(params: OrderSubscriptionTerminationParams): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        return this.bootpay.post<CommerceOrderSubscription>('order_subscriptions/requests/ing/termination', params)
    }
}

export class OrderSubscriptionModule {
    private bootpay: BootpayCommerceResource
    public requestIng: OrderSubscriptionRequestIngModule

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
        this.requestIng = new OrderSubscriptionRequestIngModule(bootpay)
    }

    /**
     * 정기구독 목록 조회
     * @param params 조회 파라미터
     */
    async list(params?: OrderSubscriptionListParams): Promise<BootpayCommerceResponse<{ items: CommerceOrderSubscription[]; total: number }>> {
        const queryParams = new URLSearchParams()
        if (params) {
            if (params.page !== undefined) queryParams.append('page', params.page.toString())
            if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
            if (params.keyword) queryParams.append('keyword', params.keyword)
            if (params.s_at) queryParams.append('s_at', params.s_at)
            if (params.e_at) queryParams.append('e_at', params.e_at)
            if (params.request_type) queryParams.append('request_type', params.request_type)
            if (params.user_group_id) queryParams.append('user_group_id', params.user_group_id)
            if (params.user_id) queryParams.append('user_id', params.user_id)
        }
        const query = queryParams.toString()
        return this.bootpay.get<{ items: CommerceOrderSubscription[]; total: number }>(`order_subscriptions${query ? `?${query}` : ''}`)
    }

    /**
     * 정기구독 상세 조회
     * @param orderSubscriptionId 정기구독 ID
     */
    async detail(orderSubscriptionId: string): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        return this.bootpay.get<CommerceOrderSubscription>(`order_subscriptions/${orderSubscriptionId}`)
    }

    /**
     * 정기구독 수정
     * @param params 수정 파라미터
     */
    async update(params: OrderSubscriptionUpdateParams): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        if (!params.order_subscription_id) {
            return Promise.reject({ success: false, error: 'order_subscription_id is required' })
        }
        return this.bootpay.put<CommerceOrderSubscription>(`order_subscriptions/${params.order_subscription_id}`, params)
    }

    async supervisorApprove(
        orderSubscriptionId: string,
        params: SupervisorOrderSubscriptionApproveParams = {}
    ): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        return this.bootpay.put<CommerceOrderSubscription>(`order_subscriptions/${orderSubscriptionId}/approve`, params)
    }

    async supervisorReject(
        orderSubscriptionId: string,
        params: SupervisorOrderSubscriptionRejectParams = {}
    ): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        return this.bootpay.put<CommerceOrderSubscription>(`order_subscriptions/${orderSubscriptionId}/reject`, params)
    }

    async supervisorTerminate(
        orderSubscriptionId: string,
        params: SupervisorOrderSubscriptionTerminateParams = {}
    ): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        return this.bootpay.put<CommerceOrderSubscription>(`order_subscriptions/${orderSubscriptionId}/terminate`, params)
    }

    async supervisorPause(
        orderSubscriptionId: string,
        params: SupervisorOrderSubscriptionPauseParams
    ): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        return this.bootpay.put<CommerceOrderSubscription>(`order_subscriptions/${orderSubscriptionId}/pause`, params)
    }

    async supervisorResume(
        orderSubscriptionId: string,
        params: SupervisorOrderSubscriptionResumeParams = {}
    ): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        return this.bootpay.put<CommerceOrderSubscription>(`order_subscriptions/${orderSubscriptionId}/resume`, params)
    }
}
