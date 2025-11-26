// Commerce API - OrderCancel List (취소 요청 목록 조회) 테스트

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
        const response = await commerce.orderCancel.list()
        console.log('OrderCancel List Response:', JSON.stringify(response, null, 2))

        // order_id로 조회
        const byOrderId = await commerce.orderCancel.list({
            order_id: 'ORDER_ID_HERE'
        })
        console.log('OrderCancel List by Order ID:', byOrderId)

        // order_number로 조회
        const byOrderNumber = await commerce.orderCancel.list({
            order_number: 'ORDER_NUMBER_HERE'
        })
        console.log('OrderCancel List by Order Number:', byOrderNumber)
    } catch (e) {
        console.error('Error:', e)
    }
})()
