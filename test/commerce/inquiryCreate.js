const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 1:1 문의 작성
// POST /v1/inquiries — 회원 전용
// product_id 는 이 몰의 상품, order_id 는 작성 회원의 주문이어야 한다.

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
        const response = await commerce.inquiry.create({
            user_id: COMMERCE_TEST_DATA.user_id,
            title: '배송 문의',
            content: '주문한 상품이 언제 출고되나요?'
        })
        console.log('Inquiry Create:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
