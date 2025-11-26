// Commerce API - UserGroup User Delete (그룹에서 사용자 제거) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        const response = await commerce.userGroup.userDelete(
            'USER_GROUP_ID_HERE',
            'USER_ID_HERE'
        )
        console.log('UserGroup User Delete Response:', response)
    } catch (e) {
        console.error('Error:', e)
    }
})()
