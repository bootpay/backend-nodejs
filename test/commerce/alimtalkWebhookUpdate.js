const { getCommerceKeys, ALIMTALK_TEST_DATA, alimtalkSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 웹훅 설정 저장
// PUT /v1/alimtalk/webhook
// url 은 https 만 허용한다(아니면 3028). 최초 저장 시 서명 시크릿이 자동 발급된다.
// events: 300 발송접수(기본 미구독) / 301 전달성공 / 302 전달실패 / 303 예약취소 /
//         304 문자(LMS) 대체발송 전환 / 310 검수승인 / 311 검수반려 / 320 수신거부 등록(기본 미구독)
// events 를 비우면 기본 구독셋(301·302·303·304·310·311)이 적용된다.

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
        if (!alimtalkSideEffectAllowed('alimtalkWebhookUpdate')) return

        const response = await commerce.alimtalkWebhook.update({
            url: ALIMTALK_TEST_DATA.webhook_url,
            events: [301, 302, 304, 310, 311],
            enabled: true
        })
        console.log('Alimtalk Webhook Update:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
