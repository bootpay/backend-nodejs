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
