// Commerce API - UserGroup Create (사용자 그룹 생성) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        const response = await commerce.userGroup.create({
            name: '테스트 그룹',
            corporate_type: 1, // 법인 유형
            description: '테스트용 사용자 그룹'
        })
        console.log('UserGroup Create Response:', response)
    } catch (e) {
        console.error('Error:', e)
    }
})()
