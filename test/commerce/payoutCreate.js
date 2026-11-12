const { getCommerceKeys, COMMERCE_TEST_DATA, payoutSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 입점사 지급 요청 등록
// POST /v1/sdk/payouts — 정산 방식이 manual 인 쇼핑몰만, PG 등록을 마친 입점사만 받는다

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: keys.client_key,
        secret_key: keys.secret_key,
        mode: keys.mode
    })

    try {
        if (!payoutSideEffectAllowed('payoutCreate')) return

        const response = await commerce.payout.create({
            sub_seller_id: COMMERCE_TEST_DATA.sub_seller_id,
            amount: 1000,
            merchant_payout_id: `sdk-test-${Date.now()}`
        })
        console.log('Payout Create:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
