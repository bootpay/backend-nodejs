const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 상품평 작성
// POST /v1/reviews — 회원 전용
// order_id 는 회원의 구매확정 주문, product_id 는 그 주문에 담긴 상품이어야 한다.
// images 는 사진 URL 최대 5개 — 파일 업로드는 지원하지 않는다.

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
        const response = await commerce.productReview.create({
            user_id: COMMERCE_TEST_DATA.user_id,
            order_id: COMMERCE_TEST_DATA.order_id,
            product_id: COMMERCE_TEST_DATA.product_id,
            rating: 5,
            content: '배송도 빠르고 품질도 좋아요. 재구매 의사 있습니다.',
            images: ['https://example.com/review-1.jpg']
        })
        console.log('ProductReview Create:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
