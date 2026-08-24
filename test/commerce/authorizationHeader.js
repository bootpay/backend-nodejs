const assert = require('assert');
const { BootpayCommerce } = require('../../dist/bootpay-commerce.js');

function header(config, name) {
    if (!config.headers) return undefined;
    if (typeof config.headers.get === 'function') return config.headers.get(name);
    return config.headers[name] || config.headers[name.toLowerCase()] || config.headers[name.toUpperCase()];
}

// Commerce API - Authorization 헤더 선택 규칙 테스트 (네트워크 호출 없음)
//   1) 토큰이 없으면 client_key/secret_key Basic Auth
//   2) 저장된 토큰이 있어도 Basic 유지
//   3) Basic Auth 값이 토큰을 오염시키지 않아야 한다 (연속 요청에도 Basic 유지)

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
            data: { access_token: 'commerce_access_token' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
            request: {}
        };
    };

    const basic = `Basic ${Buffer.from('ck:sk').toString('base64')}`;

    // 1) 토큰 미발급 상태 — Basic Auth 부착
    await commerce.product.list();
    assert.strictEqual(header(requests[0], 'Authorization'), basic);

    // 2) 연속 요청에도 Basic 이 그대로 유지 (Basic 값이 $token 으로 새어나가면 안 된다)
    await commerce.product.list();
    assert.strictEqual(header(requests[1], 'Authorization'), basic);
    assert.strictEqual(commerce.getToken(), undefined, 'basic auth must not populate the token');
    assert.strictEqual(commerce.hasToken(), false);

    // 3) request/token 요청 자체는 Basic Auth 로 나가고, 발급된 토큰이 저장된다
    const tokenResponse = await commerce.getAccessToken();
    assert.strictEqual(tokenResponse.access_token, 'commerce_access_token');
    assert.strictEqual(header(requests[2], 'Authorization'), basic);
    assert.strictEqual(commerce.getCurrentToken(), 'commerce_access_token');

    // 4) 토큰 발급 이후에도 Commerce 요청은 Basic을 유지한다
    await commerce.product.list();
    assert.strictEqual(header(requests[3], 'Authorization'), basic);

    // 5) setToken 으로 직접 넣은 토큰도 일반 요청의 Basic 인증을 바꾸지 않는다
    commerce.setToken('manual_token');
    await commerce.product.list();
    assert.strictEqual(header(requests[4], 'Authorization'), basic);

    // 6) 키가 없으면 네트워크 요청 전에 거절한다
    const anonymous = new BootpayCommerce({ mode: 'development' });
    anonymous.$http.defaults.adapter = commerce.$http.defaults.adapter;
    await assert.rejects(
        () => anonymous.product.list(),
        (error) => error.error_code === -101 && error.message.includes('client_key/secret_key')
    );

    console.log('commerce authorization header: Basic-only auth stays stable');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
