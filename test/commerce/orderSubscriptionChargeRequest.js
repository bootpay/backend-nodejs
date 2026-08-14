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

// Commerce API - 수시결제(온디맨드) charge_key 요청 규약 테스트 (네트워크 호출 없음)
//   1) 결제: POST order_subscriptions/charge, charge_key 는 body 로만 전송
//   2) 해지: DELETE order_subscriptions/charge, body 에 charge_key/user
//   3) supervisor role + Idempotency-Key 헤더 (미지정시 매 호출마다 생성)

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

    // 1) charge_key 즉시 결제
    await commerce.orderSubscription.supervisorCharge({
        charge_key: 'charge_key_1',
        price: 1000,
        tax_free_price: 0,
        user: { id: 'user_1' },
        metadata: { memo: 'test' }
    });
    assert.strictEqual(requests[0].method.toLowerCase(), 'post');
    assert.strictEqual(requests[0].url, 'https://dev-api.bootapi.com/v1/order_subscriptions/charge');
    assert.ok(!requests[0].url.includes('charge_key_1'), 'charge_key must never appear in the URL');
    assert.deepStrictEqual(body(requests[0]), {
        charge_key: 'charge_key_1',
        price: 1000,
        tax_free_price: 0,
        user: { id: 'user_1' },
        metadata: { memo: 'test' }
    });
    assert.strictEqual(header(requests[0], 'BOOTPAY-ROLE'), 'supervisor');
    assert.ok(header(requests[0], 'Idempotency-Key'), 'Idempotency-Key header is required');

    // 2) 호출마다 Idempotency-Key 는 새로 생성된다
    await commerce.orderSubscription.supervisorCharge({ charge_key: 'charge_key_1', price: 1000 });
    assert.notStrictEqual(header(requests[1], 'Idempotency-Key'), header(requests[0], 'Idempotency-Key'));
    assert.deepStrictEqual(body(requests[1]), { charge_key: 'charge_key_1', price: 1000 });

    // 3) idempotency_key 를 직접 지정하면 헤더로만 전송되고 body 에는 포함되지 않는다
    await commerce.orderSubscription.supervisorCharge({
        charge_key: 'charge_key_1',
        price: 1000,
        idempotency_key: 'my-idempotency-key'
    });
    assert.strictEqual(header(requests[2], 'Idempotency-Key'), 'my-idempotency-key');
    assert.deepStrictEqual(body(requests[2]), { charge_key: 'charge_key_1', price: 1000 });

    // 4) charge_key 해지 — DELETE + body
    await commerce.orderSubscription.supervisorChargeRevoke({
        charge_key: 'charge_key_1',
        user: { id: 'user_1' }
    });
    assert.strictEqual(requests[3].method.toLowerCase(), 'delete');
    assert.strictEqual(requests[3].url, 'https://dev-api.bootapi.com/v1/order_subscriptions/charge');
    assert.deepStrictEqual(body(requests[3]), { charge_key: 'charge_key_1', user: { id: 'user_1' } });
    assert.strictEqual(header(requests[3], 'BOOTPAY-ROLE'), 'supervisor');
    assert.ok(header(requests[3], 'Idempotency-Key'), 'Idempotency-Key header is required');

    // 5) role 을 user 로 두어도 charge endpoint 는 supervisor 로 나간다
    commerce.asUser();
    await commerce.orderSubscription.supervisorCharge({ charge_key: 'charge_key_1', price: 1000 });
    assert.strictEqual(header(requests[4], 'BOOTPAY-ROLE'), 'supervisor');

    // 6) 일반 endpoint 는 설정된 role 을 그대로 사용한다
    await commerce.orderSubscription.list();
    assert.strictEqual(header(requests[5], 'BOOTPAY-ROLE'), 'user');

    // 7) null/undefined 값은 body 에서 제거된다 (Ruby SDK 의 payload.compact 와 동일)
    await commerce.orderSubscription.supervisorCharge({
        charge_key: 'charge_key_1',
        price: 1000,
        tax_free_price: null,
        user: undefined
    });
    assert.deepStrictEqual(body(requests[6]), { charge_key: 'charge_key_1', price: 1000 });

    console.log('commerce order subscription charge: body-only charge_key, supervisor role, idempotency key');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
