(async () => {
    const Bootpay = require('../dist/bootpay.js').Bootpay
    Bootpay.setConfiguration({
        application_id: '5b8f6a4d396fa665fdc2b5ea',
        private_key: 'rm6EYECr6aroQVG2ntW0A6LpWnkTgP4uQ3H18sDDUYw='
    })
    try {
        // console.log(new Date((new Date()).getTime() + 5000))
        await Bootpay.getAccessToken()
        const response = await Bootpay.subscribePaymentReserve({
            billing_key: '62b3d166cf9f6d001bd20d59',
            order_name: '테스트 결제',
            order_id: (new Date()).getTime(),
            price: 1000,
            reserve_execute_at: new Date((new Date()).getTime() + 5000)
        })
        if (response.reserve_id !== undefined) {
            const cancel = await Bootpay.cancelSubscribeReserve(response.reserve_id)
            console.log(cancel)
        }
    } catch (e) {
        console.log(e)
    }
})()