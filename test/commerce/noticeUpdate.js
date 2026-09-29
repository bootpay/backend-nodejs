const { getCommerceKeys, COMMERCE_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 공지사항 수정
// PUT /v1/notices/{notice_id} — supervisor 전용
// 보낸 필드만 바뀐다. images 는 보내면 목록 전체를 교체한다([] 면 모두 삭제).

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
        const response = await commerce.notice.update(COMMERCE_TEST_DATA.notice_id, {
            title: 'SDK 테스트 공지 (수정)',
            is_display: false
        })
        console.log('Notice Update:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
