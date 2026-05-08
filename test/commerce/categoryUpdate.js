const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - Category 수정

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
        const response = await commerce.category.update({
            category_id: 'CATEGORY_ID_HERE',
            name: 'SDK Test Category (updated)',
            status_display: true,
            status_best: true
        })
        console.log('Category Update:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
