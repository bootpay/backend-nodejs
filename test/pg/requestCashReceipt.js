const { Bootpay } = require('../../dist/bootpay.js');
const { getActivePgConfig } = require('../config.js');

(async () => {
    Bootpay.setConfiguration(getActivePgConfig('production'));
    try {
        // legacy 모드에서만 실제 토큰 발급. ck/sk 모드에서는 no-op.
        await Bootpay.getAccessToken();
        const response = await Bootpay.requestCashReceipt({
            pg: '나이스페이',
            price: 1000,
            tax_free: 0,
            order_name: '테스트',
            cash_receipt_type: '소득공제',
            user: {
                username: '부트페이',
                phone: '01000000000',
                email: 'bootpay@bootpay.co.kr'
            },
            identity_no: '0100000000',
            order_id: (new Date()).getTime(),
        });
        console.log(response);
        if (response.receipt_id !== undefined) {
            const cancel = await Bootpay.cancelCashReceipt({
                receipt_id: response.receipt_id,
            });
            console.log(cancel);
        }
    } catch (e) {
        console.log(e);
    }
})();
