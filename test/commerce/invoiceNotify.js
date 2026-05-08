const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - Invoice Notify (청구서 알림 발송) 테스트

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

        // send_types: 1=SMS, 2=Email 등
        const response = await commerce.invoice.notify('INVOICE_ID_HERE', [1, 2])
        console.log('Invoice Notify Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
