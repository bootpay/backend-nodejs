const { getCommerceKeys, ALIMTALK_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 웹훅 전송 이력 조회
// GET /v1/alimtalk/webhook/deliveries
// 성공·실패를 모두 남긴다.

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
        const response = await commerce.alimtalkWebhook.deliveries({ page: 1, limit: 20 })
        console.log('Alimtalk Webhook Deliveries:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
