const { Bootpay } = require('../../dist/bootpay.js');
const { getActivePgConfig, TEST_DATA } = require('../config.js');

(async () => {
    Bootpay.setConfiguration(getActivePgConfig('production'))
    try {
        // legacy 모드에서만 실제 토큰 발급. ck/sk 모드에서는 no-op.
        await Bootpay.getAccessToken()
        const response = await Bootpay.requestSubscribePayment({
            billing_key: TEST_DATA.billing_key,
            order_name: '테스트 결제',
            order_id: (new Date()).getTime(),
            price: 100,
            tax_free: 0
        })
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()