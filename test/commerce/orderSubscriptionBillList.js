const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - OrderSubscriptionBill List (정기구독 청구 목록 조회) 테스트

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
        const response = await commerce.orderSubscriptionBill.list()
        console.log('OrderSubscriptionBill List Response:', JSON.stringify(response, null, 2))

        // 파라미터로 조회
        const filteredResponse = await commerce.orderSubscriptionBill.list({
            page: 1,
            limit: 10,
            keyword: '청구',
            order_subscription_id: 'ORDER_SUBSCRIPTION_ID_HERE',
            status: [1, 2] // 청구 상태 필터
        })
        console.log('Filtered OrderSubscriptionBill List Response:', filteredResponse)
    } catch (e) {
        console.error('Error:', e)
    }
})()
