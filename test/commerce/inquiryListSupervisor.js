const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 1:1 문의 목록 조회 (운영자 모드)
// GET /v1/inquiries
// supervisor: true 면 몰 전체 문의 — answered: false 는 미답변만 본다.

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
            answered: false,
            supervisor: true
        })
        console.log('Inquiry List (supervisor):', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
