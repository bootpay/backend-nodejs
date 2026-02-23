import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'

export class StoreModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 가맹점 기본 정보 조회 (/v1/store)
     */
    async getStore(): Promise<BootpayCommerceResponse<any>> {
        return this.bootpay.get<any>('store')
    }

    async info(): Promise<BootpayCommerceResponse<any>> {
        return this.getStore()
    }

    /**
     * 가맹점 상세 정보 조회 (/v1/store/detail)
     */
    async getStoreDetail(): Promise<BootpayCommerceResponse<any>> {
        return this.bootpay.get<any>('store/detail')
    }

    async detail(): Promise<BootpayCommerceResponse<any>> {
        return this.getStoreDetail()
    }
}
