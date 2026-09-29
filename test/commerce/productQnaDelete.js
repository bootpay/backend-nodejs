const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 상품문의 삭제
// DELETE /v1/product-qnas/{product_qna_id} — 작성 회원 본인·비회원 비밀번호 또는 supervisor
// ⚠️ guest_password 는 URL 쿼리가 아니라 본문으로 나간다.

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
        const response = await commerce.productQna.delete(COMMERCE_TEST_DATA.product_qna_id, {
            user_id: COMMERCE_TEST_DATA.user_id
        })
        console.log('ProductQna Delete:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
