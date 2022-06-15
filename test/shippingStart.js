(async () => {
    const Bootpay = require('../dist/bootpay.js').Bootpay
    Bootpay.setConfiguration({
        application_id: '59b731f084382614ebf72215',
        private_key: 'WwDv0UjfwFa04wYG0LJZZv1xwraQnlhnHE375n52X0U='
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.shippingStart({
            receipt_id: "62a9379ad01c7e001f7dc1f3",
            tracking_number: '123456',
            delivery_corp: 'CJ대한통운',
            user: {
                username: '테스트',
                phone: '01000000000',
                address: '서울특별시 종로구',
                zipcode: '08490'
            }
        })
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()