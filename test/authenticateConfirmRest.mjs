import { Bootpay } from "../dist/bootpay.js"

(async () => {
    // const Bootpay = require('../esm/dist/bootpay.js').Bootpay
    Bootpay.setConfiguration({
        application_id: '5b8f6a4d396fa665fdc2b5ea',
        private_key:    'rm6EYECr6aroQVG2ntW0A6LpWnkTgP4uQ3H18sDDUYw='
    })
    try {
        const token = await Bootpay.getAccessToken()
        console.log(token)
        const response = await Bootpay.confirmAuthentication(
            '63688775cf9f6d0023b85f2b',
            '457670'
        )
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()