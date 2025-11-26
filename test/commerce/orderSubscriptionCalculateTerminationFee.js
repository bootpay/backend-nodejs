// Commerce API - OrderSubscription Calculate Termination Fee (해지 수수료 계산) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        // order_subscription_id로 조회
        const response = await commerce.orderSubscription.requestIng.calculateTerminationFee(
            'ORDER_SUBSCRIPTION_ID_HERE'
        )
        console.log('Calculate Termination Fee Response:', response)

        // order_number로 조회
        const responseByOrderNumber = await commerce.orderSubscription.requestIng.calculateTerminationFeeByOrderNumber(
            'ORDER_NUMBER_HERE'
        )
        console.log('Calculate Termination Fee by Order Number Response:', responseByOrderNumber)
    } catch (e) {
        console.error('Error:', e)
    }
})()
