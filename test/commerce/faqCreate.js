const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - FAQ 등록
// POST /v1/faqs — supervisor 전용

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
        const response = await commerce.faq.create({
            title: '배송은 얼마나 걸리나요?',
            content: '결제 후 영업일 기준 2~3일 내 도착합니다.',
            is_display: true
        })
        console.log('Faq Create:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
