(async () => {
    const Bootpay = require('../dist/bootpay.js').Bootpay
    Bootpay.setConfiguration({
        application_id: '5b8f6a4d396fa665fdc2b5ea',
        private_key: 'rm6EYECr6aroQVG2ntW0A6LpWnkTgP4uQ3H18sDDUYw='
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.confirmAuthentication(
            '63688775cf9f6d0023b85f2b',
            '457670'
        )
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()