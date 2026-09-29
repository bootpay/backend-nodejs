const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 상품문의 수정
// PUT /v1/product-qnas/{product_qna_id} — 작성 회원 본인 또는 비회원 비밀번호, 답변 전만
// 답변이 달린 문의는 409 PRODUCT_QNA_ALREADY_ANSWERED.

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
        const response = await commerce.productQna.update(COMMERCE_TEST_DATA.product_qna_id, {
            user_id: COMMERCE_TEST_DATA.user_id,
            content: '평소 L 사이즈를 입는데 어떤 사이즈가 맞을까요?'
        })
        console.log('ProductQna Update:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
