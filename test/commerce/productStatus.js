const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - Product Status (상품 상태 변경) 테스트

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

        const response = await commerce.product.status({
            product_id: 'PRODUCT_ID_HERE',
            status: 2 // 비활성 상태로 변경
        })
        console.log('Product Status Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
