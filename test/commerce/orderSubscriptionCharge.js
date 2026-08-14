const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 수시결제(온디맨드) charge_key 즉시 결제 테스트
//
// POST /v1/order_subscriptions/charge (supervisor 전용)
// charge_key 는 body 로만 전송된다 (URL/query 금지 — 액세스 로그 노출 방지)

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

        const response = await commerce.asSupervisor().orderSubscription.supervisorCharge({
            charge_key: COMMERCE_TEST_DATA.charge_key,
            price: 1000,
            tax_free_price: 0,
            user: { id: COMMERCE_TEST_DATA.user_id },
            metadata: { memo: 'charge key 즉시 결제 테스트' }
        })
        console.log('OrderSubscription Charge Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
