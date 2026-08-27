const { getCommerceKeys, ALIMTALK_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 채널 상세 조회
// GET /v1/alimtalk/senders/{ksp_id}
// ⚠️ 미연동/미존재 채널은 404, 다른 프로젝트의 채널은 403 으로 오며 둘 다 error_code 는 3024 다.

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
        // sync 미지정 — 자체 DB 만 본다
        const response = await commerce.alimtalkSender.detail(ALIMTALK_TEST_DATA.ksp_id)
        console.log('Alimtalk Sender Detail:', JSON.stringify(response, null, 2))

        // sync: true — 벤더에서 채널 상태를 다시 읽어 반영한다(느리다)
        const synced = await commerce.alimtalkSender.detail(ALIMTALK_TEST_DATA.ksp_id, true)
        console.log('Alimtalk Sender Detail (sync):', JSON.stringify(synced, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
