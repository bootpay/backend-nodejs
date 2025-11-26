// Commerce API - OrderSubscription List (정기구독 목록 조회) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

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
