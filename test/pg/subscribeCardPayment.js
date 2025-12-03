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
        const response = await Bootpay.requestSubscribeCardPayment({
            billing_key: TEST_DATA.billing_key,
            order_name: '테스트결제',
            price: 1000,
            order_id: Date.now().toString()
        });
        console.log(response);
    } catch (e) {
        console.log(e);
    }
})();
