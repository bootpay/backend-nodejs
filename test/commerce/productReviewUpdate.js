const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 상품평 수정
// PUT /v1/reviews/{product_review_id} — 작성 회원 본인, 작성 후 7일 이내
// 7일이 지나면 REVIEW_EDIT_TIME_EXPIRED.

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
        const response = await commerce.productReview.update(COMMERCE_TEST_DATA.product_review_id, {
            user_id: COMMERCE_TEST_DATA.user_id,
            rating: 4,
            content: '한 달 써보니 조금 늘어나지만 만족합니다.'
        })
        console.log('ProductReview Update:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
