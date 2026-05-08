const { Bootpay } = require('../../dist/bootpay.js');
const { getActivePgConfig } = require('../config.js');

(async () => {
    Bootpay.setConfiguration(getActivePgConfig('production'))
    try {
        // legacy 모드에서만 실제 토큰 발급. ck/sk 모드에서는 no-op.
        await Bootpay.getAccessToken()
        const response = await Bootpay.requestAuthentication({
            pg: '다날',
            method: '본인인증',
            order_name: '테스트 인증',
            authentication_id: (new Date()).getTime(),
            username: '이름',
            identity_no: '생년월일',
            phone: '전화번호',
            carrier: '통신사',
            authenticate_type: 'sms'
        })
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()