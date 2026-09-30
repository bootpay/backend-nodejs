const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 상품문의 단건 조회
// GET /v1/product-qnas/{product_qna_id}
// 다른 사람의 비밀글은 403 PRODUCT_QNA_SECRET_FORBIDDEN.

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
        const response = await commerce.productQna.detail(COMMERCE_TEST_DATA.product_qna_id, {
            user_id: COMMERCE_TEST_DATA.user_id
        })
        console.log('ProductQna Detail:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
