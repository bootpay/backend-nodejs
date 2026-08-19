const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - OrderSubscription 중도인수 요청 테스트
// POST /v1/order_subscriptions/requests/ing/purchase

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

        const response = await commerce.orderSubscription.requestIng.purchase({
            order_subscription_id: COMMERCE_TEST_DATA.order_subscription_id,
            price: 100000,
            tax_free_price: 0,
            reason: '중도인수 요청'
        })
        console.log('OrderSubscription Purchase Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
