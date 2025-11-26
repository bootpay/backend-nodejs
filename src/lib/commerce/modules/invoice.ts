import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { CommerceInvoice, InvoiceListParams } from '../types'
import { ListParams } from '../types/common'

export class InvoiceModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 청구서 목록 조회
     * @param params 조회 파라미터
     */
    async list(params?: ListParams): Promise<BootpayCommerceResponse<{ items: CommerceInvoice[]; total: number }>> {
        const queryParams = new URLSearchParams()
        if (params) {
            if (params.page !== undefined) queryParams.append('page', params.page.toString())
            if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
            if (params.keyword) queryParams.append('keyword', params.keyword)
        }
        const query = queryParams.toString()
        return this.bootpay.get<{ items: CommerceInvoice[]; total: number }>(`invoices${query ? `?${query}` : ''}`)
    }

    /**
     * 청구서 생성
     * @param invoice 청구서 정보
     */
    async create(invoice: CommerceInvoice): Promise<BootpayCommerceResponse<CommerceInvoice>> {
        return this.bootpay.post<CommerceInvoice>('invoices', invoice)
    }

    /**
     * 청구서 알림 발송
     * @param invoiceId 청구서 ID
     * @param sendTypes 발송 타입 배열 (예: [1, 2] - SMS, Email 등)
     */
    async notify(invoiceId: string, sendTypes: number[]): Promise<BootpayCommerceResponse<null>> {
        return this.bootpay.post<null>(`invoices/${invoiceId}/notify`, { send_types: sendTypes })
    }

    /**
     * 청구서 상세 조회
     * @param invoiceId 청구서 ID
     */
    async detail(invoiceId: string): Promise<BootpayCommerceResponse<CommerceInvoice>> {
        return this.bootpay.get<CommerceInvoice>(`invoices/${invoiceId}`)
    }
}
