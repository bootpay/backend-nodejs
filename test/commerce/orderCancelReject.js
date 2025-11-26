// Commerce API - OrderCancel Reject (취소 거절) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        const response = await commerce.orderCancel.reject({
            order_cancel_request_history_id: 'ORDER_CANCEL_REQUEST_HISTORY_ID_HERE',
            reject_reason: '환불 불가 사유로 인한 거절'
        })
        console.log('OrderCancel Reject Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
