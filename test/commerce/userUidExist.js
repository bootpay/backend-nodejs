const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - User uid-exist (외부 uid 중복검사) 테스트
// GET /v1/users/join/uid-exist?pk={uid}

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

        const response = await commerce.user.uidExist('external_uid_1234')
        console.log('User uid-exist Response:', JSON.stringify(response, null, 2))

        // 일반형(checkExist)으로도 같은 endpoint 를 호출할 수 있다.
        const generic = await commerce.user.checkExist('uid-exist', 'external_uid_1234')
        console.log('User checkExist(uid-exist) Response:', generic)
    } catch (e) {
        console.error('Error:', e)
    }
})()
