const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - OrderCancel Withdraw (취소 요청 철회) 테스트

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

        // 문자열로 바로 넘겨도 되고, 객체 형태로 idempotency_key 를 함께 줄 수도 있다.
        const response = await commerce.orderCancel.withdraw('ORDER_CANCELLATION_REQUEST_ID_HERE')
        console.log('OrderCancel Withdraw Response:', JSON.stringify(response, null, 2))

        const byParams = await commerce.orderCancel.withdraw({
            order_cancellation_request_id: 'ORDER_CANCELLATION_REQUEST_ID_HERE'
        })
        console.log('OrderCancel Withdraw (params) Response:', byParams)
    } catch (e) {
        console.error('Error:', e)
    }
})()
