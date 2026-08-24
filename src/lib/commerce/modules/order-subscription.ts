import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    CommerceOrderSubscription,
    OrderSubscriptionListParams,
    OrderSubscriptionUpdateParams,
    OrderSubscriptionPauseParams,
    OrderSubscriptionResumeParams,
    OrderSubscriptionPurchaseParams,
    OrderSubscriptionTransferParams,
    OrderSubscriptionTerminationParams,
    CalcTerminateFeeResponse,
    SupervisorOrderSubscriptionApproveParams,
    SupervisorOrderSubscriptionRejectParams,
    SupervisorOrderSubscriptionTerminateParams,
    SupervisorOrderSubscriptionPauseParams,
    SupervisorOrderSubscriptionResumeParams,
    SupervisorOrderSubscriptionChargeParams,
    SupervisorOrderSubscriptionChargeRevokeParams,
    OrderSubscriptionChargeResponse,
    OrderSubscriptionChargeRevokeResponse
} from '../types'
import { randomUUID } from 'crypto'

export class OrderSubscriptionRequestIngModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 정기구독 일시정지 요청
     * POST /v1/order_subscriptions/requests/ing/pause
     * @param params 일시정지 파라미터
     */
    async pause(params: OrderSubscriptionPauseParams): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        const { idempotency_key, ...payload } = params
        return this.bootpay.post<CommerceOrderSubscription>(
            'order_subscriptions/requests/ing/pause',
            this.compact(payload),
            { headers: this.userHeaders(idempotency_key) }
        )
    }

    /**
     * 정기구독 재개 요청
     * PUT /v1/order_subscriptions/requests/ing/resume
     * ⚠️ requests/ing 계열 중 유일하게 PUT 이다. 오타로 보고 POST 로 바꾸지 말 것.
     * @param params 재개 파라미터
     */
    async resume(params: OrderSubscriptionResumeParams): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        const { idempotency_key, ...payload } = params
        return this.bootpay.put<CommerceOrderSubscription>(
            'order_subscriptions/requests/ing/resume',
            this.compact(payload),
            { headers: this.userHeaders(idempotency_key) }
        )
    }

    /**
     * 중도인수 요청
     * POST /v1/order_subscriptions/requests/ing/purchase
     * @param params 중도인수 파라미터
     */
    async purchase(params: OrderSubscriptionPurchaseParams): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        const { idempotency_key, ...payload } = params
        return this.bootpay.post<CommerceOrderSubscription>(
            'order_subscriptions/requests/ing/purchase',
            this.compact(payload),
            { headers: this.userHeaders(idempotency_key) }
        )
    }

    /**
     * 구독 이전/승계 요청
     * POST /v1/order_subscriptions/requests/ing/transfer
     * @param params 이전/승계 파라미터
     */
    async transfer(params: OrderSubscriptionTransferParams): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        const { idempotency_key, ...payload } = params
        return this.bootpay.post<CommerceOrderSubscription>(
            'order_subscriptions/requests/ing/transfer',
            this.compact(payload),
            { headers: this.userHeaders(idempotency_key) }
        )
    }

    /**
     * 중도해지 수수료 사전계산
     * GET /v1/order_subscriptions/requests/ing/calculate_termination_fee
     * 해지 요청 전에 얼마가 나오는지 미리 보여줄 때 쓴다.
     * @param orderSubscriptionId 정기구독 ID (선택)
     * @param orderNumber 주문번호 (선택)
     * @param idempotencyKey 미지정시 자동 생성
     */
    async calculateTerminationFee(
        orderSubscriptionId?: string,
        orderNumber?: string,
        idempotencyKey?: string
    ): Promise<BootpayCommerceResponse<CalcTerminateFeeResponse>> {
        if (!orderSubscriptionId && !orderNumber) {
            return Promise.reject({
                success: false,
                error: 'orderSubscriptionId or orderNumber is required'
            })
        }

        const queryParams = new URLSearchParams()
        if (orderSubscriptionId) queryParams.append('order_subscription_id', orderSubscriptionId)
        if (orderNumber) queryParams.append('order_number', orderNumber)

        return this.bootpay.get<CalcTerminateFeeResponse>(
            `order_subscriptions/requests/ing/calculate_termination_fee?${queryParams.toString()}`,
            { headers: this.userHeaders(idempotencyKey) }
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
     * 중도해지 요청
     * POST /v1/order_subscriptions/requests/ing/termination
     * @param params 해지 파라미터
     */
    async termination(params: OrderSubscriptionTerminationParams): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        const { idempotency_key, ...payload } = params
        return this.bootpay.post<CommerceOrderSubscription>(
            'order_subscriptions/requests/ing/termination',
            this.compact(payload),
            { headers: this.userHeaders(idempotency_key) }
        )
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
     * requests/ing 요청 헤더 — 구매자가 올리는 요청이므로 user scope 다.
     * Idempotency-Key 는 미지정시 매 호출마다 생성된다.
     */
    private userHeaders(idempotencyKey?: string): Record<string, string> {
        return {
            'Idempotency-Key': idempotencyKey || randomUUID(),
            'BOOTPAY-ROLE': 'user'
        }
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
            if (params.search_date_from) queryParams.append('search_date_from', params.search_date_from)
            if (params.search_date_to) queryParams.append('search_date_to', params.search_date_to)
            if (params.s_at) queryParams.append('s_at', params.s_at)
            if (params.e_at) queryParams.append('e_at', params.e_at)
            if (params.request_type) queryParams.append('request_type', params.request_type)
            if (params.user_group_id) queryParams.append('user_group_id', params.user_group_id)
            if (params.status !== undefined) queryParams.append('status', params.status.toString())
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
     * 구독 계약 내용 변경
     * PUT /v1/order_subscriptions/{order_subscription_id}
     * 바뀐 값만 보내면 된다 (나머지는 서버가 그대로 유지한다).
     * @param params 수정 파라미터
     */
    async update(params: OrderSubscriptionUpdateParams): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        if (!params.order_subscription_id) {
            return Promise.reject({ success: false, error: 'order_subscription_id is required' })
        }
        const { order_subscription_id, idempotency_key, ...payload } = params
        return this.bootpay.put<CommerceOrderSubscription>(
            `order_subscriptions/${order_subscription_id}`,
            this.compact(payload),
            { headers: this.supervisorHeaders(idempotency_key) }
        )
    }

    /**
     * 구독 관리자 승인
     * PUT /v1/order_subscriptions/{order_subscription_id}/approve
     * ⚠️ 서버가 supervisor scope 를 요구한다 (scope_invalid!).
     */
    async supervisorApprove(
        orderSubscriptionId: string,
        params: SupervisorOrderSubscriptionApproveParams = {}
    ): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        const { idempotency_key, ...payload } = params
        return this.bootpay.put<CommerceOrderSubscription>(
            `order_subscriptions/${orderSubscriptionId}/approve`,
            this.compact(payload),
            { headers: this.supervisorHeaders(idempotency_key) }
        )
    }

    /**
     * 구독 관리자 반려
     * PUT /v1/order_subscriptions/{order_subscription_id}/reject
     * ⚠️ 서버가 supervisor scope 를 요구한다 (scope_invalid!).
     */
    async supervisorReject(
        orderSubscriptionId: string,
        params: SupervisorOrderSubscriptionRejectParams = {}
    ): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        const { idempotency_key, ...payload } = params
        return this.bootpay.put<CommerceOrderSubscription>(
            `order_subscriptions/${orderSubscriptionId}/reject`,
            this.compact(payload),
            { headers: this.supervisorHeaders(idempotency_key) }
        )
    }

    /**
     * 구독 관리자 해지
     * PUT /v1/order_subscriptions/{order_subscription_id}/terminate
     * ⚠️ 서버가 supervisor scope 를 요구한다 (scope_invalid!).
     */
    async supervisorTerminate(
        orderSubscriptionId: string,
        params: SupervisorOrderSubscriptionTerminateParams = {}
    ): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        const { idempotency_key, ...payload } = params
        return this.bootpay.put<CommerceOrderSubscription>(
            `order_subscriptions/${orderSubscriptionId}/terminate`,
            this.compact(payload),
            { headers: this.supervisorHeaders(idempotency_key) }
        )
    }

    /**
     * 구독 관리자 일시정지
     * PUT /v1/order_subscriptions/{order_subscription_id}/pause
     * ⚠️ 서버가 supervisor scope 를 요구한다 (scope_invalid!).
     */
    async supervisorPause(
        orderSubscriptionId: string,
        params: SupervisorOrderSubscriptionPauseParams
    ): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        const { idempotency_key, ...payload } = params
        return this.bootpay.put<CommerceOrderSubscription>(
            `order_subscriptions/${orderSubscriptionId}/pause`,
            this.compact(payload),
            { headers: this.supervisorHeaders(idempotency_key) }
        )
    }

    /**
     * 구독 관리자 재개
     * PUT /v1/order_subscriptions/{order_subscription_id}/resume
     * ⚠️ 서버가 supervisor scope 를 요구한다 (scope_invalid!).
     */
    async supervisorResume(
        orderSubscriptionId: string,
        params: SupervisorOrderSubscriptionResumeParams = {}
    ): Promise<BootpayCommerceResponse<CommerceOrderSubscription>> {
        const { idempotency_key, ...payload } = params
        return this.bootpay.put<CommerceOrderSubscription>(
            `order_subscriptions/${orderSubscriptionId}/resume`,
            this.compact(payload),
            { headers: this.supervisorHeaders(idempotency_key) }
        )
    }

    /**
     * 수시결제(온디맨드) charge_key 즉시 결제
     * POST /v1/order_subscriptions/charge
     * charge_key 는 body 로만 전송한다 (URL/query 금지 — 액세스 로그 노출 방지)
     * @param params 결제 파라미터
     */
    async supervisorCharge(
        params: SupervisorOrderSubscriptionChargeParams
    ): Promise<BootpayCommerceResponse<OrderSubscriptionChargeResponse>> {
        const { idempotency_key, ...payload } = params
        return this.bootpay.post<OrderSubscriptionChargeResponse>('order_subscriptions/charge', this.compact(payload), {
            headers: this.supervisorHeaders(idempotency_key)
        })
    }

    /**
     * 수시결제(온디맨드) charge_key 해지
     * DELETE /v1/order_subscriptions/charge
     * 해지 이후 해당 키로의 재결제는 불가능하다
     * @param params 해지 파라미터
     */
    async supervisorChargeRevoke(
        params: SupervisorOrderSubscriptionChargeRevokeParams
    ): Promise<BootpayCommerceResponse<OrderSubscriptionChargeRevokeResponse>> {
        const { idempotency_key, ...payload } = params
        return this.bootpay.delete<OrderSubscriptionChargeRevokeResponse>('order_subscriptions/charge', {
            data: this.compact(payload),
            headers: this.supervisorHeaders(idempotency_key)
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
     * supervisor 전용 요청 헤더
     * Idempotency-Key 는 미지정시 매 호출마다 생성된다.
     */
    private supervisorHeaders(idempotencyKey?: string): Record<string, string> {
        return {
            'Idempotency-Key': idempotencyKey || randomUUID(),
            'BOOTPAY-ROLE': 'supervisor'
        }
    }
}
