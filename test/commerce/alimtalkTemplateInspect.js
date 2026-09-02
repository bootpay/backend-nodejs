const { getCommerceKeys, ALIMTALK_TEST_DATA, alimtalkSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 자체 템플릿 검수 요청
// POST /v1/alimtalk/templates/{template_id}/inspect
// ⚠️ 카카오에 검수를 요청하며 취소할 수 없다.
// 대행사 등록이 끝난 대기(R) + REG(등록) 상태에서만 호출할 수 있다 — 초안은 먼저 register 를 부른다.
// 반려(REJ/KRR)된 건은 재요청이 아니라 수정 후 재요청이다. 반려 사유는 응답의 comments 에 담긴다.

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
        if (!alimtalkSideEffectAllowed('alimtalkTemplateInspect')) return

        const response = await commerce.alimtalkTemplate.inspect(ALIMTALK_TEST_DATA.template_id)
        console.log('Alimtalk Template Inspect:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
