// import { Bootpay } from "../dist/bootpay"
(async () => {
    const Bootpay = require('../dist/bootpay.js').Bootpay
    Bootpay.setConfiguration({
        application_id: '5b8f6a4d396fa665fdc2b5ea',
        private_key: 'rm6EYECr6aroQVG2ntW0A6LpWnkTgP4uQ3H18sDDUYw='
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.confirmPayment('62876963d01c7e00209b6028')
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()
