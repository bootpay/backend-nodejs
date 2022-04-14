// import { Bootpay } from "../dist/bootpay"


(async () => {
    const Bootpay = require('../dist/bootpay.js').Bootpay
    Bootpay.setConfiguration({
        application_id: '59b731f084382614ebf72215',
        private_key: 'WwDv0UjfwFa04wYG0LJZZv1xwraQnlhnHE375n52X0U='
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.receiptPayment('61b009aaec81b4057e7f6ecd')
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()
