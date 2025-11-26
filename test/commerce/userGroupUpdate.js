// Commerce API - UserGroup Update (사용자 그룹 수정) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        const response = await commerce.userGroup.update({
            user_group_id: 'USER_GROUP_ID_HERE',
            name: '수정된 그룹명',
            description: '수정된 설명'
        })
        console.log('UserGroup Update Response:', response)
    } catch (e) {
        console.error('Error:', e)
    }
})()
