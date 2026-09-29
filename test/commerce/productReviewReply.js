const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 상품평 판매자 답글 등록·수정
// PUT /v1/reviews/{product_review_id}/reply — supervisor 전용
// 답글이 없으면 만들고, 있으면 내용을 바꾼다(10자 이상).

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
        const response = await commerce.productReview.reply(COMMERCE_TEST_DATA.product_review_id, '소중한 후기 감사합니다. 또 방문해주세요!')
        console.log('ProductReview Reply:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
