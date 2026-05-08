const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - OrderSubscriptionAdjustment Delete (정기구독 조정 삭제) 테스트

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

        const response = await commerce.orderSubscriptionAdjustment.delete(
            'ORDER_SUBSCRIPTION_ID_HERE',
            'ORDER_SUBSCRIPTION_ADJUSTMENT_ID_HERE'
        )
        console.log('OrderSubscriptionAdjustment Delete Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
