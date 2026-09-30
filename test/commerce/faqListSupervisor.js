const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - FAQ 목록 조회 (운영자 모드)
// GET /v1/faqs
// supervisor: true + view: 'all' 이면 비공개 FAQ 까지 조회된다.

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
        const response = await commerce.faq.list({
            view: 'all',
            supervisor: true
        })
        console.log('Faq List (supervisor):', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
