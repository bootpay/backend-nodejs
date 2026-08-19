import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { CommerceOrderSubscriptionBill, OrderSubscriptionBillListParams } from '../types'
import { randomUUID } from 'crypto'

export class OrderSubscriptionBillModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 정기구독 빌(회차) 목록 조회
     * GET /v1/order_subscription_bills
     * ⚠️ 경로가 order_subscription_bills — 언더스코어다 (하이픈 아님).
     * page/limit 미지정시 각각 1 / 20 이 적용된다.
     * @param params 조회 파라미터
     */
    async list(params?: OrderSubscriptionBillListParams): Promise<BootpayCommerceResponse<{ items: CommerceOrderSubscriptionBill[]; total: number }>> {
        const { idempotency_key, ...rest } = params || {}
        const queryParams = new URLSearchParams()
        if (rest.order_subscription_id) queryParams.append('order_subscription_id', rest.order_subscription_id)
        queryParams.append('page', (rest.page === undefined ? 1 : rest.page).toString())
        queryParams.append('limit', (rest.limit === undefined ? 20 : rest.limit).toString())
        if (rest.keyword) queryParams.append('keyword', rest.keyword)
        if (rest.status && rest.status.length > 0) {
            queryParams.append('status', rest.status.join(','))
        }
        return this.bootpay.get<{ items: CommerceOrderSubscriptionBill[]; total: number }>(
            `order_subscription_bills?${queryParams.toString()}`,
            { headers: this.userHeaders(idempotency_key) }
        )
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

    /**
     * 빌 조회 요청 헤더
     * Idempotency-Key 는 미지정시 매 호출마다 생성된다.
     */
    private userHeaders(idempotencyKey?: string): Record<string, string> {
        return {
            'Idempotency-Key': idempotencyKey || randomUUID(),
            'BOOTPAY-ROLE': 'user'
        }
    }
}
