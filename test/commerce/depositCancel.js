const { getCommerceKeys, COMMERCE_TEST_DATA, depositSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 뱅크알람 입금대기 취소
// DELETE /v1/sdk/deposits/{id} — 이미 닫힌 주문은 그대로 돌려준다

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: keys.client_key,
        secret_key: keys.secret_key,
        mode: keys.mode
    })

    try {
        if (!depositSideEffectAllowed('depositCancel')) return

        const response = await commerce.deposit.cancel(COMMERCE_TEST_DATA.deposit_id)
        console.log('Deposit Cancel:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
