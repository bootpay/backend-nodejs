const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 상품문의 작성 (회원)
// POST /v1/product-qnas

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
            user_id: COMMERCE_TEST_DATA.user_id,
            title: '사이즈 문의',
            content: '평소 M 사이즈를 입는데 어떤 사이즈가 맞을까요?',
            is_secret: false
        })
        console.log('ProductQna Create:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
