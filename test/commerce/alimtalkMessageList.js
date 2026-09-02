const { getCommerceKeys, ALIMTALK_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 발송내역 목록 조회
// GET /v1/alimtalk/messages
// ⚠️ 유료 알림톡만 조회된다(무료 커머스 알림톡은 포함되지 않는다).
// ⚠️ 기간 기본값은 최근 30일, 최대 조회 폭은 92일이다 — 초과분은 시작일을 당겨 잘라내므로
//    실제 적용 구간은 응답의 period 로 확인한다.

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
        const response = await commerce.alimtalkMessage.list({
            status: 'success',
            page: 1,
            limit: 20, // 서버 기본 20, 최대 100
            s_at: ALIMTALK_TEST_DATA.s_at || undefined,
            e_at: ALIMTALK_TEST_DATA.e_at || undefined
        })
        console.log('Alimtalk Message List:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
