const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 상품평 목록 조회
// GET /v1/reviews
// 회원 모드는 user_id·login_id·user_jwt 로 정한 회원이 쓴 상품평만 본다.
// 상품 상세의 공개 상품평 목록은 GET /v1/products/{product_id}/reviews 를 쓴다.

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
        const response = await commerce.productReview.list({
            user_id: COMMERCE_TEST_DATA.user_id,
            page: 1,
            limit: 20
        })
        console.log('ProductReview List:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
