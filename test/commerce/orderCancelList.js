const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - OrderCancel List (취소 요청 목록 조회) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: keys.client_key,
        secret_key: keys.secret_key,
        mode: keys.mode
    })

    try {
        // (legacy) application_id 방식에서만 필요. ck/sk 는 매 요청 Basic Auth 헤더로 직접 인증되므로 호출 불필요.
        // await commerce.getAccessToken()

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
