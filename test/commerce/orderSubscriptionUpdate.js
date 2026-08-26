const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - OrderSubscription Update (정기구독 수정) 테스트

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

        // price 는 회차별 결제 금액의 기준금액이다. 바꾸면 결제예정(READY) 회차의 청구액이
        // 즉시 다시 계산되고 이후 회차도 이 금액으로 만들어진다. 이미 결제된 회차는 그대로다.
        // memo 는 변경이력(SUBSCRIPTION_ACTION_UPDATE)에 남길 사유다.
        const response = await commerce.orderSubscription.update({
            order_subscription_id: 'ORDER_SUBSCRIPTION_ID_HERE',
            price: 12000,
            memo: '가격 인하 프로모션'
        })
        console.log('OrderSubscription Update Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
