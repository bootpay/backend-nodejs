// Commerce API - getAccessToken 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development' // 'production' | 'development' | 'stage'
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
