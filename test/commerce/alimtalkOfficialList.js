const { getCommerceKeys, ALIMTALK_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 부트페이 공식 알림톡 템플릿 검색
// GET /v1/alimtalk/official
// 부트페이가 미리 카카오 승인을 받아 둔 템플릿이라, 그룹키가 등록된 채널이면 검수 없이 즉시 발송된다.
// msg_type 은 BA(기본형)·EX(부가정보형)만 존재한다 — 그룹 템플릿이라 AD/MI 는 쓸 수 없다.

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
        // keyword 는 서버 정본 키인 q 로 전송된다
        const response = await commerce.alimtalkOfficial.list({
            keyword: '주문',
            page: 1,
            per: 20 // 서버 기본 20, 최대 100 으로 clamp
        })
        console.log('Alimtalk Official List:', JSON.stringify(response, null, 2))

        // ksp_id 를 주면 그 채널의 변수 예문 사전으로 variable_examples 를 채워 준다(표시용)
        const withExamples = await commerce.alimtalkOfficial.list({ ksp_id: ALIMTALK_TEST_DATA.ksp_id })
        console.log('Alimtalk Official List (variable_examples):', JSON.stringify(withExamples, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
