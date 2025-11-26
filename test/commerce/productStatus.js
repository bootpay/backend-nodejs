// Commerce API - Product Status (상품 상태 변경) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        const response = await commerce.product.status({
            product_id: 'PRODUCT_ID_HERE',
            status: 2 // 비활성 상태로 변경
        })
        console.log('Product Status Response:', response)
    } catch (e) {
        console.error('Error:', e)
    }
})()
