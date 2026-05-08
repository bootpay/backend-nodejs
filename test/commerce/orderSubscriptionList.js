const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - OrderSubscription List (정기구독 목록 조회) 테스트

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

        // 기본 목록 조회
        const response = await commerce.orderSubscription.list()
        console.log('OrderSubscription List Response:', JSON.stringify(response, null, 2))

        // 파라미터로 조회
        const filteredResponse = await commerce.orderSubscription.list({
            page: 1,
            limit: 10,
            keyword: '구독',
            user_id: 'USER_ID_HERE',
            user_group_id: 'USER_GROUP_ID_HERE',
            s_at: '2024-01-01',
            e_at: '2024-12-31',
            request_type: 'active'
        })
        console.log('Filtered OrderSubscription List Response:', filteredResponse)
    } catch (e) {
        console.error('Error:', e)
    }
})()
