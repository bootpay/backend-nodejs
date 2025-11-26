// Commerce API - OrderSubscription Pause (정기구독 일시정지) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        const response = await commerce.orderSubscription.requestIng.pause({
            order_subscription_id: 'ORDER_SUBSCRIPTION_ID_HERE',
            pause_reason: '일시 정지 사유'
        })
        console.log('OrderSubscription Pause Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
