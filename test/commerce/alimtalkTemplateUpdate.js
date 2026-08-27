const { getCommerceKeys, ALIMTALK_TEST_DATA, alimtalkSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 자체 템플릿 수정
// PUT /v1/alimtalk/templates/{template_id}
// ⚠️ 부분 수정이 아니다. 보내지 않은 필드는 null 로 덮어써지므로 항상 전체 필드를 보낸다.
// ⚠️ 수정 가능 상태는 초안 / REG(등록) / REJ(승인반려) / KRR(등록거절) 뿐이다 — APR·REQ 는 거부된다.

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
        if (!alimtalkSideEffectAllowed('alimtalkTemplateUpdate')) return

        const response = await commerce.alimtalkTemplate.update(ALIMTALK_TEST_DATA.template_id, {
            name: '주문완료 안내',
            content: '#{user_name}님, 주문이 완료되었습니다. 감사합니다.',
            msg_type: 'BA',
            emphasize_type: 'NONE',
            examples: { user_name: '홍길동' }
        })
        console.log('Alimtalk Template Update:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
