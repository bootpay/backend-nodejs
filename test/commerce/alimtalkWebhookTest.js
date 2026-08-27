const { getCommerceKeys, ALIMTALK_TEST_DATA, alimtalkSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 웹훅 테스트 이벤트 발송
// POST /v1/alimtalk/webhook/test
// ⚠️ 설정된 URL 로 실제 HTTP 요청이 나간다. 구독 여부와 무관하게 보낸다.
// 웹훅이 설정돼 있지 않으면 3029.

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
        if (!alimtalkSideEffectAllowed('alimtalkWebhookTest')) return

        const response = await commerce.alimtalkWebhook.test()
        console.log('Alimtalk Webhook Test:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
