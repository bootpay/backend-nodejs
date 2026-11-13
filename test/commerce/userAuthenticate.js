const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - User Authenticate (가입 이메일 인증 대기 상태 조회) 테스트
// GET /v1/users/authenticate/{user_standby_id}

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

        const response = await commerce.user.userAuthenticate('USER_STANDBY_ID_HERE')
        console.log('User Authenticate Response:', JSON.stringify(response, null, 2))

        // verification_context 를 함께 보낼 수 있다 (선택)
        const withContext = await commerce.user.userAuthenticate('USER_STANDBY_ID_HERE', 'VERIFICATION_CONTEXT_HERE')
        console.log('User Authenticate (verification_context) Response:', JSON.stringify(withContext, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
