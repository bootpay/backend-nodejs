const { getCommerceKeys } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 공지사항 등록
// POST /v1/notices — supervisor 전용

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
        const response = await commerce.notice.create({
            title: 'SDK 테스트 공지',
            content: 'SDK 로 등록한 공지사항입니다.',
            is_notice: true,
            is_display: true
        })
        console.log('Notice Create:', JSON.stringify(response, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})()
