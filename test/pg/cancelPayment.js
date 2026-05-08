const { Bootpay } = require('../../dist/bootpay.js');
const { getActivePgConfig, TEST_DATA } = require('../config.js');

(async () => {
    Bootpay.setConfiguration(getActivePgConfig());
    try {
        // legacy 모드에서만 실제 토큰 발급. ck/sk 모드에서는 no-op.
        await Bootpay.getAccessToken();
        const response = await Bootpay.cancelPayment({
            receipt_id: TEST_DATA.receipt_id,
            cancel_price: 1000,
            cancel_username: '테스트 사용자',
            cancel_message: '테스트 취소입니다.'
        });
        console.log(response);
    } catch (e) {
        console.log(e);
    }
})();
