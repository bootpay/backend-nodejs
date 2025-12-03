// import { Bootpay } from "../dist/index.js";
//

(async () => {
    const Bootpay = require('../dist/bootpay.js').Bootpay
    Bootpay.setConfiguration({
        application_id: '5b8f6a4d396fa665fdc2b5ea',
        private_key: 'rm6EYECr6aroQVG2ntW0A6LpWnkTgP4uQ3H18sDDUYw='
    })
    try {
        let response = await Bootpay.getAccessToken()
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()
