const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - OrderSubscriptionAdjustment Create (정기구독 조정 생성) 테스트

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

        // 회차 지정 방법 3가지 (아래로 갈수록 넓다)
        //   - duration: 5                      → 5회차 한 건만
        //   - duration_from: 3, duration_to: 7 → 3~7회차 각각 한 건씩 (총 5건)
        //   - duration_from: 3, is_unlimited: true → 3회차부터 계약 끝까지 (duration_to 는 무시)
        // 이미 결제가 끝난 회차는 거절되고, 범위 중 한 회차라도 최종 금액이 음수면 전부 거절된다.
        const response = await commerce.orderSubscriptionAdjustment.create(
            'ORDER_SUBSCRIPTION_ID_HERE',
            {
                name: '할인 적용',
                price: -5000,
                duration_from: 3,
                duration_to: 7
            }
        )
        console.log('OrderSubscriptionAdjustment Create Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
