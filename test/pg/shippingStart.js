const { Bootpay } = require('../../dist/bootpay.js');
const { getActivePgConfig, TEST_DATA } = require('../config.js');

(async () => {
    Bootpay.setConfiguration(getActivePgConfig());
    try {
        // legacy 모드에서만 실제 토큰 발급. ck/sk 모드에서는 no-op.
        await Bootpay.getAccessToken();
        const response = await Bootpay.shippingStart({
            receipt_id: TEST_DATA.receipt_id_escrow,
            tracking_number: '123456',
            delivery_corp: 'CJ대한통운',
            user: {
                username: '홍길동',
                phone: '01000000000',
                address: '서울특별시 구로구 디지털로 26길 61',
                zipcode: '08882'
            }
        });
        console.log(response);
    } catch (e) {
        console.log(e);
    }
})();
