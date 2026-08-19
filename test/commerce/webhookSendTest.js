const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 테스트 웹훅 발송 테스트
// POST /v1/webhook/test

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

        // header_content_type 미지정 — 서버 기본값으로 발송
        const response = await commerce.webhook.sendTest()
        console.log('Send Test Webhook Response:', JSON.stringify(response, null, 2))

        // Content-Type 지정 발송
        const withContentType = await commerce.webhook.sendTest({ header_content_type: 1 })
        console.log('Send Test Webhook (content-type) Response:', withContentType)
    } catch (e) {
        console.error('Error:', e)
    }
})()
