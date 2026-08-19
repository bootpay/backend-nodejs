import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    OrderSubscriptionRequest,
    OrderSubscriptionRequestListParams,
    OrderSubscriptionRequestUpdateParams
} from '../types'
import { randomUUID } from 'crypto'

/**
 * V1 OrderSubscription Request 조회/승인 모듈
 *
 * 본인 모드 (user role): project_id 없이 호출 → 본인 요청 목록/단건
 * 슈퍼바이저 모드 (supervisor role): project_id 포함 → 프로젝트 전체 + update (승인/거절)
 *
 * 구매자측 요청 생성 (pause/resume/purchase/termination/transfer) 은
 * `commerce.orderSubscription.requestIng.*` 모듈을 사용한다.
 *
 * ⚠️ 경로가 order-subscription-requests — 하이픈이다.
 *    order_subscriptions · order_subscription_bills 는 언더스코어라 복사해 고칠 때 가장 흔히 틀리는 지점.
 */
export class OrderSubscriptionRequestModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 구독 변경요청 목록 조회 (user / supervisor 공용)
     * GET /v1/order-subscription-requests
     * project_id 를 주면 supervisor 모드(프로젝트 전체 검색), 없으면 본인 요청만 조회한다.
     * page/limit 미지정시 각각 1 / 20 이 적용된다.
     */
    async list(
        params?: OrderSubscriptionRequestListParams
    ): Promise<BootpayCommerceResponse<{ items: OrderSubscriptionRequest[]; total: number }>> {
        const { idempotency_key, ...rest } = params || {}
        const queryParams = new URLSearchParams()
        if (rest.project_id) queryParams.append('project_id', rest.project_id)
        if (rest.order_subscription_id) queryParams.append('order_subscription_id', rest.order_subscription_id)
        queryParams.append('page', (rest.page === undefined ? 1 : rest.page).toString())
        queryParams.append('limit', (rest.limit === undefined ? 20 : rest.limit).toString())
        if (rest.keyword) queryParams.append('keyword', rest.keyword)
        if (rest.s_at) queryParams.append('s_at', rest.s_at)
        if (rest.e_at) queryParams.append('e_at', rest.e_at)
        if (rest.status !== undefined) queryParams.append('status', rest.status.toString())
        if (rest.request_type !== undefined) queryParams.append('request_type', rest.request_type.toString())
        if (rest.user_id) queryParams.append('user_id', rest.user_id)
        if (rest.user_group_id) queryParams.append('user_group_id', rest.user_group_id)

        return this.bootpay.get<{ items: OrderSubscriptionRequest[]; total: number }>(
            `order-subscription-requests?${queryParams.toString()}`,
            { headers: this.requestHeaders(rest.project_id, idempotency_key) }
        )
    }

    /**
     * 구독 변경요청 단건 조회 (user / supervisor 공용)
     * GET /v1/order-subscription-requests/{id}
     */
    async detail(
        orderSubscriptionRequestHistoryId: string,
        projectId?: string,
        idempotencyKey?: string
    ): Promise<BootpayCommerceResponse<OrderSubscriptionRequest>> {
        const queryParams = new URLSearchParams()
        if (projectId) queryParams.append('project_id', projectId)
        const query = queryParams.toString()
        return this.bootpay.get<OrderSubscriptionRequest>(
            `order-subscription-requests/${orderSubscriptionRequestHistoryId}${query ? `?${query}` : ''}`,
            { headers: this.requestHeaders(projectId, idempotencyKey) }
        )
    }

    /**
     * 구독 변경요청 승인/반려 (supervisor 전용)
     * PUT /v1/order-subscription-requests/{id}
     * ⚠️ 승인과 반려는 별도 액션이 아니다. 라우트는 index/show/update 셋뿐이고
     *    approval: 'approve' | 'reject' 파라미터로 갈린다.
     *    서버가 params[:action] 을 Rails 예약어로 쓰기 때문에 키 이름이 approval 이다.
     */
    async update(
        params: OrderSubscriptionRequestUpdateParams
    ): Promise<BootpayCommerceResponse<OrderSubscriptionRequest>> {
        const { order_subscription_request_history_id, idempotency_key, ...payload } = params
        return this.bootpay.put<OrderSubscriptionRequest>(
            `order-subscription-requests/${order_subscription_request_history_id}`,
            this.compact(payload as Record<string, any>),
            { headers: this.supervisorHeaders(idempotency_key) }
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
     * 조회 요청 헤더 — project_id 가 있으면 supervisor, 없으면 user scope 다.
     */
    private requestHeaders(projectId?: string, idempotencyKey?: string): Record<string, string> {
        return {
            'Idempotency-Key': idempotencyKey || randomUUID(),
            'BOOTPAY-ROLE': projectId ? 'supervisor' : 'user'
        }
    }

    /**
     * 승인/반려 요청 헤더 — 서버가 supervisor scope 를 요구한다.
     */
    private supervisorHeaders(idempotencyKey?: string): Record<string, string> {
        return {
            'Idempotency-Key': idempotencyKey || randomUUID(),
            'BOOTPAY-ROLE': 'supervisor'
        }
    }
}
