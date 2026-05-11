import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { CommerceCoupon, CouponListParams, CouponDownloadParams } from '../types'

export class CouponModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 사용자 보유 쿠폰 목록
     */
    async list(params?: CouponListParams): Promise<BootpayCommerceResponse<CommerceCoupon[]>> {
        const queryParams = new URLSearchParams()
        if (params) {
            if (params.status) queryParams.append('status', params.status)
            if (params.page !== undefined) queryParams.append('page', params.page.toString())
            if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
        }
        const query = queryParams.toString()
        return this.bootpay.get<CommerceCoupon[]>(`coupon${query ? `?${query}` : ''}`)
    }

    /**
     * 다운로드 가능한 쿠폰 목록
     */
    async available(): Promise<BootpayCommerceResponse<CommerceCoupon[]>> {
        return this.bootpay.get<CommerceCoupon[]>('coupon/available')
    }

    /**
     * 쿠폰 다운로드 (issue_from_template)
     */
    async download(params: CouponDownloadParams): Promise<BootpayCommerceResponse<CommerceCoupon>> {
        return this.bootpay.post<CommerceCoupon>('coupon/download', params)
    }
}
