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
    //     application_id: '5b8f6a4d396fa665fdc2b5ea',
    //     private_key: 'rm6EYECr6aroQVG2ntW0A6LpWnkTgP4uQ3H18sDDUYw='
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
