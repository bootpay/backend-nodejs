(async () => {
    const Bootpay = require('../dist/bootpay.js').Bootpay
    Bootpay.setConfiguration({
        application_id: '59b731f084382614ebf72215',
        private_key: 'WwDv0UjfwFa04wYG0LJZZv1xwraQnlhnHE375n52X0U='
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.requestSubscribeCardPayment({
            billing_key: '62579f4bcf9f6d001d0aed21',
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