const { Bootpay } = require('../../dist/bootpay.js');
const { getActivePgConfig, TEST_DATA } = require('../config.js');

(async () => {
    Bootpay.setConfiguration(getActivePgConfig());
    try {
        // legacy 모드에서만 실제 토큰 발급. ck/sk 모드에서는 no-op.
        await Bootpay.getAccessToken();
        const response = await Bootpay.subscribePaymentReserve({
            billing_key: TEST_DATA.billing_key,
            order_name: '테스트결제',
            price: 1000,
            order_id: Date.now().toString(),
            reserve_execute_at: new Date(Date.now() + 60000).toISOString()
        });
        console.log(response);
    } catch (e) {
        console.log(e);
    }
})();
