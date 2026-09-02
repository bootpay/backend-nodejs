const { getCommerceKeys, ALIMTALK_TEST_DATA, alimtalkSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 발신프로필 등록
// POST /v1/alimtalk/senders
// ⚠️ 카카오에 발신프로필이 실제 등록된다. 같은 yellow_id 를 다시 등록하면 기존 프로필을 재사용한다(dedup).
// 등록 성공 시 그룹키 등록까지 서버가 수행하므로 공식 카탈로그 전체를 바로 발송할 수 있다.

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
        if (!alimtalkSideEffectAllowed('alimtalkSenderCreate')) return

        const response = await commerce.alimtalkSender.create({
            otp: ALIMTALK_TEST_DATA.otp, // alimtalkSenderOtp.js 로 받은 인증번호
            yellow_id: ALIMTALK_TEST_DATA.yellow_id,
            phone: ALIMTALK_TEST_DATA.phone,
            category_code: ALIMTALK_TEST_DATA.category_code
        })
        console.log('Alimtalk Sender Create:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
