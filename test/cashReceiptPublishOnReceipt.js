(async () => {
    const Bootpay = require('../dist/bootpay.js').Bootpay
    // Bootpay.setConfiguration({
    //     application_id: '5b8f6a4d396fa665fdc2b5ea',
    //     private_key: 'rm6EYECr6aroQVG2ntW0A6LpWnkTgP4uQ3H18sDDUYw='
    // })
    Bootpay.setConfiguration({
        application_id: '59bfc738e13f337dbd6ca48a',
        private_key: 'pDc0NwlkEX3aSaHTp/PPL/i8vn5E/CqRChgyEp/gHD0=',
        mode: 'development'
    })
    try {
        // console.log(new Date((new Date()).getTime() + 5000))
        await Bootpay.getAccessToken()
        const response = await Bootpay.cashReceiptPublishOnReceipt({
            receipt_id: "62e32b3f1fc192036e8db942",
            username: '테스트',
            email: 'test@bootpay.co.kr',
            phone: '01000000000',
            identity_no: '01000000000',
            cash_receipt_type: '소득공제'
        })
        console.log(response)
        if (response.receipt_id !== undefined) {
            const cancel = await Bootpay.cashReceiptCancelOnReceipt({
                receipt_id: "62e32b3f1fc192036e8db942",
            })
            console.log(cancel)
        }
    } catch (e) {
        console.log(e)
    }
})()