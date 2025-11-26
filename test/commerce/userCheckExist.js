// Commerce API - User Check Exist (중복 체크) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        // login_id 중복 체크
        const loginIdCheck = await commerce.user.checkExist('login_id', 'test_user@example.com')
        console.log('Login ID Exist Check:', JSON.stringify(loginIdCheck, null, 2))

        // email 중복 체크
        const emailCheck = await commerce.user.checkExist('email', 'test_user@example.com')
        console.log('Email Exist Check:', JSON.stringify(emailCheck, null, 2))

        // phone 중복 체크
        const phoneCheck = await commerce.user.checkExist('phone', '010-1234-5678')
        console.log('Phone Exist Check:', JSON.stringify(phoneCheck, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
