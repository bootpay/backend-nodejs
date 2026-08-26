const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - Product Detail (상품 상세 조회) 테스트

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

        const response = await commerce.product.detail('PRODUCT_ID_HERE')
        console.log('Product Detail Response:', JSON.stringify(response, null, 2))

        // 회원 JWT 를 주면 회원 컨텍스트로 조회한다 (productDetail 과 동작이 같다)
        const withJwt = await commerce.product.detail('PRODUCT_ID_HERE', 'USER_JWT_HERE')
        console.log('Product Detail (user_jwt) Response:', withJwt)
    } catch (e) {
        console.error('Error:', e)
    }
})()
