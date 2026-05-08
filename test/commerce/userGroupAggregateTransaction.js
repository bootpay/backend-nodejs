const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - UserGroup Aggregate Transaction (그룹 거래 집계 조회) 테스트

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

        const response = await commerce.userGroup.aggregateTransaction({
            user_group_id: 'USER_GROUP_ID_HERE',
            s_at: '2024-01-01',
            e_at: '2024-12-31'
        })
        console.log('UserGroup Aggregate Transaction Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
