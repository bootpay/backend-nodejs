// Commerce API - Product Update (상품 수정) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        const response = await commerce.product.update({
            product_id: 'PRODUCT_ID_HERE',
            name: '수정된 상품명',
            price: 15000,
            description: '수정된 상품 설명'
        })
        console.log('Product Update Response:', response)
    } catch (e) {
        console.error('Error:', e)
    }
})()
