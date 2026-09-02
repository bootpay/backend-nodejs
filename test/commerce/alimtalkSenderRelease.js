const { getCommerceKeys, ALIMTALK_TEST_DATA, alimtalkSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 채널 연동 해지
// DELETE /v1/alimtalk/senders/{ksp_id}
// 이 프로젝트와의 연동만 끊는다 — 채널 모델과 템플릿은 보존된다. 성공 시 본문은 null 이다.

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
        if (!alimtalkSideEffectAllowed('alimtalkSenderRelease')) return

        const response = await commerce.alimtalkSender.release(ALIMTALK_TEST_DATA.ksp_id)
        console.log('Alimtalk Sender Release:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
