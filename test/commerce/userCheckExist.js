const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - User Check Exist (중복 체크) 테스트

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

        // login_id 중복 체크
        const loginIdCheck = await commerce.user.checkExist('login_id', 'test_user@example.com')
        console.log('Login ID Exist Check:', JSON.stringify(loginIdCheck, null, 2))

        // email 중복 체크
        const emailCheck = await commerce.user.checkExist('email', 'test_user@example.com')
        console.log('Email Exist Check:', JSON.stringify(emailCheck, null, 2))

        // phone 중복 체크
        const phoneCheck = await commerce.user.checkExist('phone', '010-1234-5678')
        console.log('Phone Exist Check:', JSON.stringify(phoneCheck, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
