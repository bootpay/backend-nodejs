// Commerce API - Category 수정

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()
        const response = await commerce.category.update({
            category_id: 'CATEGORY_ID_HERE',
            name: 'SDK Test Category (updated)',
            status_display: true,
            status_best: true
        })
        console.log('Category Update:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
