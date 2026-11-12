const { getCommerceKeys, depositSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 뱅크알람 웹훅 서명 비밀값 발급
// POST /v1/sdk/deposits/webhook_secret — ⚠️ 부를 때마다 비밀값이 바뀐다

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: keys.client_key,
        secret_key: keys.secret_key,
        mode: keys.mode
    })

    try {
        if (!depositSideEffectAllowed('depositWebhookSecret')) return

        const response = await commerce.deposit.webhookSecret()
        console.log('Deposit Webhook Secret:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
