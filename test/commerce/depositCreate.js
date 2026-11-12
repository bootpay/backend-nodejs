const { getCommerceKeys, depositSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 뱅크알람 입금대기 등록
// POST /v1/sdk/deposits — 판매자 입금 계좌가 등록돼 있어야 한다(18128)

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: keys.client_key,
        secret_key: keys.secret_key,
        mode: keys.mode
    })

    try {
        if (!depositSideEffectAllowed('depositCreate')) return

        const response = await commerce.deposit.create({ merchant_order_id: `sdk-test-${Date.now()}`, price: 1000, depositor: '홍길동' })
        console.log('Deposit Create:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
