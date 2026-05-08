const { Bootpay } = require('../../dist/bootpay.js');
const { getActivePgConfig, TEST_DATA } = require('../config.js');

(async () => {
    Bootpay.setConfiguration(getActivePgConfig('production'))
    try {
        // console.log(new Date((new Date()).getTime() + 5000))
        // legacy 모드에서만 실제 토큰 발급. ck/sk 모드에서는 no-op.
        await Bootpay.getAccessToken()
        const response = await Bootpay.realarmAuthentication(TEST_DATA.receipt_id_confirm)
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()