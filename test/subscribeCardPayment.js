(async () => {
    const Bootpay = require('../dist/bootpay.js').Bootpay
    Bootpay.setConfiguration({
        application_id: '5b8f6a4d396fa665fdc2b5ea',
        private_key: 'rm6EYECr6aroQVG2ntW0A6LpWnkTgP4uQ3H18sDDUYw='
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.requestSubscribeCardPayment({
            billing_key: '62b3d166cf9f6d001bd20d59',
            order_name: '테스트 결제',
            order_id: (new Date()).getTime(),
            price: 100,
            tax_free: 0
        })
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()