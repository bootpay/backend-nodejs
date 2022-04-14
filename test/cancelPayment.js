(async () => {
    const Bootpay = require('../dist/bootpay.js').Bootpay
    Bootpay.setConfiguration({
        application_id: '59b731f084382614ebf72215',
        private_key: 'WwDv0UjfwFa04wYG0LJZZv1xwraQnlhnHE375n52X0U='
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.cancelPayment({
            receipt_id: '625763921fc19202e4747199',
            cancel_price: 1000,
            cancel_username: '테스트 사용자',
            cancel_message: '테스트 취소입니다.'
        })
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()