const { getCommerceKeys, ALIMTALK_TEST_DATA, alimtalkSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 웹훅 서명 시크릿 재발급
// POST /v1/alimtalk/webhook/secret
// ⚠️ 이 응답에서만 secret 원문을 돌려준다(이후 조회는 마스킹된다).
// ⚠️ 이미 큐에 있는 전송 건은 발송 당시 시크릿으로 서명된다.
// 서명 검증: X-Bootpay-Signature: sha256=HMAC_SHA256(secret, "{X-Bootpay-Timestamp}.{raw_body}")

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
        if (!alimtalkSideEffectAllowed('alimtalkWebhookRotateSecret')) return

        const response = await commerce.alimtalkWebhook.rotateSecret()
        console.log('Alimtalk Webhook Rotate Secret:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
