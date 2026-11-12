const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 뱅크알람 입금대기 조회
// GET /v1/sdk/deposits/{id} — 가맹점 주문번호 또는 부트페이 주문번호

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: keys.client_key,
        secret_key: keys.secret_key,
        mode: keys.mode
    })

    try {
        const response = await commerce.deposit.detail(COMMERCE_TEST_DATA.deposit_id)
        console.log('Deposit Detail:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
