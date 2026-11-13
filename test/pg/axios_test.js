const { getPgKeys } = require('../config.js');
const keys = getPgKeys('production');

(async () => {
    const RestClient = require('../../dist/bootpay').Bootpay
    RestClient.setConfiguration({
        client_key: keys.client_key,
        secret_key: keys.secret_key,
    })
    // Legacy fallback:
    // RestClient.setConfiguration({
    //     application_id: process.env.BOOTPAY_APPLICATION_ID,
    //     private_key: process.env.BOOTPAY_PRIVATE_KEY
    // })
    let response = await RestClient.getAccessToken()
    // console.log(response)
    const axios = require('axios')
    try {
        response = await axios.post("https://dev-api.bootpay.co.kr/request/token.json", {
            client_key: keys.client_key,
            secret_key: keys.secret_key,
        })
        console.log(response)
    } catch(e) {
        console.log(e.response.data)
    }
})()
