const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - UserGroup Limit (그룹 제한 설정) 테스트

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

        const response = await commerce.userGroup.limit({
            user_group_id: 'USER_GROUP_ID_HERE',
            limit_amount: 1000000, // 제한 금액
            limit_count: 100 // 제한 횟수
        })
        console.log('UserGroup Limit Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
