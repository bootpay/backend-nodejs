// Commerce API - UserGroup Limit (그룹 제한 설정) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        const response = await commerce.userGroup.limit({
            user_group_id: 'USER_GROUP_ID_HERE',
            limit_amount: 1000000, // 제한 금액
            limit_count: 100 // 제한 횟수
        })
        console.log('UserGroup Limit Response:', response)
    } catch (e) {
        console.error('Error:', e)
    }
})()
