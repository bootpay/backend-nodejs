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
        const response = await Bootpay.lookupSubscribeBillingKey(TEST_DATA.receipt_id_billing);
        console.log(response);
    } catch (e) {
        console.log(e);
    }
})();
