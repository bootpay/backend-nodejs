const assert = require('assert');
const { BootpayCommerce } = require('../../dist/bootpay-commerce.js');

function header(config, name) {
    if (!config.headers) return undefined;
    if (typeof config.headers.get === 'function') return config.headers.get(name);
    return config.headers[name] || config.headers[name.toLowerCase()] || config.headers[name.toUpperCase()];
}

// Commerce API - 쇼핑몰(V1 Mall API) 상품 요청 규약 테스트 (네트워크 호출 없음)
//   1) 목록: GET products (page/limit 기본값 1/20, category_id/ex_uid/sort/keyword 는 지정된 것만)
//   2) 상세: GET products/{product_id}
//   3) 두 endpoint 모두 Idempotency-Key + (있을 때만) Bootpay-User-JWT 헤더를 붙인다

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

    // 1) 파라미터 없이 호출하면 page=1, limit=20 이 기본으로 붙는다
    await commerce.product.products();
    assert.strictEqual(requests[0].method.toLowerCase(), 'get');
    assert.strictEqual(requests[0].url, 'https://dev-api.bootapi.com/v1/products?page=1&limit=20');
    assert.ok(header(requests[0], 'Idempotency-Key'), 'Idempotency-Key header is required');
    assert.strictEqual(header(requests[0], 'Bootpay-User-JWT'), undefined);

    // 2) category_id / sort / keyword + 회원 JWT
    await commerce.product.products({
        page: 2,
        limit: 5,
        category_id: 'CATEGORY_ID',
        sort: 'created_at',
        keyword: '테스트',
        user_jwt: 'USER_JWT',
        idempotency_key: 'products-key'
    });
    assert.strictEqual(
        requests[1].url,
        'https://dev-api.bootapi.com/v1/products?page=2&limit=5&category_id=CATEGORY_ID&sort=created_at&keyword=%ED%85%8C%EC%8A%A4%ED%8A%B8'
    );
    assert.strictEqual(header(requests[1], 'Bootpay-User-JWT'), 'USER_JWT');
    assert.strictEqual(header(requests[1], 'Idempotency-Key'), 'products-key');

    // 2-1) ex_uid — 외부 UID 로 상품 찾기
    await commerce.product.products({ ex_uid: 'EX_UID' });
    assert.strictEqual(requests[2].url, 'https://dev-api.bootapi.com/v1/products?page=1&limit=20&ex_uid=EX_UID');

    // 3) 상품 상세 — 회원 JWT 없이
    await commerce.product.productDetail('PRODUCT_ID');
    assert.strictEqual(requests[3].method.toLowerCase(), 'get');
    assert.strictEqual(requests[3].url, 'https://dev-api.bootapi.com/v1/products/PRODUCT_ID');
    assert.ok(header(requests[3], 'Idempotency-Key'), 'Idempotency-Key header is required');
    assert.strictEqual(header(requests[3], 'Bootpay-User-JWT'), undefined);

    // 4) 상품 상세 — 회원 JWT 지정
    await commerce.product.productDetail('PRODUCT_ID', 'USER_JWT', 'detail-key');
    assert.strictEqual(header(requests[4], 'Bootpay-User-JWT'), 'USER_JWT');
    assert.strictEqual(header(requests[4], 'Idempotency-Key'), 'detail-key');

    // 5) 기존 list() / detail() 은 그대로 유지된다 (기본 page/limit 없음)
    await commerce.product.list({ page: 1, limit: 10, type: 0 });
    assert.strictEqual(requests[5].url, 'https://dev-api.bootapi.com/v1/products?page=1&limit=10&type=0');

    // detail 은 productDetail 과 같은 endpoint 다 — user_jwt 를 주면 회원 컨텍스트로 조회한다
    await commerce.product.detail('PRODUCT_ID');
    assert.strictEqual(requests[6].url, 'https://dev-api.bootapi.com/v1/products/PRODUCT_ID');
    assert.ok(header(requests[6], 'Idempotency-Key'), 'Idempotency-Key header is required');
    assert.strictEqual(header(requests[6], 'Bootpay-User-JWT'), undefined);

    await commerce.product.detail('PRODUCT_ID', 'USER_JWT', 'lookup-key');
    assert.strictEqual(requests[7].url, 'https://dev-api.bootapi.com/v1/products/PRODUCT_ID');
    assert.strictEqual(header(requests[7], 'Bootpay-User-JWT'), 'USER_JWT');
    assert.strictEqual(header(requests[7], 'Idempotency-Key'), 'lookup-key');

    console.log('commerce mall product: products/product detail params + JWT header');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
