const assert = require('assert');
const { Bootpay } = require('../../dist/bootpay.js');

function header(config, name) {
    if (!config.headers) return undefined;
    if (typeof config.headers.get === 'function') return config.headers.get(name);
    return config.headers[name] || config.headers[name.toLowerCase()] || config.headers[name.toUpperCase()];
}

function body(data) {
    return typeof data === 'string' ? JSON.parse(data) : data;
}

(async () => {
    const requests = [];
    Bootpay.$http.defaults.adapter = async (config) => {
        requests.push(config);
        return {
            data: { access_token: 'legacy_access_token' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
            request: {}
        };
    };

    Bootpay.setConfiguration({
        application_id: 'legacy_application_id',
        private_key: 'legacy_private_key',
        mode: 'development'
    });

    assert.strictEqual(Bootpay.bootpayConfiguration.application_id, 'legacy_application_id');
    assert.strictEqual(Bootpay.bootpayConfiguration.private_key, 'legacy_private_key');
    assert.strictEqual(Bootpay.bootpayConfiguration.client_key, undefined);
    assert.strictEqual(Bootpay.bootpayConfiguration.secret_key, undefined);
    assert.strictEqual(Bootpay.entrypoints('request/token'), 'https://dev-api.bootpay.co.kr/v2/request/token');

    // 1) legacy: getAccessToken 은 request/token 으로 토큰 발급
    const legacyTokenRes = await Bootpay.getAccessToken();
    assert.strictEqual(legacyTokenRes.access_token, 'legacy_access_token');
    assert.deepStrictEqual(body(requests[0].data), {
        application_id: 'legacy_application_id',
        private_key: 'legacy_private_key'
    });
    assert.strictEqual(header(requests[0], 'authorization'), undefined);

    // 2) legacy: 후속 요청에 Bearer 헤더 자동 부착
    await Bootpay.receiptPayment('receipt_id_for_header_check');
    assert.strictEqual(header(requests[1], 'authorization'), 'Bearer legacy_access_token');

    // 3) ck/sk: getAccessToken 은 Option A 로 no-op — HTTP 호출 없이 합성 응답만 반환
    Bootpay.setConfiguration({
        client_key: 'ck',
        secret_key: 'sk',
        mode: 'development'
    });
    const beforeCk = requests.length;
    const ckTokenRes = await Bootpay.getAccessToken();
    assert.deepStrictEqual(ckTokenRes, { access_token: '', expire_in: 0 });
    assert.strictEqual(requests.length, beforeCk, 'ck/sk getAccessToken must not make HTTP call');

    // 4) ck/sk: 실제 API 요청 시 매 요청 Basic Auth 헤더 부착
    await Bootpay.receiptPayment('receipt_id_for_basic_auth_check');
    assert.strictEqual(
        header(requests[beforeCk], 'authorization'),
        `Basic ${Buffer.from('ck:sk').toString('base64')}`
    );

    // 5) ck 만 있고 sk 없으면 즉시 에러
    Bootpay.setConfiguration({
        client_key: 'ck',
        mode: 'production'
    });
    await assert.rejects(
        () => Bootpay.getAccessToken(),
        (error) => error.error_code === -101 && error.message.includes('client_key/secret_key')
    );

    // 6) legacy + 부주의하게 sk 만 함께 들어와도 ck 없으면 legacy 경로 유지
    Bootpay.setConfiguration({
        application_id: 'legacy_application_id',
        private_key: 'legacy_private_key',
        secret_key: 'ignored_without_client_key',
        mode: 'production'
    });
    Bootpay.$token = undefined;
    const beforeFallback = requests.length;
    await Bootpay.getAccessToken();
    assert.deepStrictEqual(body(requests[beforeFallback].data), {
        application_id: 'legacy_application_id',
        private_key: 'legacy_private_key'
    });
    assert.strictEqual(header(requests[beforeFallback], 'authorization'), undefined);

    console.log('legacy application_id/private_key and client_key/secret_key auth are compatible');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
