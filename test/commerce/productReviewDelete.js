const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 상품평 삭제
// DELETE /v1/reviews/{product_review_id} — 작성 회원 본인 또는 supervisor
// 지급된 적립금 회수·상품 통계 차감이 함께 일어난다.

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
        const response = await commerce.productReview.delete(COMMERCE_TEST_DATA.product_review_id, {
            user_id: COMMERCE_TEST_DATA.user_id
        })
        console.log('ProductReview Delete:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
