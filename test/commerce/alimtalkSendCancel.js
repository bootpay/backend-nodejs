const { getCommerceKeys, ALIMTALK_TEST_DATA, alimtalkSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 예약 발송 취소
// DELETE /v1/alimtalk/send/{receipt_id}
// 접수(READY) 상태의 예약 건만 취소할 수 있다 — 이미 전송에 들어갔으면 3023 이다.

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
        if (!alimtalkSideEffectAllowed('alimtalkSendCancel')) return

        const response = await commerce.alimtalkSend.cancel(ALIMTALK_TEST_DATA.receipt_id)
        console.log('Alimtalk Send Cancel:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
