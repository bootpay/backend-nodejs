const { getCommerceKeys, ALIMTALK_TEST_DATA } = require('../config.js');
const keys = getCommerceKeys();
// Commerce API - 알림톡 템플릿 목록 내보내기
// GET /v1/alimtalk/templates/export
// scope: private(기본, 내 채널 자체 템플릿)·official(공식 카탈로그)·all
// ⚠️ SDK 기본 format 은 json 이다 — 서버 기본은 csv 지만 csv 본문은 JSON 이 아니라 파싱이 깨진다.
//    csv 를 주면 파싱 없이 { body, content_type } 으로 원문을 돌려준다.
// 1회 5,000건을 넘으면 3031 로 거부되므로 채널·상태 필터로 좁힌다.

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
        const json = await commerce.alimtalkTemplate.export({ scope: 'private', include_content: true })
        console.log('Alimtalk Template Export (json):', JSON.stringify(json, null, 2))

        // csv 는 파싱하지 않고 원문 문자열로 받는다
        const csv = await commerce.alimtalkTemplate.export({ format: 'csv', scope: 'all' })
        console.log('Alimtalk Template Export (csv) content_type:', csv.content_type)
        console.log('Alimtalk Template Export (csv) body:', csv.body)
    } catch (e) {
        console.error('Error:', e)
    }
})()
