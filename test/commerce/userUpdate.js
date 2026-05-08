const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - User Update (사용자 정보 수정) 테스트

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

        const response = await commerce.user.update({
            user_id: 'USER_ID_HERE',
            name: '수정된 이름',
            phone: '010-9876-5432'
        })
        console.log('User Update Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
