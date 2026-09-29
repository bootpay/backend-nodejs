const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 상품문의 답변 등록·수정
// PUT /v1/product-qnas/{product_qna_id}/answer — supervisor 전용
// 답변이 없으면 만들고, 있으면 내용을 바꾼다.

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
        const response = await commerce.productQna.answer(COMMERCE_TEST_DATA.product_qna_id, '정사이즈로 M 을 추천드립니다.')
        console.log('ProductQna Answer:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
