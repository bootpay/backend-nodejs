(async () => {
    const Bootpay = require('../dist/bootpay.js').Bootpay
    Bootpay.setConfiguration({
        application_id: '5b8f6a4d396fa665fdc2b5ea',
        private_key: 'rm6EYECr6aroQVG2ntW0A6LpWnkTgP4uQ3H18sDDUYw='
    })
    try {
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