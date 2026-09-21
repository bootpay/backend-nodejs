const { getCommerceKeys, ALIMTALK_TEST_DATA, alimtalkSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 단건 발송
// POST /alimtalk/send
// ⚠️ 실제로 카카오톡이 발송되고 과금된다. 샌드박스가 없다.
// ref_id 는 멱등 키다 — 같은 (프로젝트, ref_id) 로 재요청하면 기존 receipt 를 그대로 돌려준다.
// ⚠️ fallback 은 미지정과 false 가 다르다 — 미지정이면 프로젝트 기본값, false 는 명시적으로 끈다.
// webhook_url 을 주면 이 건의 결과 웹훅이 그 주소로만 간다(프로젝트 웹훅 설정은 쓰이지 않는다).
//    https 만 허용하고 2,000자를 넘으면 3028 이다. 같은 ref_id 로 이미 접수된 건은 새 주소가 무시된다.

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
        if (!alimtalkSideEffectAllowed('alimtalkSend')) return

        const response = await commerce.alimtalkSend.send({
            template_code: ALIMTALK_TEST_DATA.template_code,
            to: ALIMTALK_TEST_DATA.phone,
            variables: { user_name: '홍길동' }, // 템플릿의 required_variables 를 모두 채워야 한다(아니면 3017)
            ref_id: ALIMTALK_TEST_DATA.ref_id,
            fallback: false, // 문자(LMS) 대체발송을 명시적으로 끈다
            sender_key: ALIMTALK_TEST_DATA.sender_key || undefined, // 연동 채널이 둘 이상일 때만 필수
            webhook_url: ALIMTALK_TEST_DATA.webhook_url || undefined // 이 건의 결과 웹훅만 이 주소로 받는다(https)
        })
        console.log('Alimtalk Send:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
