const { getCommerceKeys, ALIMTALK_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 기간 집계 조회
// GET /v1/alimtalk/messages/stats
// ⚠️ billing.unit_price_source 가 'default' 면 잠정 단가다(확정 청구액이 아니다).
// ⚠️ billing.billable_count 는 성공 − 폴백이다 — 폴백분은 LMS 단가로 따로 계산된다.

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
        const response = await commerce.alimtalkMessage.stats({
            s_at: ALIMTALK_TEST_DATA.s_at || undefined,
            e_at: ALIMTALK_TEST_DATA.e_at || undefined
        })
        console.log('Alimtalk Message Stats:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
