import config from '../config.js';
const { getActivePgConfig, TEST_DATA } = config;
import { Bootpay } from "../../dist/bootpay.js"

(async () => {
    Bootpay.setConfiguration(getActivePgConfig('production'))
    try {
        // legacy 모드에서만 실제 토큰 발급. ck/sk 모드에서는 no-op.
        await Bootpay.getAccessToken()
        const response = await Bootpay.confirmAuthentication(
            TEST_DATA.receipt_id_confirm,
            '457670'
        )
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()