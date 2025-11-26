// Commerce API - User Join (회원가입) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        const response = await commerce.user.join({
            login_id: 'test_user@example.com',
            login_pw: 'password123',
            name: '테스트 사용자',
            email: 'test_user@example.com',
            phone: '010-1234-5678'
        })
        console.log('User Join Response:', response)
    } catch (e) {
        console.error('Error:', e)
    }
})()
