import { BootpayCommerceResource, BootpayCommerceResponse } from '../../commerce-resource'
import { OrderPreviewParams, OrderPreviewResponse } from '../types'

export class CartModule {
    private bootpay: BootpayCommerceResource

    constructor(bootpay: BootpayCommerceResource) {
        this.bootpay = bootpay
    }

    /**
     * 주문 미리보기 (배송비/할인 권위적 계산)
     * POST /v1/cart/order-preview
     *
     * member_mode='guest' (기본): cart_items 필수
     * member_mode='member': 서버 장바구니 사용 (user 토큰 필요)
     */
    async orderPreview(
        params: OrderPreviewParams = {}
    ): Promise<BootpayCommerceResponse<OrderPreviewResponse>> {
        return this.bootpay.post<OrderPreviewResponse>('cart/order-preview', params)
    }
}
