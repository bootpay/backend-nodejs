// Commerce API - User List (사용자 목록 조회) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        // 기본 목록 조회
        const response = await commerce.user.list()
        console.log('User List Response:', response)

        // 파라미터로 조회
        const filteredResponse = await commerce.user.list({
            page: 1,
            limit: 10,
            keyword: '테스트'
        })
        console.log('Filtered User List Response:', filteredResponse)
    } catch (e) {
        console.error('Error:', e)
    }
})()
