const { getCommerceKeys, ALIMTALK_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 수신거부 사전 확인
// POST /v1/alimtalk/optouts/check
// 발송 판정과 같은 축으로 대조하므로, 벌크에서 skipped 로 낭비될 건을 미리 뺄 수 있다.
// ⚠️ 1회 최대 1,000건이고 넘으면 -48 이다(중복은 서버가 제거).

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
        // 단건(phone)·다건(phones) 모두 받는다
        const single = await commerce.alimtalkOptout.check({ phone: ALIMTALK_TEST_DATA.phone })
        console.log('Alimtalk Optout Check (single):', JSON.stringify(single, null, 2))

        const bulk = await commerce.alimtalkOptout.check({ phones: [ALIMTALK_TEST_DATA.phone] })
        console.log('Alimtalk Optout Check (bulk):', JSON.stringify(bulk, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
