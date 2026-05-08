const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 장바구니 주문 미리보기 (V1 단일 결제 계산 endpoint)
//
// V1 결제 계산은 cart/order-preview 단일 호출로 처리:
// - cart_items + zipcode → 상품금액 + 배송비 권위 검증
// - coupon_ids[] → 쿠폰 권위 검증 (coupon_discount_amount + applied_coupons[])
// - point_amount → 적립금 권위 검증 (point_use_amount + point_max_usable + point_balance_after)
// - summary.total_order_price 가 결제 금액 (= product + delivery - coupon - point)
//
// member_mode='guest' 호출: cart_items 직접 전달 (서버 장바구니 불필요)
// member_mode='member' 호출: 회원 cart 사용 (cart_items 무시)

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: keys.client_key,
        secret_key: keys.secret_key,
        mode: keys.mode
    })

    try {
        // (legacy) application_id 방식에서만 필요. ck/sk 는 매 요청 Basic Auth 헤더로 직접 인증되므로 호출 불필요.
        // await commerce.getAccessToken()
        const response = await commerce.cart.orderPreview({
            member_mode: 'guest',
            cart_items: [
                {
                    product_id: 'PRODUCT_ID_HERE',
                    quantity: 1
                }
            ],
            shipping_address: { zipcode: '63000' },
            coupon_ids: [],
            point_amount: 0
        })
        console.log('Cart Order Preview:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
