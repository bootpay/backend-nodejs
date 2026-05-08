const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - Invoice Create (청구서 생성) 테스트

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

        const response = await commerce.invoice.create({
            user_id: 'USER_ID_HERE',
            amount: 50000,
            title: '테스트 청구서',
            description: '테스트 청구서 설명'
        })
        console.log('Invoice Create Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
