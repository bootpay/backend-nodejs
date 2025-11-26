// Commerce API - OrderSubscription Resume (정기구독 재개) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        const response = await commerce.orderSubscription.requestIng.resume({
            order_subscription_id: 'ORDER_SUBSCRIPTION_ID_HERE'
        })
        console.log('OrderSubscription Resume Response:', response)
    } catch (e) {
        console.error('Error:', e)
    }
})()
