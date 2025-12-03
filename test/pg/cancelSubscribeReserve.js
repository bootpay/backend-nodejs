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
        // 예약 결제 등록
        const reserve = await Bootpay.subscribePaymentReserve({
            billing_key: TEST_DATA.billing_key,
            order_name: '테스트결제',
            price: 1000,
            order_id: Date.now().toString(),
            reserve_execute_at: new Date(Date.now() + 60000).toISOString()
        });
        console.log('예약 등록:', reserve);

        if (reserve.data && reserve.data.reserve_id) {
            // 예약 취소
            const cancel = await Bootpay.cancelSubscribeReserve(reserve.data.reserve_id);
            console.log('예약 취소:', cancel);
        }
    } catch (e) {
        console.log(e);
    }
})();
