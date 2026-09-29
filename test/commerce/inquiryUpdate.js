const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 1:1 문의 수정
// PUT /v1/inquiries/{inquiry_id} — 작성 회원 본인, 답변 전만
// 답변이 달린 문의는 409 INQUIRY_ALREADY_ANSWERED.

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
        const response = await commerce.inquiry.update(COMMERCE_TEST_DATA.inquiry_id, {
            user_id: COMMERCE_TEST_DATA.user_id,
            content: '주문한 상품의 출고일을 알려주세요.'
        })
        console.log('Inquiry Update:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
