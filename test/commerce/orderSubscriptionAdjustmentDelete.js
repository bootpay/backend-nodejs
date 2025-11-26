// Commerce API - OrderSubscriptionAdjustment Delete (정기구독 조정 삭제) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        const response = await commerce.orderSubscriptionAdjustment.delete(
            'ORDER_SUBSCRIPTION_ID_HERE',
            'ORDER_SUBSCRIPTION_ADJUSTMENT_ID_HERE'
        )
        console.log('OrderSubscriptionAdjustment Delete Response:', response)
    } catch (e) {
        console.error('Error:', e)
    }
})()
