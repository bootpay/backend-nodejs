// import { Bootpay } from "../dist/bootpay"


(async () => {
    const Bootpay = require('../dist/bootpay.js').Bootpay
    Bootpay.setConfiguration({
        application_id: '59b731f084382614ebf72215',
        private_key: 'WwDv0UjfwFa04wYG0LJZZv1xwraQnlhnHE375n52X0U='
    })
    try {
        let response = await Bootpay.getAccessToken()
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()
