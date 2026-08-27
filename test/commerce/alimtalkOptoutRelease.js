const { getCommerceKeys, ALIMTALK_TEST_DATA, alimtalkSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 수신거부 해제
// DELETE /v1/alimtalk/optouts/{phone}
// 내 프로젝트 스코프 건만 해제되며 멱등이다(없어도 성공).
// ⚠️ 전역 차단은 해제되지 않고 global_blocked: true 로 알려 준다.

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
        if (!alimtalkSideEffectAllowed('alimtalkOptoutRelease')) return

        const response = await commerce.alimtalkOptout.release(ALIMTALK_TEST_DATA.phone)
        console.log('Alimtalk Optout Release:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
