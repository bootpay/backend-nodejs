const { getCommerceKeys, ALIMTALK_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 자체 템플릿 목록 조회
// GET /v1/alimtalk/templates
// ins: 1 REG(등록) / 2 REQ(검수요청) / 3 APR(승인) / 4 KRR(등록거절) / 5 REJ(승인반려)
// ⚠️ 페이지네이션이 없다 — 필터에 걸린 템플릿을 한 번에 모두 돌려준다.

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
        const response = await commerce.alimtalkTemplate.list({ sort: 'latest' })
        console.log('Alimtalk Template List:', JSON.stringify(response, null, 2))

        // 승인(APR)된 템플릿만 — 발송 가능한 것들이다
        const approved = await commerce.alimtalkTemplate.list({ ins: 3 })
        console.log('Alimtalk Template List (APR):', JSON.stringify(approved, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
