// Commerce API - OrderSubscriptionBill Update (정기구독 청구 수정) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        const response = await commerce.orderSubscriptionBill.update({
            order_subscription_bill_id: 'ORDER_SUBSCRIPTION_BILL_ID_HERE',
            amount: 15000,
            billing_date: '2025-02-01'
        })
        console.log('OrderSubscriptionBill Update Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
