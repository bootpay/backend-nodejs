import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    OrderCancelListParams,
    OrderCancelParams,
    OrderCancelActionParams,
    OrderCancelWithdrawParams,
    CommerceOrderCancelRequestHistory
} from '../types'
import { randomUUID } from 'crypto'

export class OrderCancelModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 주문 취소 요청 내역 조회
     * GET /v1/order/cancel
     * order_number 또는 order_id 로 필터한다. 둘 다 없으면 전체.
     * approve / reject / withdraw 에 넘길 order_cancellation_request_id 를 여기서 얻는다.
     * @param params 조회 파라미터
     */
    async list(params?: OrderCancelListParams): Promise<BootpayCommerceResponse<{ items: CommerceOrderCancelRequestHistory[]; total: number }>> {
        const { idempotency_key, ...rest } = params || {}
        const queryParams = new URLSearchParams()
        if (rest.order_number) queryParams.append('order_number', rest.order_number)
        if (rest.order_id) queryParams.append('order_id', rest.order_id)
        const query = queryParams.toString()
        return this.bootpay.get<{ items: CommerceOrderCancelRequestHistory[]; total: number }>(
            `order/cancel${query ? `?${query}` : ''}`,
            { headers: this.userHeaders(idempotency_key) }
        )
    }

    /**
     * 취소 요청
     * @param params 취소 요청 파라미터
     */
    async request(params: OrderCancelParams): Promise<BootpayCommerceResponse<CommerceOrderCancelRequestHistory>> {
        return this.bootpay.post<CommerceOrderCancelRequestHistory>('order/cancel', params)
    }

    /**
     * (구매자) 주문 취소 요청 철회
     * PUT /v1/order/cancel/{order_cancellation_request_id}/withdraw
     * ⚠️ DELETE /v1/order/cancel/{id} 와는 다른 라우트다. 서버에 둘 다 있지만 매뉴얼이 문서화한 쪽은 withdraw 다.
     * @param params 취소 요청 이력 ID (문자열로 바로 넘겨도 된다)
     */
    async withdraw(params: OrderCancelWithdrawParams | string): Promise<BootpayCommerceResponse<null>> {
        const normalized = typeof params === 'string' ? { order_cancellation_request_id: params } : params
        const cancellationId = this.cancellationId(normalized)
        if (!cancellationId) {
            return Promise.reject({ success: false, error: 'order_cancellation_request_id is required' })
        }
        return this.bootpay.put<null>(`order/cancel/${cancellationId}/withdraw`, {}, {
            headers: this.userHeaders(normalized.idempotency_key)
        })
    }

    /**
     * (관리자) 취소 요청 승인
     * PUT /v1/order/cancel/{order_cancellation_request_id}/approve
     * @param params 취소 승인 파라미터
     */
    async approve(params: OrderCancelActionParams): Promise<BootpayCommerceResponse<CommerceOrderCancelRequestHistory>> {
        const cancellationId = this.cancellationId(params)
        if (!cancellationId) {
            return Promise.reject({ success: false, error: 'order_cancellation_request_id is required' })
        }
        return this.bootpay.put<CommerceOrderCancelRequestHistory>(
            `order/cancel/${cancellationId}/approve`,
            this.actionPayload(params),
            { headers: this.supervisorHeaders(params.idempotency_key) }
        )
    }

    /**
     * (관리자) 취소 요청 반려
     * PUT /v1/order/cancel/{order_cancellation_request_id}/reject
     * @param params 취소 거절 파라미터
     */
    async reject(params: OrderCancelActionParams): Promise<BootpayCommerceResponse<CommerceOrderCancelRequestHistory>> {
        const cancellationId = this.cancellationId(params)
        if (!cancellationId) {
            return Promise.reject({ success: false, error: 'order_cancellation_request_id is required' })
        }
        return this.bootpay.put<CommerceOrderCancelRequestHistory>(
            `order/cancel/${cancellationId}/reject`,
            this.actionPayload(params),
            { headers: this.supervisorHeaders(params.idempotency_key) }
        )
    }

    /**
     * 취소 요청 이력 ID 를 뽑는다.
     * 서버는 approve / reject / withdraw 셋 다 params[:id] 를 order_cancellation_request_id 로 동일하게 취급한다.
     * 정식 이름은 order_cancellation_request_id 이며, 구 이름 order_cancel_request_history_id 도 계속 받는다.
     */
    private cancellationId(params: OrderCancelActionParams | OrderCancelWithdrawParams): string | undefined {
        return params.order_cancellation_request_id || params.order_cancel_request_history_id
    }

    /**
     * 승인/반려 payload — 서버가 읽는 값은 message 다.
     */
    private actionPayload(params: OrderCancelActionParams): Record<string, any> {
        const { order_cancellation_request_id, order_cancel_request_history_id, idempotency_key, ...payload } = params
        return Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
        )
    }

    /**
     * 구매자 scope 요청 헤더
     */
    private userHeaders(idempotencyKey?: string): Record<string, string> {
        return {
            'Idempotency-Key': idempotencyKey || randomUUID(),
            'BOOTPAY-ROLE': 'user'
        }
    }

    /**
     * 관리자(승인/반려) scope 요청 헤더
     */
    private supervisorHeaders(idempotencyKey?: string): Record<string, string> {
        return {
            'Idempotency-Key': idempotencyKey || randomUUID(),
            'BOOTPAY-ROLE': 'supervisor'
        }
    }
}
