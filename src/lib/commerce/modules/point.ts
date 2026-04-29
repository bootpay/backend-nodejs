import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import {
    PointBalance,
    PointTransactionsParams,
    PointTransactionsResponse,
    PointPreviewUsageParams,
    PointPreviewUsageResponse,
    PointCalculateLimitParams,
    PointCalculateLimitResponse
} from '../types'

export class PointModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 적립금 잔액 조회
     */
    async balance(): Promise<BootpayCommerceResponse<PointBalance>> {
        return this.bootpay.get<PointBalance>('point/balance')
    }

    /**
     * 적립금 내역 조회
     */
    async transactions(
        params?: PointTransactionsParams
    ): Promise<BootpayCommerceResponse<PointTransactionsResponse>> {
        const queryParams = new URLSearchParams()
        if (params) {
            if (params.page !== undefined) queryParams.append('page', params.page.toString())
            if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
            if (params.transaction_type !== undefined) {
                queryParams.append('transaction_type', params.transaction_type.toString())
            }
        }
        const query = queryParams.toString()
        return this.bootpay.get<PointTransactionsResponse>(
            `point/transactions${query ? `?${query}` : ''}`
        )
    }

    /**
     * 적립금 사용 미리보기
     */
    async previewUsage(
        params: PointPreviewUsageParams
    ): Promise<BootpayCommerceResponse<PointPreviewUsageResponse>> {
        return this.bootpay.post<PointPreviewUsageResponse>('point/preview_usage', params)
    }

    /**
     * 적립금 사용 한도 계산
     */
    async calculateLimit(
        params: PointCalculateLimitParams
    ): Promise<BootpayCommerceResponse<PointCalculateLimitResponse>> {
        return this.bootpay.post<PointCalculateLimitResponse>('point/calculate_limit', params)
    }
}
