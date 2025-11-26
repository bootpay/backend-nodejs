import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    OrderCancelListParams,
    OrderCancelParams,
    OrderCancelActionParams,
    CommerceOrderCancelRequestHistory
} from '../types'

export class OrderCancelModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 취소 요청 목록 조회
     * @param params 조회 파라미터
     */
    async list(params?: OrderCancelListParams): Promise<BootpayCommerceResponse<{ items: CommerceOrderCancelRequestHistory[]; total: number }>> {
        const queryParams = new URLSearchParams()
        if (params) {
            if (params.order_id) queryParams.append('order_id', params.order_id)
            if (params.order_number) queryParams.append('order_number', params.order_number)
        }
        const query = queryParams.toString()
        return this.bootpay.get<{ items: CommerceOrderCancelRequestHistory[]; total: number }>(`order/cancel${query ? `?${query}` : ''}`)
    }

    /**
     * 취소 요청
     * @param params 취소 요청 파라미터
     */
    async request(params: OrderCancelParams): Promise<BootpayCommerceResponse<CommerceOrderCancelRequestHistory>> {
        return this.bootpay.post<CommerceOrderCancelRequestHistory>('order/cancel', params)
    }

    /**
     * 취소 요청 철회
     * @param orderCancelRequestHistoryId 취소 요청 이력 ID
     */
    async withdraw(orderCancelRequestHistoryId: string): Promise<BootpayCommerceResponse<null>> {
        return this.bootpay.put<null>(`order/cancel/${orderCancelRequestHistoryId}/withdraw`, {})
    }

    /**
     * 취소 승인
     * @param params 취소 승인 파라미터
     */
    async approve(params: OrderCancelActionParams): Promise<BootpayCommerceResponse<CommerceOrderCancelRequestHistory>> {
        if (!params.order_cancel_request_history_id) {
            return Promise.reject({ success: false, error: 'order_cancel_request_history_id is required' })
        }
        return this.bootpay.put<CommerceOrderCancelRequestHistory>(
            `order/cancel/${params.order_cancel_request_history_id}/approve`,
            params
        )
    }

    /**
     * 취소 거절
     * @param params 취소 거절 파라미터
     */
    async reject(params: OrderCancelActionParams): Promise<BootpayCommerceResponse<CommerceOrderCancelRequestHistory>> {
        if (!params.order_cancel_request_history_id) {
            return Promise.reject({ success: false, error: 'order_cancel_request_history_id is required' })
        }
        return this.bootpay.put<CommerceOrderCancelRequestHistory>(
            `order/cancel/${params.order_cancel_request_history_id}/reject`,
            params
        )
    }
}
