const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 수시결제(온디맨드) charge_key 해지 테스트
//
// DELETE /v1/order_subscriptions/charge (supervisor 전용)
// 해지 이후 해당 키로의 재결제는 불가능하다

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

        const response = await commerce.asSupervisor().orderSubscription.supervisorChargeRevoke({
            charge_key: COMMERCE_TEST_DATA.charge_key,
            user: { id: COMMERCE_TEST_DATA.user_id }
        })
        console.log('OrderSubscription Charge Revoke Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
