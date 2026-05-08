const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - Product Create (상품 생성) 테스트

(async () => {
    const { BootpayCommerce } = require('../../dist/bootpay-commerce.js')

    const commerce = new BootpayCommerce({
        client_key: keys.client_key,
        secret_key: keys.secret_key,
        mode: keys.mode
    })

    try {
        // (legacy) application_id 방식에서만 필요. ck/sk 는 매 요청 Basic Auth 헤더로 직접 인증되므로 호출 불필요.
        // await commerce.getAccessToken()

        // 이미지 없이 상품 생성
        const response = await commerce.product.create({
            name: '테스트 상품',
            price: 10000,
            description: '테스트 상품 설명',
            type: 1, // 상품 유형
            status: 1 // 활성 상태
        })
        console.log('Product Create Response:', JSON.stringify(response, null, 2))

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
