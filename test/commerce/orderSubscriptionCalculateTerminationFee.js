const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - OrderSubscription Calculate Termination Fee (해지 수수료 계산) 테스트

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

        // order_subscription_id로 조회
        const response = await commerce.orderSubscription.requestIng.calculateTerminationFee(
            'ORDER_SUBSCRIPTION_ID_HERE'
        )
        console.log('Calculate Termination Fee Response:', JSON.stringify(response, null, 2))

        // order_number로 조회
        const responseByOrderNumber = await commerce.orderSubscription.requestIng.calculateTerminationFeeByOrderNumber(
            'ORDER_NUMBER_HERE'
        )
        console.log('Calculate Termination Fee by Order Number Response:', responseByOrderNumber)
    } catch (e) {
        console.error('Error:', e)
    }
})()
