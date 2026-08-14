const { Bootpay } = require('../../dist/bootpay.js');
const { getActivePgConfig, TEST_DATA } = require('../config.js');
// PG API - 우선순위(순차) 결제 빌링키 조회
// GET /v2/subscribe/sequential_billing_key/{billing_key}?widget_key={widget_key}

(async () => {
    Bootpay.setConfiguration(getActivePgConfig());
    try {
        // legacy 모드에서만 실제 토큰 발급. ck/sk 모드에서는 no-op.
        await Bootpay.getAccessToken();
        const response = await Bootpay.lookupSequentialBillingKey(TEST_DATA.widget_key, TEST_DATA.billing_key_2);
        console.log(response);
    } catch (e) {
        console.log(e);
    }
})();
