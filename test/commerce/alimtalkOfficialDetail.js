const { getCommerceKeys, ALIMTALK_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 공식 알림톡 템플릿 상세 조회
// GET /v1/alimtalk/official/{code}
// code 는 서버 채번 코드(슬래시를 포함하지 않는다). 없거나 미노출이면 404(3015).

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
        const response = await commerce.alimtalkOfficial.detail(ALIMTALK_TEST_DATA.official_code)
        console.log('Alimtalk Official Detail:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
