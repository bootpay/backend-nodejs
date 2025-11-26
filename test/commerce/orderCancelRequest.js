// Commerce API - OrderCancel Request (취소 요청) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        const response = await commerce.orderCancel.request({
            order_id: 'ORDER_ID_HERE',
            cancel_reason: '고객 요청에 의한 취소',
            cancel_amount: 10000
        })
        console.log('OrderCancel Request Response:', response)
    } catch (e) {
        console.error('Error:', e)
    }
})()
