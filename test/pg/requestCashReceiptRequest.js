const assert = require('assert');
const { Bootpay } = require('../../dist/bootpay.js');

// PG API - 별건 현금영수증 발행 요청 규약 테스트 (네트워크 호출 없음, 키 불필요)
//   POST request/cash/receipt
//
// pg 는 선택값이다. 생략하면 가맹점에 설정된 기본 PG사로 발행되므로,
// SDK 가 임의의 기본 PG명을 채워 넣거나 필수로 막아서는 안 된다.

function body(data) {
    return typeof data === 'string' ? JSON.parse(data) : data;
}

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

    const payload = {
        price: 1000,
        tax_free: 0,
        order_name: '테스트',
        cash_receipt_type: '소득공제',
        identity_no: '0100000000',
        order_id: 'cash_receipt_order_1'
    };

    // 1) pg 를 생략해도 그대로 발행 요청이 나간다 (기본 PG 사용)
    await Bootpay.requestCashReceipt(payload);
    assert.strictEqual(requests[0].method.toLowerCase(), 'post');
    assert.strictEqual(requests[0].url, 'https://dev-api.bootpay.co.kr/v2/request/cash/receipt');
    assert.deepStrictEqual(body(requests[0].data), payload);
    assert.ok(!('pg' in body(requests[0].data)), 'pg 를 생략하면 임의의 기본값을 채워 보내면 안 된다');

    // 2) pg 를 주면 지정한 PG사로 그대로 전달된다
    await Bootpay.requestCashReceipt({ pg: '나이스페이', ...payload });
    assert.strictEqual(body(requests[1].data).pg, '나이스페이');

    console.log('pg requestCashReceipt: pg 는 선택값 (미지정시 기본 PG)');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
