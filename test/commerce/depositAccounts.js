const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 뱅크알람 입금 계좌 목록
// GET /v1/sdk/deposits/accounts

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: keys.client_key,
        secret_key: keys.secret_key,
        mode: keys.mode
    })

    try {
        const response = await commerce.deposit.accounts()
        console.log('Deposit Accounts:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
