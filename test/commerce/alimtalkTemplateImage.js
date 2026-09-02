const { getCommerceKeys, ALIMTALK_TEST_DATA, alimtalkSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 이미지형 템플릿 원본 이미지 업로드
// POST /v1/alimtalk/templates/image
// 돌려받은 image_url 을 템플릿 생성/수정의 storage_image_url 로 넘긴다.
// 규격을 업로드 전에 서버가 검사한다 — jpg/png · 500KB 이하 · 가로 500px 이상 · 2:1.

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
        if (!alimtalkSideEffectAllowed('alimtalkTemplateImage')) return

        // replace_url 을 주면 업로드 성공 후에 기존 파일을 지운다
        const response = await commerce.alimtalkTemplate.image(ALIMTALK_TEST_DATA.image_path)
        console.log('Alimtalk Template Image:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
