import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { randomUUID } from 'crypto'

export class StoreModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 가맹점 기본 정보 조회 (/v1/store)
     * @param idempotencyKey 미지정시 자동 생성
     */
    async getStore(idempotencyKey?: string): Promise<BootpayCommerceResponse<any>> {
        return this.bootpay.get<any>('store', {
            headers: this.storeHeaders(idempotencyKey)
        })
    }

    async info(idempotencyKey?: string): Promise<BootpayCommerceResponse<any>> {
        return this.getStore(idempotencyKey)
    }

    /**
     * 가맹점 상세 정보 조회 (/v1/store/detail)
     * @param idempotencyKey 미지정시 자동 생성
     */
    async getStoreDetail(idempotencyKey?: string): Promise<BootpayCommerceResponse<any>> {
        return this.bootpay.get<any>('store/detail', {
            headers: this.storeHeaders(idempotencyKey)
        })
    }

    async detail(idempotencyKey?: string): Promise<BootpayCommerceResponse<any>> {
        return this.getStoreDetail(idempotencyKey)
    }

    /**
     * 가맹점 정보 조회 요청 헤더
     * Idempotency-Key 는 미지정시 매 호출마다 생성된다.
     */
    private storeHeaders(idempotencyKey?: string): Record<string, string> {
        return {
            'Idempotency-Key': idempotencyKey || randomUUID()
        }
    }
}
