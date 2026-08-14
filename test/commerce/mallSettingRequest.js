const assert = require('assert');
const { BootpayCommerce } = require('../../dist/bootpay-commerce.js');

function header(config, name) {
    if (!config.headers) return undefined;
    if (typeof config.headers.get === 'function') return config.headers.get(name);
    return config.headers[name] || config.headers[name.toLowerCase()] || config.headers[name.toUpperCase()];
}

function body(config) {
    return typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
}

// Commerce API - 몰 설정 요청 규약 테스트 (네트워크 호출 없음)
//   1) 조회: GET mall-setting
//   2) 수정: PUT mall-setting, null/undefined 값은 전송하지 않는다 (Ruby SDK 의 payload.compact 동작)
//   3) supervisor role + Idempotency-Key 헤더

(async () => {
    const commerce = new BootpayCommerce({
        client_key: 'ck',
        secret_key: 'sk',
        mode: 'development'
    });

    const requests = [];
    commerce.$http.defaults.adapter = async (config) => {
        requests.push(config);
        return {
            data: {},
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
            request: {}
        };
    };

    // 1) 몰 설정 조회
    await commerce.mallSetting.getMallSetting();
    assert.strictEqual(requests[0].method.toLowerCase(), 'get');
    assert.strictEqual(requests[0].url, 'https://dev-api.bootapi.com/v1/mall-setting');
    assert.strictEqual(header(requests[0], 'BOOTPAY-ROLE'), 'supervisor');
    assert.ok(header(requests[0], 'Idempotency-Key'), 'Idempotency-Key header is required');

    // 2) detail() 은 getMallSetting() 의 alias
    await commerce.mallSetting.detail();
    assert.strictEqual(requests[1].url, 'https://dev-api.bootapi.com/v1/mall-setting');

    // 3) 몰 설정 수정 — 전달한 값만 flatten 바디로 전송
    await commerce.mallSetting.updateMallSetting({
        name: '테스트몰',
        use_cart: true,
        cart_max_limit: 100,
        point_rate: 0,
        description: undefined,
        og_image: null
    });
    assert.strictEqual(requests[2].method.toLowerCase(), 'put');
    assert.strictEqual(requests[2].url, 'https://dev-api.bootapi.com/v1/mall-setting');
    assert.deepStrictEqual(body(requests[2]), {
        name: '테스트몰',
        use_cart: true,
        cart_max_limit: 100,
        point_rate: 0
    });
    assert.strictEqual(header(requests[2], 'BOOTPAY-ROLE'), 'supervisor');

    // 4) idempotency key 직접 지정
    await commerce.mallSetting.update({ name: '테스트몰' }, 'my-idempotency-key');
    assert.strictEqual(header(requests[3], 'Idempotency-Key'), 'my-idempotency-key');
    assert.deepStrictEqual(body(requests[3]), { name: '테스트몰' });

    console.log('commerce mall setting: supervisor role, flatten payload compaction');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
