const assert = require('assert');
const { Bootpay } = require('../../dist/bootpay.js');

// PG API - 우선순위(순차) 결제 빌링키 조회 URL 규약 테스트 (네트워크 호출 없음)
//   GET subscribe/sequential_billing_key/{billing_key}?widget_key={widget_key}&user_id={user_id}

(async () => {
    Bootpay.setConfiguration({ client_key: 'ck', secret_key: 'sk', mode: 'development' });

    const requests = [];
    Bootpay.$http.defaults.adapter = async (config) => {
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

    await Bootpay.lookupSequentialBillingKey('widget_key_1', 'billing_key_1', 'user_id_1');
    assert.strictEqual(requests[0].method.toLowerCase(), 'get');
    assert.strictEqual(
        requests[0].url,
        'https://dev-api.bootpay.co.kr/v2/subscribe/sequential_billing_key/billing_key_1?widget_key=widget_key_1&user_id=user_id_1'
    );

    console.log('pg lookupSequentialBillingKey: billing_key in path, widget_key/user_id in query');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
