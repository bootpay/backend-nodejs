// Commerce API - OrderCancel Approve (취소 승인) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        const response = await commerce.orderCancel.approve({
            order_cancel_request_history_id: 'ORDER_CANCEL_REQUEST_HISTORY_ID_HERE',
            approve_reason: '취소 승인 완료'
        })
        console.log('OrderCancel Approve Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
