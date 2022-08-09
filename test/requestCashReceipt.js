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
        const response = await Bootpay.requestCashReceipt({
            pg: '토스',
            price: 1000,
            tax_free: 0,
            order_name: '테스트',
            cash_receipt_type: '소득공제',
            user: {
                username: '부트페이',
                phone: '01000000000',
                email: 'bootpay@bootpay.co.kr'
            },
            identity_no: '0100000000',
            order_id: (new Date()).getTime(),
            reserve_execute_at: new Date((new Date()).getTime())
        })
        console.log(response)
        if (response.receipt_id !== undefined) {
            const cancel = await Bootpay.cancelCashReceipt({
                receipt_id: response.receipt_id,
            })
            console.log(cancel)
        }
    } catch (e) {
        console.log(e)
    }
})()