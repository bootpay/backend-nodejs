import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { SendTestWebhookParams } from '../types'
import { randomUUID } from 'crypto'

export class WebhookModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 테스트 웹훅 발송
     * POST /v1/webhook/test
     * 등록된 웹훅 URL 로 테스트 페이로드를 보내 연동을 확인할 때 쓴다.
     * @param params 발송 파라미터 (header_content_type 미지정시 전송하지 않는다)
     */
    async sendTest(params?: SendTestWebhookParams): Promise<BootpayCommerceResponse<any>> {
        const { idempotency_key, ...payload } = params || {}
        return this.bootpay.post<any>('webhook/test', this.compact(payload), {
            headers: { 'Idempotency-Key': idempotency_key || randomUUID() }
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
}
