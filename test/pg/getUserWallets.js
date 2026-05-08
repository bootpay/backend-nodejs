const { Bootpay } = require('../../dist/bootpay.js');
const { getActivePgConfig } = require('../config.js');

(async () => {
    Bootpay.setConfiguration(getActivePgConfig('production'))
    try {
        // legacy 모드에서만 실제 토큰 발급. ck/sk 모드에서는 no-op.
        await Bootpay.getAccessToken()
        const response = await Bootpay.getUserWallets(
            'bootpay',
            true
        )
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()