const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - getAccessToken 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: keys.client_key,
        secret_key: keys.secret_key,
        mode: keys.mode // 'production' | 'development' | 'stage'
    })

    try {
        const response = await commerce.getAccessToken()
        console.log('Access Token Response:', JSON.stringify(response, null, 2))

        // 토큰 확인
        console.log('Has Token:', commerce.hasToken())
        console.log('Current Token:', commerce.getCurrentToken())
    } catch (e) {
        console.error('Error:', e)
    }
})()
