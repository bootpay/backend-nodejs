const { getCommerceKeys, ALIMTALK_TEST_DATA, alimtalkSideEffectAllowed } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 아이템리스트형 하이라이트 썸네일 업로드
// POST /v1/alimtalk/templates/highlight_image
// ⚠️ 본문 이미지와 규격이 다르다 — jpg/png · 500KB 이하 · 가로 108px 이상 · 1:1.
//    본문 이미지 endpoint(alimtalkTemplateImage.js)로 올리면 거부된다.
// 돌려받은 image_url 은 item_highlight.storage_image_url 로 넘긴다.
// ⚠️ 썸네일을 붙이면 하이라이트 글자 한도가 줄어든다(타이틀 30→21, 설명 19→13).

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
        if (!alimtalkSideEffectAllowed('alimtalkTemplateHighlightImage')) return

        const response = await commerce.alimtalkTemplate.highlightImage(ALIMTALK_TEST_DATA.image_path)
        console.log('Alimtalk Template Highlight Image:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
