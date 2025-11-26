// Commerce API - UserGroup User Create (그룹에 사용자 추가) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        const response = await commerce.userGroup.userCreate(
            'USER_GROUP_ID_HERE',
            'USER_ID_HERE'
        )
        console.log('UserGroup User Create Response:', response)
    } catch (e) {
        console.error('Error:', e)
    }
})()
