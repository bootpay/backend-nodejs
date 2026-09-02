const { getCommerceKeys, ALIMTALK_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 채널 변수 예문 사전 갱신
// PUT /v1/alimtalk/senders/{ksp_id}/variable_examples
// 템플릿 미리보기에서 #{변수} 대신 '홍길동' 처럼 읽히게 하는 표시용 값이다.
// ⚠️ 발송값이 아니다 — 벤더로 전송되지 않으므로 검수 상태와 무관하다. 보낸 키만 덮어쓴다(부분 갱신).

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
        const response = await commerce.alimtalkSender.variableExamples(ALIMTALK_TEST_DATA.ksp_id, {
            user_name: '홍길동',
            company_name: '부트페이몰'
        })
        console.log('Alimtalk Sender Variable Examples:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
