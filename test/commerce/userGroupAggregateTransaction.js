// Commerce API - UserGroup Aggregate Transaction (그룹 거래 집계 조회) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        const response = await commerce.userGroup.aggregateTransaction({
            user_group_id: 'USER_GROUP_ID_HERE',
            s_at: '2024-01-01',
            e_at: '2024-12-31'
        })
        console.log('UserGroup Aggregate Transaction Response:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
