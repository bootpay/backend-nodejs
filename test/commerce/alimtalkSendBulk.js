const { getCommerceKeys, ALIMTALK_TEST_DATA, alimtalkSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 벌크 발송
// POST /alimtalk/send/bulk
// ⚠️ 수신자 수만큼 실제 발송되고 과금된다.
// - 쿼터를 넘으면 요청 시점에 전체 거부된다(3022) — 일부만 나가지 않는다.
// - 수신거부 번호는 skipped 이며 과금되지 않고 발송 기록도 만들지 않는다.
// - fallback 은 요청 단위로 한 번만 판정한다 — 발신번호가 없으면 요청 전체가 3030 으로 거부된다.
// - webhook_url 도 요청 단위 하나다 — 이 요청으로 나간 모든 수신자 건의 결과 웹훅이 그 주소로 간다.
//   형식이 틀리면(https 아님·2,000자 초과) 요청 전체가 3028 로 거부된다.

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
        if (!alimtalkSideEffectAllowed('alimtalkSendBulk')) return

        const response = await commerce.alimtalkSend.bulk({
            template_code: ALIMTALK_TEST_DATA.template_code,
            recipients: [
                { to: ALIMTALK_TEST_DATA.phone, ref_id: 'bulk-0001', variables: { user_name: '홍길동' } }
            ],
            fallback: false,
            webhook_url: ALIMTALK_TEST_DATA.webhook_url || undefined // 이 요청의 모든 건이 이 주소로 웹훅을 받는다(https)
        })
        console.log('Alimtalk Send Bulk:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
