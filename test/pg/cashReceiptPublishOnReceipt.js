const { Bootpay } = require('../../dist/bootpay.js');
const { getPgKeys, TEST_DATA } = require('../config.js');

(async () => {
    const keys = getPgKeys();
    Bootpay.setConfiguration({
        application_id: keys.application_id,
        private_key: keys.private_key
    });
    try {
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
