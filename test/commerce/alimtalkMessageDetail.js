const { getCommerceKeys, ALIMTALK_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 단건 발송 결과 조회
// GET /v1/alimtalk/messages/{receipt_id}
// 실패 사유는 error_code·error_message 에 담긴다.
// fallback_type 은 폴백이 꺼진 건이면 null, 켜진 건이면 LMS 다.
// 다른 프로젝트의 건이거나 없으면 404(3025).

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
        const response = await commerce.alimtalkMessage.detail(ALIMTALK_TEST_DATA.receipt_id)
        console.log('Alimtalk Message Detail:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
