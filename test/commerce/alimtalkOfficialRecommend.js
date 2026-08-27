const { getCommerceKeys, ALIMTALK_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 공식 알림톡 템플릿 추천
// POST /v1/alimtalk/official/recommend
// 보내려는 문구로 유사한 공식 템플릿을 추천받는다. 유사도 score(0~1) 내림차순이다.

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
        const response = await commerce.alimtalkOfficial.recommend({
            text: '주문하신 상품이 발송되었습니다.',
            limit: 5 // 서버 기본 5
        })
        console.log('Alimtalk Official Recommend:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
