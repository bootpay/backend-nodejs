(async () => {
    const Bootpay = require('../dist/bootpay.js').Bootpay
    Bootpay.setConfiguration({
        application_id: '59b731f084382614ebf72215',
        private_key: 'WwDv0UjfwFa04wYG0LJZZv1xwraQnlhnHE375n52X0U='
    })
    try {
        // console.log(new Date((new Date()).getTime() + 5000))
        await Bootpay.getAccessToken()
        const response = await Bootpay.subscribePaymentReserve({
            billing_key: '[ billing key ]',
            order_name: '테스트 결제',
            order_id: (new Date()).getTime(),
            price: 1000,
            reserve_execute_at: new Date((new Date()).getTime() + 5000)
        })
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()