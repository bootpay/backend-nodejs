const { Bootpay } = require('../../dist/bootpay.js');
const { getActivePgConfig, TEST_DATA } = require('../config.js');

(async () => {
    Bootpay.setConfiguration(getActivePgConfig());
    try {
        // legacy 모드에서만 실제 토큰 발급. ck/sk 모드에서는 no-op.
        await Bootpay.getAccessToken();
        const response = await Bootpay.cashReceiptPublishOnReceipt({
            receipt_id: TEST_DATA.receipt_id_cash,
            username: '테스트',
            email: 'test@bootpay.co.kr',
            phone: '01000000000',
            identity_no: '01000000000',
            cash_receipt_type: '소득공제'
        });
        console.log(response);
    } catch (e) {
        console.log(e);
    }
})();
