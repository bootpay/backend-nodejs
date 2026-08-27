const { getCommerceKeys, ALIMTALK_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 자체 템플릿 상세 조회
// GET /v1/alimtalk/templates/{template_id}
// template_id 는 문서 id 이고, ObjectId 형식이 아니면 템플릿 코드로 해석한다.
// ⚠️ sync 는 서버 기본값이 true 라 조회만 해도 벤더 상태 동기화가 일어난다.

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
        const response = await commerce.alimtalkTemplate.detail(ALIMTALK_TEST_DATA.template_id)
        console.log('Alimtalk Template Detail:', JSON.stringify(response, null, 2))

        // 초안(등록 전)은 sync: false 로 조회하는 것을 권장한다
        const draft = await commerce.alimtalkTemplate.detail(ALIMTALK_TEST_DATA.template_id, false)
        console.log('Alimtalk Template Detail (no sync):', JSON.stringify(draft, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
