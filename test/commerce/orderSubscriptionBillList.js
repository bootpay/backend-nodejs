// Commerce API - OrderSubscriptionBill List (정기구독 청구 목록 조회) 테스트

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
        const response = await commerce.orderSubscriptionBill.list()
        console.log('OrderSubscriptionBill List Response:', JSON.stringify(response, null, 2))

        // 파라미터로 조회
        const filteredResponse = await commerce.orderSubscriptionBill.list({
            page: 1,
            limit: 10,
            keyword: '청구',
            order_subscription_id: 'ORDER_SUBSCRIPTION_ID_HERE',
            status: [1, 2] // 청구 상태 필터
        })
        console.log('Filtered OrderSubscriptionBill List Response:', filteredResponse)
    } catch (e) {
        console.error('Error:', e)
    }
})()
