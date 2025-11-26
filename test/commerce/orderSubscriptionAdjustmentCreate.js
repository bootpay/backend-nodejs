// Commerce API - OrderSubscriptionAdjustment Create (정기구독 조정 생성) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        const response = await commerce.orderSubscriptionAdjustment.create(
            'ORDER_SUBSCRIPTION_ID_HERE',
            {
                type: 1, // 조정 유형
                amount: 5000,
                description: '할인 적용'
            }
        )
        console.log('OrderSubscriptionAdjustment Create Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
