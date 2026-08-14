const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 몰 설정 수정 테스트
//
// PUT /v1/mall-setting (supervisor scope 전용)
// 요청 바디는 flatten 형식이며, 전달한 값(non-null)만 서버로 전송된다.

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

        const response = await commerce.mallSetting.updateMallSetting({
            name: '부트페이 테스트몰',
            description: '몰 설정 수정 테스트',
            use_cart: true,
            cart_max_limit: 100,
            use_point: true,
            point_rate: 1
        })
        console.log('Mall Setting Update:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
