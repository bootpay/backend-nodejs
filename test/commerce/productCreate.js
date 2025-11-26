// Commerce API - Product Create (상품 생성) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg=',
        mode: 'development'
    })

    try {
        await commerce.getAccessToken()

        // 이미지 없이 상품 생성
        const response = await commerce.product.create({
            name: '테스트 상품',
            price: 10000,
            description: '테스트 상품 설명',
            type: 1, // 상품 유형
            status: 1 // 활성 상태
        })
        console.log('Product Create Response:', response)

        // 이미지와 함께 상품 생성
        // const responseWithImages = await commerce.product.create(
        //     {
        //         name: '테스트 상품 (이미지 포함)',
        //         price: 20000,
        //         description: '테스트 상품 설명',
        //         type: 1
        //     },
        //     ['/path/to/image1.jpg', '/path/to/image2.jpg']
        // )
        // console.log('Product Create With Images Response:', responseWithImages)
    } catch (e) {
        console.error('Error:', e)
    }
})()
