const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 1:1 문의 목록 조회
// GET /v1/inquiries
// 회원 모드 — user_id·login_id·user_jwt 중 하나로 회원을 정하고 본인 문의만 본다.

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
        const response = await commerce.inquiry.list({
            user_id: COMMERCE_TEST_DATA.user_id,
            page: 1,
            limit: 20
        })
        console.log('Inquiry List:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
