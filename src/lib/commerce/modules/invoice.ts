import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { CommerceInvoice, InvoiceListParams, InvoiceListResponse } from '../types'
import { randomUUID } from 'crypto'

export class InvoiceModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 청구서 목록 조회
     * GET /v1/invoices
     * 응답은 { list: [...], count: N } 구조다 ({ items, total } 아님).
     * limit 미지정시 서버 기본값과 동일한 24 를 보낸다.
     * @param params 조회 파라미터
     */
    async list(params?: InvoiceListParams): Promise<BootpayCommerceResponse<InvoiceListResponse>> {
        const { idempotency_key, ...rest } = params || {}
        const queryParams = new URLSearchParams()
        queryParams.append('page', (rest.page === undefined ? 1 : rest.page).toString())
        queryParams.append('limit', (rest.limit === undefined ? 24 : rest.limit).toString())
        if (rest.keyword) queryParams.append('keyword', rest.keyword)
        if (rest.cs_type) queryParams.append('cs_type', rest.cs_type)
        if (rest.user_id) queryParams.append('user_id', rest.user_id)
        if (rest.product_type !== undefined) queryParams.append('product_type', rest.product_type.toString())
        if (rest.css_at) queryParams.append('css_at', rest.css_at)
        if (rest.cse_at) queryParams.append('cse_at', rest.cse_at)

        return this.bootpay.get<InvoiceListResponse>(`invoices?${queryParams.toString()}`, {
            headers: this.invoiceHeaders(idempotency_key)
        })
    }

    /**
     * 청구서 생성
     * @param invoice 청구서 정보
     */
    async create(invoice: CommerceInvoice): Promise<BootpayCommerceResponse<CommerceInvoice>> {
        return this.bootpay.post<CommerceInvoice>('invoices', invoice)
    }

    /**
     * 청구서 알림 재발송
     * POST /v1/invoices/{invoice_id}/notify
     * sendTypes 미전달시 서버가 빈 배열로 처리한다.
     * ⚠️ 실제 고객에게 알림이 발송되므로 테스트 호출 주의.
     * @param invoiceId 청구서 ID
     * @param sendTypes 발송 타입 배열 (예: [1, 2] - SMS, Email 등)
     * @param idempotencyKey 미지정시 자동 생성
     */
    async notify(
        invoiceId: string,
        sendTypes?: number[],
        idempotencyKey?: string
    ): Promise<BootpayCommerceResponse<null>> {
        const payload: Record<string, any> = {}
        if (sendTypes !== undefined && sendTypes !== null) payload.send_types = sendTypes
        return this.bootpay.post<null>(`invoices/${invoiceId}/notify`, payload, {
            headers: this.invoiceHeaders(idempotencyKey)
        })
    }

    /**
     * 청구서 상세 조회
     * GET /v1/invoices/{invoice_id}
     * @param invoiceId 청구서 ID
     * @param idempotencyKey 미지정시 자동 생성
     */
    async detail(invoiceId: string, idempotencyKey?: string): Promise<BootpayCommerceResponse<CommerceInvoice>> {
        return this.bootpay.get<CommerceInvoice>(`invoices/${invoiceId}`, {
            headers: this.invoiceHeaders(idempotencyKey)
        })
    }

    /**
     * 청구서 API 요청 헤더
     * Idempotency-Key 는 미지정시 매 호출마다 생성된다.
     */
    private invoiceHeaders(idempotencyKey?: string): Record<string, string> {
        return {
            'Idempotency-Key': idempotencyKey || randomUUID(),
            'BOOTPAY-ROLE': 'user'
        }
    }
}
