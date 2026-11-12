const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 입점사 지급 목록 조회
// GET /v1/sdk/payouts — 최근 생성 순, 응답은 항목 배열(전체 개수 없음)

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: keys.client_key,
        secret_key: keys.secret_key,
        mode: keys.mode
    })

    try {
        const response = await commerce.payout.list({ page: 1, limit: 20 })
        console.log('Payout List:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
