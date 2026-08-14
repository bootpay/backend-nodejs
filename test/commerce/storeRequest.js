const assert = require('assert');
const { BootpayCommerce } = require('../../dist/bootpay-commerce.js');

function header(config, name) {
    if (!config.headers) return undefined;
    if (typeof config.headers.get === 'function') return config.headers.get(name);
    return config.headers[name] || config.headers[name.toLowerCase()] || config.headers[name.toUpperCase()];
}

// Commerce API - 가맹점 정보 요청 규약 테스트 (네트워크 호출 없음)
//   1) 기본 정보: GET store
//   2) 상세 정보: GET store/detail
//   3) 두 endpoint 모두 Idempotency-Key 헤더를 붙인다

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

    // 1) 가맹점 기본 정보
    await commerce.store.getStore();
    assert.strictEqual(requests[0].method.toLowerCase(), 'get');
    assert.strictEqual(requests[0].url, 'https://dev-api.bootapi.com/v1/store');
    assert.ok(header(requests[0], 'Idempotency-Key'), 'Idempotency-Key header is required');

    // 2) info() 는 getStore() 의 alias
    await commerce.store.info('store-key');
    assert.strictEqual(requests[1].url, 'https://dev-api.bootapi.com/v1/store');
    assert.strictEqual(header(requests[1], 'Idempotency-Key'), 'store-key');

    // 3) 가맹점 상세 정보
    await commerce.store.getStoreDetail();
    assert.strictEqual(requests[2].method.toLowerCase(), 'get');
    assert.strictEqual(requests[2].url, 'https://dev-api.bootapi.com/v1/store/detail');
    assert.ok(header(requests[2], 'Idempotency-Key'), 'Idempotency-Key header is required');

    // 4) detail() 은 getStoreDetail() 의 alias
    await commerce.store.detail('store-detail-key');
    assert.strictEqual(requests[3].url, 'https://dev-api.bootapi.com/v1/store/detail');
    assert.strictEqual(header(requests[3], 'Idempotency-Key'), 'store-detail-key');

    console.log('commerce store: store / store/detail + Idempotency-Key');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
