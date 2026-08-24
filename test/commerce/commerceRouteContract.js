const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { BootpayCommerce } = require('../../dist/bootpay-commerce.js');

// Commerce API - 라우트/동사/헤더 규약 테스트 (네트워크 호출 없음, 키 불필요)
//
// commerce-api v1 라우트 정본에 맞춘 회귀 테스트다. 특히 아래 함정들을 고정한다.
//   · 회원 endpoint 는 복수 users/… 다 (단수 user/… 라우트는 존재하지 않는다)
//   · requests/ing 중 resume 만 PUT, 나머지는 POST
//   · order_subscriptions · order_subscription_bills 는 언더스코어,
//     order-subscription-requests · user-groups 는 하이픈
//   · 조정항목 삭제 대상 ID 는 query 가 아니라 body
//   · multipart 전송 시 boundary 가 살아 있어야 한다 (인터셉터가 Content-Type 을 덮어쓰면 안 된다)

function header(config, name) {
    if (!config.headers) return undefined;
    if (typeof config.headers.get === 'function') return config.headers.get(name);
    return config.headers[name] || config.headers[name.toLowerCase()] || config.headers[name.toUpperCase()];
}

function relative(config) {
    return config.url.replace('https://dev-api.bootapi.com/v1/', '');
}

(async () => {
    const commerce = new BootpayCommerce({ client_key: 'ck', secret_key: 'sk', mode: 'development' });

    const requests = [];
    commerce.$http.defaults.adapter = async (config) => {
        requests.push(config);
        return { data: {}, status: 200, statusText: 'OK', headers: {}, config, request: {} };
    };

    // 직전 요청을 (method, uri) 로 검증한다. uri 는 query 를 제외한 경로만 비교한다.
    const last = () => requests[requests.length - 1];
    async function expect(label, call, method, uri) {
        await call();
        const config = last();
        assert.strictEqual(config.method.toLowerCase(), method, `${label}: method`);
        assert.strictEqual(relative(config).split('?')[0], uri, `${label}: uri`);
        return config;
    }

    // ── 회원: 단수 user/… 는 죽은 경로다. 전부 복수 users/… 여야 한다 ──
    await expect('userLogin', () => commerce.user.userLogin({ login_id: 'id', password: 'pw' }), 'post', 'users/login');
    await expect('userSession', () => commerce.user.userSession('jwt'), 'get', 'users/session');
    await expect('userLogout', () => commerce.user.userLogout('jwt'), 'delete', 'users/session');
    await expect('userJoin', () => commerce.user.userJoin({ login_id: 'id', password: 'pw', name: '홍길동' }), 'post', 'users/join');
    await expect('userJoinCheck', () => commerce.user.userJoinCheck('email-exist', 'a@b.com'), 'get', 'users/join/email-exist');

    const uidExist = await expect('uidExist', () => commerce.user.uidExist('ex_uid_1'), 'get', 'users/join/uid-exist');
    assert.ok(relative(uidExist).includes('pk=ex_uid_1'), 'uidExist: pk in query');
    assert.strictEqual(header(uidExist, 'BOOTPAY-ROLE'), 'user');

    // ── 청구서 ──
    const invoiceList = await expect('invoice.list', () => commerce.invoice.list(), 'get', 'invoices');
    assert.ok(relative(invoiceList).includes('limit=24'), 'invoice.list: 서버 기본 limit 24 를 보낸다');
    assert.strictEqual(header(invoiceList, 'BOOTPAY-ROLE'), 'user');
    assert.ok(header(invoiceList, 'Idempotency-Key'), 'invoice.list: Idempotency-Key 자동 생성');

    const invoiceFiltered = await expect(
        'invoice.list(params)',
        () => commerce.invoice.list({ page: 2, limit: 10, cs_type: 'A', user_id: 'u1', product_type: 3, css_at: '2024-01-01', cse_at: '2024-12-31' }),
        'get',
        'invoices'
    );
    ['page=2', 'limit=10', 'cs_type=A', 'user_id=u1', 'product_type=3', 'css_at=2024-01-01', 'cse_at=2024-12-31'].forEach((q) =>
        assert.ok(relative(invoiceFiltered).includes(q), `invoice.list: ${q}`)
    );

    await expect('invoice.detail', () => commerce.invoice.detail('inv1'), 'get', 'invoices/inv1');

    // send_types 미전달시 body 에 키를 넣지 않는다 (서버가 빈 배열로 처리)
    const notifyBare = await expect('invoice.notify', () => commerce.invoice.notify('inv1'), 'post', 'invoices/inv1/notify');
    assert.deepStrictEqual(JSON.parse(notifyBare.data), {});
    const notify = await expect('invoice.notify(send_types)', () => commerce.invoice.notify('inv1', [1, 3]), 'post', 'invoices/inv1/notify');
    assert.deepStrictEqual(JSON.parse(notify.data), { send_types: [1, 3] });

    // ── 상품 쓰기: manager scope ──
    const productCreate = await expect('product.create', () => commerce.product.create({ name: '상품', display_price: 1000 }), 'post', 'products');
    assert.strictEqual(header(productCreate, 'BOOTPAY-ROLE'), 'manager');
    assert.ok(String(header(productCreate, 'Content-Type')).includes('application/json'), 'product.create: 이미지 없으면 JSON');
    assert.deepStrictEqual(JSON.parse(productCreate.data), { name: '상품', display_price: 1000 });

    const productUpdate = await expect('product.update', () => commerce.product.update({ product_id: 'p1', stock: 5 }), 'put', 'products/p1');
    assert.strictEqual(header(productUpdate, 'BOOTPAY-ROLE'), 'manager');

    const productStatus = await expect(
        'product.status',
        () => commerce.product.status({ product_id: 'p1', status_sale: true, status_display: false }),
        'put',
        'products/p1/status'
    );
    assert.strictEqual(header(productStatus, 'BOOTPAY-ROLE'), 'manager');
    assert.deepStrictEqual(JSON.parse(productStatus.data), { status_sale: true, status_display: false });

    const productDelete = await expect('product.delete', () => commerce.product.delete('p1'), 'delete', 'products/p1');
    assert.strictEqual(header(productDelete, 'BOOTPAY-ROLE'), 'manager');

    // ── 상품 multipart: boundary 가 살아 있어야 한다 ──
    const imagePath = path.join(os.tmpdir(), 'bootpay-commerce-route-contract.png');
    fs.writeFileSync(imagePath, Buffer.from('89504e470d0a1a0a', 'hex'));
    try {
        const multipart = await expect(
            'product.create(images)',
            () => commerce.product.create({ name: '상품', search_tags: ['a', 'b'] }, [imagePath]),
            'post',
            'products'
        );
        const contentType = String(header(multipart, 'Content-Type'));
        assert.ok(contentType.startsWith('multipart/form-data'), 'multipart Content-Type 이 유지되어야 한다');
        assert.ok(contentType.includes('boundary='), 'boundary 가 유실되면 서버가 본문을 null 로 읽는다');
        assert.strictEqual(header(multipart, 'BOOTPAY-ROLE'), 'manager');
    } finally {
        fs.unlinkSync(imagePath);
    }

    // ── 주문 / 주문취소 ──
    const orderList = await expect(
        'order.list',
        () => commerce.order.list({ limit: 50, search_date_from: '2024-01-01', search_date_to: '2024-12-31' }),
        'get',
        'orders'
    );
    ['limit=50', 'search_date_from=2024-01-01', 'search_date_to=2024-12-31'].forEach((q) =>
        assert.ok(relative(orderList).includes(q), `order.list: ${q}`)
    );

    const cancelList = await expect('orderCancel.list', () => commerce.orderCancel.list({ order_number: 'o1' }), 'get', 'order/cancel');
    assert.strictEqual(header(cancelList, 'BOOTPAY-ROLE'), 'user');

    const withdraw = await expect('orderCancel.withdraw', () => commerce.orderCancel.withdraw('c1'), 'put', 'order/cancel/c1/withdraw');
    assert.strictEqual(header(withdraw, 'BOOTPAY-ROLE'), 'user');

    const approve = await expect(
        'orderCancel.approve',
        () => commerce.orderCancel.approve({ order_cancellation_request_id: 'c1', message: '승인' }),
        'put',
        'order/cancel/c1/approve'
    );
    assert.strictEqual(header(approve, 'BOOTPAY-ROLE'), 'supervisor');
    assert.deepStrictEqual(JSON.parse(approve.data), { message: '승인' });

    // 구 인자명도 계속 받는다 (하위호환)
    await expect(
        'orderCancel.approve(legacy id)',
        () => commerce.orderCancel.approve({ order_cancel_request_history_id: 'c2' }),
        'put',
        'order/cancel/c2/approve'
    );
    await expect(
        'orderCancel.reject',
        () => commerce.orderCancel.reject({ order_cancellation_request_id: 'c1', message: '반려' }),
        'put',
        'order/cancel/c1/reject'
    );

    // ── 구독 계약변경 / 조정항목 / 빌 ──
    const subscriptionList = await expect(
        'orderSubscription.list',
        () => commerce.orderSubscription.list({ limit: 30, status: 1, search_date_from: '2024-01-01' }),
        'get',
        'order_subscriptions'
    );
    ['limit=30', 'status=1', 'search_date_from=2024-01-01'].forEach((q) =>
        assert.ok(relative(subscriptionList).includes(q), `orderSubscription.list: ${q}`)
    );

    const subscriptionUpdate = await expect(
        'orderSubscription.update',
        () => commerce.orderSubscription.update({ order_subscription_id: 's1', quantity: 2, order_name: '변경' }),
        'put',
        'order_subscriptions/s1'
    );
    assert.strictEqual(header(subscriptionUpdate, 'BOOTPAY-ROLE'), 'supervisor');
    assert.deepStrictEqual(JSON.parse(subscriptionUpdate.data), { quantity: 2, order_name: '변경' });

    const adjustmentCreate = await expect(
        'adjustment.create',
        () => commerce.orderSubscriptionAdjustment.create('s1', { name: '할인' }),
        'post',
        'order_subscriptions/s1/adjustments'
    );
    assert.strictEqual(header(adjustmentCreate, 'BOOTPAY-ROLE'), 'supervisor');
    assert.deepStrictEqual(JSON.parse(adjustmentCreate.data), { price: 0, duration: 1, tax_free_price: 0, name: '할인' });

    const adjustmentUpdate = await expect(
        'adjustment.update',
        () => commerce.orderSubscriptionAdjustment.update({ order_subscription_id: 's1', duration: 2, adjustments: [{ name: '할인', price: -1000 }] }),
        'put',
        'order_subscriptions/s1/adjustments'
    );
    assert.deepStrictEqual(JSON.parse(adjustmentUpdate.data), { duration: 2, adjustments: [{ name: '할인', price: -1000 }] });

    // 삭제 대상 ID 는 query 가 아니라 body 로 간다
    const adjustmentDelete = await expect(
        'adjustment.delete',
        () => commerce.orderSubscriptionAdjustment.delete('s1', 'a1'),
        'delete',
        'order_subscriptions/s1/adjustments'
    );
    assert.ok(!relative(adjustmentDelete).includes('?'), 'adjustment.delete: query 로 보내면 안 된다');
    assert.deepStrictEqual(JSON.parse(adjustmentDelete.data), { order_subscription_adjustment_id: 'a1' });
    assert.strictEqual(header(adjustmentDelete, 'BOOTPAY-ROLE'), 'supervisor');

    const billList = await expect(
        'orderSubscriptionBill.list',
        () => commerce.orderSubscriptionBill.list({ order_subscription_id: 's1' }),
        'get',
        'order_subscription_bills'
    );
    assert.ok(relative(billList).includes('limit=20'), 'orderSubscriptionBill.list: 서버 기본 limit 20');
    assert.strictEqual(header(billList, 'BOOTPAY-ROLE'), 'user');

    // ── 구독 진행중 요청 (requests/ing) — resume 만 PUT ──
    const ing = commerce.orderSubscription.requestIng;
    await expect('ing.pause', () => ing.pause({ order_subscription_id: 's1' }), 'post', 'order_subscriptions/requests/ing/pause');
    await expect('ing.resume', () => ing.resume({ order_subscription_id: 's1' }), 'put', 'order_subscriptions/requests/ing/resume');
    await expect('ing.purchase', () => ing.purchase({ order_subscription_id: 's1', price: 1000 }), 'post', 'order_subscriptions/requests/ing/purchase');
    await expect('ing.termination', () => ing.termination({ order_subscription_id: 's1' }), 'post', 'order_subscriptions/requests/ing/termination');

    const transfer = await expect(
        'ing.transfer',
        () => ing.transfer({ order_subscription_id: 's1', new_user_id: 'u2' }),
        'post',
        'order_subscriptions/requests/ing/transfer'
    );
    assert.strictEqual(header(transfer, 'BOOTPAY-ROLE'), 'user');
    assert.deepStrictEqual(JSON.parse(transfer.data), { order_subscription_id: 's1', new_user_id: 'u2' });

    const calc = await expect(
        'ing.calculateTerminationFee',
        () => ing.calculateTerminationFee('s1', 'o1'),
        'get',
        'order_subscriptions/requests/ing/calculate_termination_fee'
    );
    assert.ok(relative(calc).includes('order_subscription_id=s1') && relative(calc).includes('order_number=o1'));

    // ── 구독 요청 리소스 (하이픈 경로) ──
    const requestList = await expect('request.list', () => commerce.orderSubscriptionRequest.list(), 'get', 'order-subscription-requests');
    assert.strictEqual(header(requestList, 'BOOTPAY-ROLE'), 'user', 'project_id 가 없으면 user scope');

    const supervisorList = await expect(
        'request.list(project_id)',
        () => commerce.orderSubscriptionRequest.list({ project_id: 'prj1', order_subscription_id: 's1', user_id: 'u1', user_group_id: 'g1' }),
        'get',
        'order-subscription-requests'
    );
    assert.strictEqual(header(supervisorList, 'BOOTPAY-ROLE'), 'supervisor', 'project_id 가 있으면 supervisor scope');
    ['project_id=prj1', 'order_subscription_id=s1', 'user_id=u1', 'user_group_id=g1'].forEach((q) =>
        assert.ok(relative(supervisorList).includes(q), `request.list: ${q}`)
    );

    await expect('request.detail', () => commerce.orderSubscriptionRequest.detail('r1'), 'get', 'order-subscription-requests/r1');

    const requestUpdate = await expect(
        'request.update',
        () => commerce.orderSubscriptionRequest.update({ order_subscription_request_history_id: 'r1', approval: 'approve', reason: '승인' }),
        'put',
        'order-subscription-requests/r1'
    );
    assert.strictEqual(header(requestUpdate, 'BOOTPAY-ROLE'), 'supervisor');
    assert.deepStrictEqual(JSON.parse(requestUpdate.data), { approval: 'approve', reason: '승인' });

    // ── 회원 그룹 (하이픈 경로) ──
    const groupLimit = await expect(
        'userGroup.limit',
        () => commerce.userGroup.limit({ user_group_id: 'g1', use_limit: true, limit_month_purchase: 1000, limit_week_purchase: 500 }),
        'put',
        'user-groups/g1/limit'
    );
    assert.strictEqual(header(groupLimit, 'BOOTPAY-ROLE'), 'manager');
    assert.deepStrictEqual(JSON.parse(groupLimit.data), {
        use_limit: true,
        limit_month_purchase: 1000,
        limit_week_purchase: 500
    });

    const aggregate = await expect(
        'userGroup.aggregateTransaction',
        () => commerce.userGroup.aggregateTransaction({ user_group_id: 'g1', use_subscription_aggregate_transaction: true, subscription_month_day: 5 }),
        'put',
        'user-groups/g1/aggregate-transaction'
    );
    assert.strictEqual(header(aggregate, 'BOOTPAY-ROLE'), 'manager');

    // ── scope(BOOTPAY-ROLE) 정합성 ──
    // 서버(commerce-api)가 scope_invalid! 로 supervisor/manager 를 요구하는 엔드포인트들이다.
    // 헤더를 붙이지 않으면 인스턴스 기본값 user 로 조용히 나가고 서버가 거절한다.
    const scopeCases = [
        ['orderSubscription.supervisorApprove', () => commerce.orderSubscription.supervisorApprove('s1', { reason: '승인' }), 'put', 'order_subscriptions/s1/approve', 'supervisor'],
        ['orderSubscription.supervisorReject', () => commerce.orderSubscription.supervisorReject('s1', { reason: '반려' }), 'put', 'order_subscriptions/s1/reject', 'supervisor'],
        ['orderSubscription.supervisorTerminate', () => commerce.orderSubscription.supervisorTerminate('s1', { reason: '해지' }), 'put', 'order_subscriptions/s1/terminate', 'supervisor'],
        ['orderSubscription.supervisorPause', () => commerce.orderSubscription.supervisorPause('s1', { paused_at: '2026-01-01' }), 'put', 'order_subscriptions/s1/pause', 'supervisor'],
        ['orderSubscription.supervisorResume', () => commerce.orderSubscription.supervisorResume('s1'), 'put', 'order_subscriptions/s1/resume', 'supervisor'],
        ['category.create', () => commerce.category.create({ name: '카테고리' }), 'post', 'categories', 'supervisor'],
        ['category.update', () => commerce.category.update({ category_id: 'c1', name: '변경' }), 'put', 'categories/c1', 'supervisor'],
        ['category.destroy', () => commerce.category.destroy('c1'), 'delete', 'categories/c1', 'supervisor'],
        ['userGroup.userCreate', () => commerce.userGroup.userCreate('g1', 'u1'), 'post', 'user-groups/g1/user', 'manager'],
        ['userGroup.userDelete', () => commerce.userGroup.userDelete('g1', 'u1'), 'delete', 'user-groups/g1/user/u1', 'manager']
    ];
    for (const [label, call, method, uri, role] of scopeCases) {
        const config = await expect(label, call, method, uri);
        assert.strictEqual(header(config, 'BOOTPAY-ROLE'), role, `${label}: BOOTPAY-ROLE`);
        assert.ok(header(config, 'Idempotency-Key'), `${label}: Idempotency-Key 자동 생성`);
    }

    // 명시한 Idempotency-Key 는 그대로 전달된다
    const explicitKey = await expect(
        'category.create(idempotency_key)',
        () => commerce.category.create({ name: '카테고리', idempotency_key: 'fixed-key' }),
        'post',
        'categories'
    );
    assert.strictEqual(header(explicitKey, 'Idempotency-Key'), 'fixed-key');
    // idempotency_key 는 바디에 실리지 않는다
    assert.deepStrictEqual(JSON.parse(explicitKey.data), { name: '카테고리' });

    // ── 테스트 웹훅 ──
    const webhookBare = await expect('webhook.sendTest', () => commerce.webhook.sendTest(), 'post', 'webhook/test');
    assert.deepStrictEqual(JSON.parse(webhookBare.data), {});
    const webhook = await expect('webhook.sendTest(params)', () => commerce.webhook.sendTest({ header_content_type: 1 }), 'post', 'webhook/test');
    assert.deepStrictEqual(JSON.parse(webhook.data), { header_content_type: 1 });

    console.log(`commerce route contract: ${requests.length} requests verified (uri · method · role · payload)`);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
