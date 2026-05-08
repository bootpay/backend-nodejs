const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - OrderSubscriptionBill Update (정기구독 청구 수정) 테스트

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

        const response = await commerce.orderSubscriptionBill.update({
            order_subscription_bill_id: 'ORDER_SUBSCRIPTION_BILL_ID_HERE',
            amount: 15000,
            billing_date: '2025-02-01'
        })
        console.log('OrderSubscriptionBill Update Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
