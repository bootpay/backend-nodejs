const { getCommerceKeys, ALIMTALK_TEST_DATA, alimtalkSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 채널 관리자폰 OTP 발송
// POST /v1/alimtalk/senders/otp
// ⚠️ 채널 관리자 휴대폰으로 실제 문자가 나간다.
// 여기서 받은 인증번호를 alimtalkSender.create() 의 otp 로 넘긴다.

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
        if (!alimtalkSideEffectAllowed('alimtalkSenderOtp')) return

        const response = await commerce.alimtalkSender.otp({
            yellow_id: ALIMTALK_TEST_DATA.yellow_id,
            phone: ALIMTALK_TEST_DATA.phone
        })
        console.log('Alimtalk Sender OTP:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
