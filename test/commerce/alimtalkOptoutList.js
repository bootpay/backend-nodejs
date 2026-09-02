const { getCommerceKeys, ALIMTALK_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 수신거부 목록 조회
// GET /v1/alimtalk/optouts
// phone 은 숫자만 남겨 부분일치로 찾는다(정확 매칭이 아니다). 50건 단위로 페이징된다.
// ⚠️ 전역(global) 건은 조회는 되지만 해제할 수 없다(releasable: false).

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
        const response = await commerce.alimtalkOptout.list({ page: 1 })
        console.log('Alimtalk Optout List:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
