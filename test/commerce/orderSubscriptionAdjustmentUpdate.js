// Commerce API - OrderSubscriptionAdjustment Update (정기구독 조정 수정) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        const response = await commerce.orderSubscriptionAdjustment.update({
            order_subscription_id: 'ORDER_SUBSCRIPTION_ID_HERE',
            order_subscription_adjustment_id: 'ORDER_SUBSCRIPTION_ADJUSTMENT_ID_HERE',
            amount: 3000,
            description: '조정 금액 수정'
        })
        console.log('OrderSubscriptionAdjustment Update Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
