const { getCommerceKeys, ALIMTALK_TEST_DATA, alimtalkSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 자체 템플릿 삭제
// DELETE /v1/alimtalk/templates/{template_id}
// 초안(등록 전)은 대행사 거부와 무관하게 로컬에서 삭제된다.
// ⚠️ 등록분은 대행사 삭제가 성공해야 삭제된다 — 승인(APR) 템플릿은 카카오가 거부하므로 500(3013)이 온다.

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
        if (!alimtalkSideEffectAllowed('alimtalkTemplateDelete')) return

        const response = await commerce.alimtalkTemplate.delete(ALIMTALK_TEST_DATA.template_id)
        console.log('Alimtalk Template Delete:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
