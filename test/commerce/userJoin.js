const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - User Join (회원가입) 테스트

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

        const response = await commerce.user.join({
            login_id: 'test_user@example.com',
            login_pw: 'password123',
            name: '테스트 사용자',
            email: 'test_user@example.com',
            phone: '010-1234-5678'
        })
        console.log('User Join Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
