const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 상품문의 작성 (비회원)
// POST /v1/product-qnas
// 비회원은 guest_name + guest_password 로 쓴다 (몰이 비회원 작성을 허용할 때).

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
        const response = await commerce.productQna.create({
            product_id: COMMERCE_TEST_DATA.product_id,
            title: '재입고 문의',
            content: '품절된 색상 재입고 예정이 있나요?',
            is_secret: true,
            guest_name: '비회원',
            guest_password: '1234'
        })
        console.log('ProductQna Create (guest):', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
