const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - Product Update (상품 수정) 테스트

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

        const response = await commerce.product.update({
            product_id: 'PRODUCT_ID_HERE',
            name: '수정된 상품명',
            price: 15000,
            description: '수정된 상품 설명'
        })
        console.log('Product Update Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
