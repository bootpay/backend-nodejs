const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - Order List (주문 목록 조회) 테스트

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
        const response = await commerce.order.list()
        console.log('Order List Response:', JSON.stringify(response, null, 2))

        // 파라미터로 조회
        const filteredResponse = await commerce.order.list({
            page: 1,
            limit: 10,
            keyword: '주문',
            user_id: 'USER_ID_HERE',
            user_group_id: 'USER_GROUP_ID_HERE',
            status: [1, 2], // 주문 상태 필터
            payment_status: [1] // 결제 상태 필터
        })
        console.log('Filtered Order List Response:', filteredResponse)
    } catch (e) {
        console.error('Error:', e)
    }
})()
