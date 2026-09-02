const { getCommerceKeys, ALIMTALK_TEST_DATA, alimtalkSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 자체 템플릿 생성
// POST /v1/alimtalk/templates
// ⚠️ register 를 false 로 주지 않으면 생성 즉시 대행사·카카오에 실제 등록된다(되돌리려면 삭제해야 한다).
// ⚠️ 본문 변수는 #{변수명} 형식이고 템플릿 전체에서 최대 40개다.

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
        if (!alimtalkSideEffectAllowed('alimtalkTemplateCreate')) return

        // 초안만 만든다 — 내용을 확인한 뒤 alimtalkTemplateRegister.js 로 올린다
        const response = await commerce.alimtalkTemplate.create({
            ksp_id: ALIMTALK_TEST_DATA.ksp_id,
            name: '주문완료 안내',
            content: '#{user_name}님, 주문이 완료되었습니다.',
            register: false,
            msg_type: 'BA', // BA(기본형)·EX(부가정보형)·AD(채널추가형)·MI(복합형)
            emphasize_type: 'NONE',
            examples: { user_name: '홍길동' } // 주면 모든 변수에 예문이 있어야 한다(없으면 3017)
        })
        console.log('Alimtalk Template Create:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
