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

    // 회원등급 필터는 membership_type 으로 나가야 한다 (member_type 을 보내면 서버가 조용히 무시한다)
    const userList = await expect('user.list(membership_type)', () => commerce.user.list({ membership_type: 2 }), 'get', 'users');
    assert.ok(relative(userList).includes('membership_type=2'), 'user.list: membership_type in query');
    assert.ok(!relative(userList).includes('member_type=2'), 'user.list: 구 키 member_type 으로 보내면 안 된다');

    // 구 인자명도 계속 받는다 (하위호환) — 서버 정식 키로 매핑해서 보낸다
    const userListLegacy = await expect('user.list(member_type)', () => commerce.user.list({ member_type: 2 }), 'get', 'users');
    assert.ok(relative(userListLegacy).includes('membership_type=2'), 'user.list: member_type 은 membership_type 으로 매핑된다');

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

    // 외부 UID 로 상품 찾기 — 서버(#index)가 읽는 정식 키다
    const productsExUid = await expect('product.products(ex_uid)', () => commerce.product.products({ ex_uid: 'EX-1' }), 'get', 'products');
    assert.ok(relative(productsExUid).includes('ex_uid=EX-1'), 'product.products: ex_uid in query');

    // product.list 는 서버가 읽는 category_id / ex_uid / sort 를 실어야 한다.
    // (keyword 는 서버가 v1/products_controller#index 에서 읽는다 — 26-08-26 서버 수정)
    const productList = await expect(
        'product.list(server-read filters)',
        () => commerce.product.list({ page: 1, limit: 10, keyword: '커피', category_id: 'cat1', ex_uid: 'EX-1', sort: '-price' }),
        'get',
        'products'
    );
    ['page=1', 'limit=10', 'keyword=%EC%BB%A4%ED%94%BC', 'category_id=cat1', 'ex_uid=EX-1', 'sort=-price'].forEach((q) =>
        assert.ok(relative(productList).includes(q), `product.list: ${q} in query`)
    );

    // detail 은 productDetail 과 같은 endpoint 다. user_jwt 를 주면 회원 컨텍스트로 조회한다.
    const productDetailBare = await expect('product.detail', () => commerce.product.detail('p1'), 'get', 'products/p1');
    assert.ok(header(productDetailBare, 'Idempotency-Key'), 'product.detail: Idempotency-Key 자동 생성');
    assert.strictEqual(header(productDetailBare, 'Bootpay-User-JWT'), undefined, 'product.detail: user_jwt 없으면 헤더를 붙이지 않는다');

    const productDetailJwt = await expect('product.detail(user_jwt)', () => commerce.product.detail('p1', 'jwt-1'), 'get', 'products/p1');
    assert.strictEqual(header(productDetailJwt, 'Bootpay-User-JWT'), 'jwt-1');

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

    // 구독 계약별 · 결제유형별 필터. status 계열은 콤마로 join 해서 보낸다.
    const orderListSubscription = await expect(
        'order.list(subscription filter)',
        () =>
            commerce.order.list({
                status: [1, 2],
                payment_status: [3],
                order_subscription_ids: ['s1', 's2'],
                subscription_billing_type: 1
            }),
        'get',
        'orders'
    );
    ['status=1%2C2', 'payment_status=3', 'order_subscription_ids=s1%2Cs2', 'subscription_billing_type=1'].forEach((q) =>
        assert.ok(relative(orderListSubscription).includes(q), `order.list: ${q}`)
    );

    // 값이 비면 status= / payment_status= 를 실어 보내지 않는다 (서버는 무시하지만 노이즈다)
    const orderListEmpty = await expect('order.list(empty)', () => commerce.order.list({ status: [], payment_status: [] }), 'get', 'orders');
    assert.ok(!relative(orderListEmpty).includes('status='), 'order.list: 빈 배열은 쿼리에 넣지 않는다');
    assert.ok(!relative(orderListEmpty).includes('order_subscription_ids='), 'order.list: 미지정 order_subscription_ids 는 쿼리에 넣지 않는다');

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

    // 주문번호로 구독 계약 역조회
    const subscriptionByOrderNumber = await expect(
        'orderSubscription.list(order_number)',
        () => commerce.orderSubscription.list({ order_number: 'o1' }),
        'get',
        'order_subscriptions'
    );
    assert.ok(relative(subscriptionByOrderNumber).includes('order_number=o1'), 'orderSubscription.list: order_number in query');

    const subscriptionUpdate = await expect(
        'orderSubscription.update',
        () => commerce.orderSubscription.update({ order_subscription_id: 's1', quantity: 2, order_name: '변경' }),
        'put',
        'order_subscriptions/s1'
    );
    assert.strictEqual(header(subscriptionUpdate, 'BOOTPAY-ROLE'), 'supervisor');
    assert.deepStrictEqual(JSON.parse(subscriptionUpdate.data), { quantity: 2, order_name: '변경' });

    // price 는 회차별 기준금액. 그대로 body 로 실려야 한다 (READY 회차 청구액이 재계산된다)
    const subscriptionUpdatePrice = await expect(
        'orderSubscription.update(price)',
        () => commerce.orderSubscription.update({ order_subscription_id: 's1', price: 12000 }),
        'put',
        'order_subscriptions/s1'
    );
    assert.deepStrictEqual(JSON.parse(subscriptionUpdatePrice.data), { price: 12000 });

    // memo 는 변경이력에 남길 사유다. body 로 그대로 실려야 한다.
    const subscriptionUpdateMemo = await expect(
        'orderSubscription.update(memo)',
        () => commerce.orderSubscription.update({ order_subscription_id: 's1', price: 12000, memo: '가격 인하 프로모션' }),
        'put',
        'order_subscriptions/s1'
    );
    assert.deepStrictEqual(JSON.parse(subscriptionUpdateMemo.data), { price: 12000, memo: '가격 인하 프로모션' });

    const adjustmentCreate = await expect(
        'adjustment.create',
        () => commerce.orderSubscriptionAdjustment.create('s1', { name: '할인' }),
        'post',
        'order_subscriptions/s1/adjustments'
    );
    assert.strictEqual(header(adjustmentCreate, 'BOOTPAY-ROLE'), 'supervisor');
    assert.deepStrictEqual(JSON.parse(adjustmentCreate.data), { price: 0, duration: 1, tax_free_price: 0, name: '할인' });

    // 범위 조정: duration_from ~ duration_to 는 회차마다 한 건씩 생성된다
    const adjustmentRange = await expect(
        'adjustment.create(range)',
        () =>
            commerce.orderSubscriptionAdjustment.create('s1', {
                name: '할인',
                price: -1000,
                duration_from: 3,
                duration_to: 7
            }),
        'post',
        'order_subscriptions/s1/adjustments'
    );
    assert.deepStrictEqual(JSON.parse(adjustmentRange.data), {
        price: -1000,
        duration: 1,
        tax_free_price: 0,
        name: '할인',
        duration_from: 3,
        duration_to: 7
    });

    // 무제한 조정: duration_from 부터 계약 끝까지 (is_unlimited 가 false 여도 body 에서 빠지면 안 된다)
    const adjustmentUnlimited = await expect(
        'adjustment.create(is_unlimited)',
        () =>
            commerce.orderSubscriptionAdjustment.create('s1', {
                name: '할인',
                price: -1000,
                duration_from: 3,
                is_unlimited: true
            }),
        'post',
        'order_subscriptions/s1/adjustments'
    );
    assert.deepStrictEqual(JSON.parse(adjustmentUnlimited.data), {
        price: -1000,
        duration: 1,
        tax_free_price: 0,
        name: '할인',
        duration_from: 3,
        is_unlimited: true
    });

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

    // ── 알림톡 v1 (/v1/alimtalk/…) ──
    // 알림톡 endpoint 는 전부 BOOTPAY-ROLE: user 로 고정된다 (스코프 키가 전부 user:alimtalk_*).
    // ★Idempotency-Key 를 붙이지 않는다★ — 서버가 이 헤더를 읽지 않으므로, 붙이면 주지 않는 멱등을 주는 것처럼 보인다.
    //   (알림톡의 멱등은 발송의 ref_id 로만 성립한다)
    function assertAlimtalkHeaders(label, config) {
        assert.strictEqual(header(config, 'BOOTPAY-ROLE'), 'user', `${label}: BOOTPAY-ROLE 은 항상 user`);
        assert.strictEqual(header(config, 'Idempotency-Key'), undefined, `${label}: Idempotency-Key 를 보내면 안 된다`);
    }

    // 인스턴스 role 이 manager 로 바뀌어 있어도 알림톡은 user 로 나가야 한다
    commerce.asManager();

    // 발송내역·집계
    const messageList = await expect(
        'alimtalkMessage.list',
        () => commerce.alimtalkMessage.list({ template_code: 'T1', status: 'success', ref_id: 'r1', to: '01012345678', s_at: '2026-08-01', e_at: '2026-08-27', page: 2, limit: 50 }),
        'get',
        'alimtalk/messages'
    );
    assertAlimtalkHeaders('alimtalkMessage.list', messageList);
    ['template_code=T1', 'status=success', 'ref_id=r1', 'to=01012345678', 's_at=2026-08-01', 'e_at=2026-08-27', 'page=2', 'limit=50'].forEach((q) =>
        assert.ok(relative(messageList).includes(q), `alimtalkMessage.list: ${q}`)
    );

    const messageListBare = await expect('alimtalkMessage.list(bare)', () => commerce.alimtalkMessage.list(), 'get', 'alimtalk/messages');
    assert.ok(!relative(messageListBare).includes('?'), 'alimtalkMessage.list: 미지정 파라미터는 쿼리에 넣지 않는다');

    const messageStats = await expect(
        'alimtalkMessage.stats',
        () => commerce.alimtalkMessage.stats({ s_at: '2026-08-01', e_at: '2026-08-27' }),
        'get',
        'alimtalk/messages/stats'
    );
    assert.ok(relative(messageStats).includes('s_at=2026-08-01'), 'alimtalkMessage.stats: s_at');

    assertAlimtalkHeaders(
        'alimtalkMessage.detail',
        await expect('alimtalkMessage.detail', () => commerce.alimtalkMessage.detail('rc1'), 'get', 'alimtalk/messages/rc1')
    );

    // 공식 카탈로그 — keyword 는 서버 정본 키인 q 로 나가야 한다
    const officialList = await expect(
        'alimtalkOfficial.list',
        () => commerce.alimtalkOfficial.list({ keyword: '주문', category: '주문', msg_type: 'BA', page: 1, per: 50, ksp_id: 'k1' }),
        'get',
        'alimtalk/official'
    );
    assert.ok(relative(officialList).includes('q=%EC%A3%BC%EB%AC%B8'), 'alimtalkOfficial.list: keyword 는 q 로 보낸다');
    assert.ok(!relative(officialList).includes('keyword='), 'alimtalkOfficial.list: keyword 키로 보내지 않는다');
    ['msg_type=BA', 'per=50', 'ksp_id=k1'].forEach((q) => assert.ok(relative(officialList).includes(q), `alimtalkOfficial.list: ${q}`));

    const recommend = await expect(
        'alimtalkOfficial.recommend',
        () => commerce.alimtalkOfficial.recommend({ text: '주문이 접수되었습니다', limit: 3 }),
        'post',
        'alimtalk/official/recommend'
    );
    assert.deepStrictEqual(JSON.parse(recommend.data), { text: '주문이 접수되었습니다', limit: 3 });
    assertAlimtalkHeaders('alimtalkOfficial.recommend', recommend);

    const officialDetail = await expect('alimtalkOfficial.detail', () => commerce.alimtalkOfficial.detail('OFC001', 'k1'), 'get', 'alimtalk/official/OFC001');
    assert.ok(relative(officialDetail).includes('ksp_id=k1'), 'alimtalkOfficial.detail: ksp_id');

    // 수신거부
    const optoutList = await expect('alimtalkOptout.list', () => commerce.alimtalkOptout.list({ phone: '0101234', page: 2 }), 'get', 'alimtalk/optouts');
    ['phone=0101234', 'page=2'].forEach((q) => assert.ok(relative(optoutList).includes(q), `alimtalkOptout.list: ${q}`));

    const optoutCreate = await expect(
        'alimtalkOptout.create',
        () => commerce.alimtalkOptout.create({ phone: '01012345678', reason: '고객 요청' }),
        'post',
        'alimtalk/optouts'
    );
    assert.deepStrictEqual(JSON.parse(optoutCreate.data), { phone: '01012345678', reason: '고객 요청' });

    const optoutCheck = await expect(
        'alimtalkOptout.check',
        () => commerce.alimtalkOptout.check({ phones: ['01012345678', '01087654321'] }),
        'post',
        'alimtalk/optouts/check'
    );
    assert.deepStrictEqual(JSON.parse(optoutCheck.data), { phones: ['01012345678', '01087654321'] });

    assertAlimtalkHeaders(
        'alimtalkOptout.release',
        await expect('alimtalkOptout.release', () => commerce.alimtalkOptout.release('01012345678'), 'delete', 'alimtalk/optouts/01012345678')
    );

    // 발송 — ⚠️ fallback 은 false 와 미지정이 다르다. false 는 반드시 실려야 한다.
    const send = await expect(
        'alimtalkSend.send',
        () => commerce.alimtalkSend.send({ template_code: 'T1', to: '01012345678', variables: { user_name: '홍길동' }, ref_id: 'ref-1', fallback: false }),
        'post',
        'alimtalk/send'
    );
    assert.deepStrictEqual(JSON.parse(send.data), {
        template_code: 'T1',
        to: '01012345678',
        variables: { user_name: '홍길동' },
        ref_id: 'ref-1',
        fallback: false
    });
    assertAlimtalkHeaders('alimtalkSend.send', send);

    const sendBare = await expect('alimtalkSend.send(bare)', () => commerce.alimtalkSend.send({ template_code: 'T1', to: '01012345678' }), 'post', 'alimtalk/send');
    assert.deepStrictEqual(JSON.parse(sendBare.data), { template_code: 'T1', to: '01012345678' });
    assert.ok(!('fallback' in JSON.parse(sendBare.data)), 'alimtalkSend.send: 미지정 fallback 은 보내지 않는다(프로젝트 기본값을 따른다)');

    const sendBulk = await expect(
        'alimtalkSend.bulk',
        () => commerce.alimtalkSend.bulk({ template_code: 'T1', recipients: [{ to: '01012345678', ref_id: 'b-1' }], fallback: true, sender_key: 'sk1' }),
        'post',
        'alimtalk/send/bulk'
    );
    assert.deepStrictEqual(JSON.parse(sendBulk.data), {
        template_code: 'T1',
        recipients: [{ to: '01012345678', ref_id: 'b-1' }],
        fallback: true,
        sender_key: 'sk1'
    });

    assertAlimtalkHeaders(
        'alimtalkSend.cancel',
        await expect('alimtalkSend.cancel', () => commerce.alimtalkSend.cancel('rc1'), 'delete', 'alimtalk/send/rc1')
    );

    // 발신프로필 — categories 는 senders 하위가 아니라 alimtalk/categories 다
    assertAlimtalkHeaders(
        'alimtalkSender.categories',
        await expect('alimtalkSender.categories', () => commerce.alimtalkSender.categories(), 'get', 'alimtalk/categories')
    );

    const senderOtp = await expect(
        'alimtalkSender.otp',
        () => commerce.alimtalkSender.otp({ yellow_id: '@bootpay', phone: '01012345678' }),
        'post',
        'alimtalk/senders/otp'
    );
    assert.deepStrictEqual(JSON.parse(senderOtp.data), { yellow_id: '@bootpay', phone: '01012345678' });

    const senderCreate = await expect(
        'alimtalkSender.create',
        () => commerce.alimtalkSender.create({ otp: '123456', yellow_id: '@bootpay', phone: '01012345678', category_code: '001001' }),
        'post',
        'alimtalk/senders'
    );
    assert.deepStrictEqual(JSON.parse(senderCreate.data), { otp: '123456', yellow_id: '@bootpay', phone: '01012345678', category_code: '001001' });

    await expect('alimtalkSender.list', () => commerce.alimtalkSender.list(), 'get', 'alimtalk/senders');

    const senderDetail = await expect('alimtalkSender.detail(sync)', () => commerce.alimtalkSender.detail('k1', true), 'get', 'alimtalk/senders/k1');
    assert.ok(relative(senderDetail).includes('sync=true'), 'alimtalkSender.detail: sync');
    const senderDetailBare = await expect('alimtalkSender.detail', () => commerce.alimtalkSender.detail('k1'), 'get', 'alimtalk/senders/k1');
    assert.ok(!relative(senderDetailBare).includes('sync='), 'alimtalkSender.detail: 미지정 sync 는 보내지 않는다(자체 DB 만 본다)');

    await expect('alimtalkSender.release', () => commerce.alimtalkSender.release('k1'), 'delete', 'alimtalk/senders/k1');

    const variableExamples = await expect(
        'alimtalkSender.variableExamples',
        () => commerce.alimtalkSender.variableExamples('k1', { user_name: '홍길동' }),
        'put',
        'alimtalk/senders/k1/variable_examples'
    );
    assert.deepStrictEqual(JSON.parse(variableExamples.data), { examples: { user_name: '홍길동' } });

    // 자체 템플릿
    const templateList = await expect(
        'alimtalkTemplate.list',
        () => commerce.alimtalkTemplate.list({ ins: 3, sort: 'latest', keyword: '주문' }),
        'get',
        'alimtalk/templates'
    );
    ['ins=3', 'sort=latest'].forEach((q) => assert.ok(relative(templateList).includes(q), `alimtalkTemplate.list: ${q}`));

    // ⚠️ register: false 는 반드시 실려야 한다 — 빠지면 생성 즉시 대행사·카카오에 실제 등록된다
    const templateCreate = await expect(
        'alimtalkTemplate.create',
        () => commerce.alimtalkTemplate.create({ ksp_id: 'k1', name: '주문완료', content: '#{user_name}님 주문이 완료되었습니다', register: false, msg_type: 'BA' }),
        'post',
        'alimtalk/templates'
    );
    assert.deepStrictEqual(JSON.parse(templateCreate.data), {
        ksp_id: 'k1',
        name: '주문완료',
        content: '#{user_name}님 주문이 완료되었습니다',
        register: false,
        msg_type: 'BA'
    });
    assertAlimtalkHeaders('alimtalkTemplate.create', templateCreate);

    const templateDetail = await expect('alimtalkTemplate.detail(sync)', () => commerce.alimtalkTemplate.detail('t1', false), 'get', 'alimtalk/templates/t1');
    assert.ok(relative(templateDetail).includes('sync=false'), 'alimtalkTemplate.detail: 서버 기본 sync 가 true 라 false 를 명시적으로 실어야 한다');

    const templateUpdate = await expect(
        'alimtalkTemplate.update',
        () => commerce.alimtalkTemplate.update('t1', { name: '주문완료', content: '본문' }),
        'put',
        'alimtalk/templates/t1'
    );
    assert.deepStrictEqual(JSON.parse(templateUpdate.data), { name: '주문완료', content: '본문' });

    await expect('alimtalkTemplate.delete', () => commerce.alimtalkTemplate.delete('t1'), 'delete', 'alimtalk/templates/t1');
    await expect('alimtalkTemplate.register', () => commerce.alimtalkTemplate.register('t1'), 'post', 'alimtalk/templates/t1/register');
    await expect('alimtalkTemplate.inspect', () => commerce.alimtalkTemplate.inspect('t1'), 'post', 'alimtalk/templates/t1/inspect');

    // 내보내기 — SDK 기본은 json 이다 (서버 기본 csv 는 JSON 이 아니라서 일반 조회 경로로는 파싱이 깨진다)
    const exportJson = await expect('alimtalkTemplate.export', () => commerce.alimtalkTemplate.export(), 'get', 'alimtalk/templates/export');
    assert.ok(relative(exportJson).includes('format=json'), 'alimtalkTemplate.export: 기본 format 은 json');
    assert.strictEqual(header(exportJson, 'Accept'), 'application/json');

    const exportCsv = await expect(
        'alimtalkTemplate.export(csv)',
        () => commerce.alimtalkTemplate.export({ format: 'csv', scope: 'all', include_content: true }),
        'get',
        'alimtalk/templates/export'
    );
    ['format=csv', 'scope=all', 'include_content=true'].forEach((q) => assert.ok(relative(exportCsv).includes(q), `alimtalkTemplate.export: ${q}`));
    // CSV 는 파싱하지 않고 원문으로 받는다 — Accept 를 */* 로 덮어쓰고 응답 변환을 끈다
    assert.strictEqual(header(exportCsv, 'Accept'), '*/*', 'alimtalkTemplate.export(csv): Accept 를 */* 로 보낸다');
    assert.strictEqual(exportCsv.responseType, 'text');
    assert.strictEqual(exportCsv.__bootpayRaw, true);

    // 템플릿 이미지 multipart — boundary 가 살아 있어야 한다
    const templateImagePath = path.join(os.tmpdir(), 'bootpay-alimtalk-template.png');
    fs.writeFileSync(templateImagePath, Buffer.from('89504e470d0a1a0a', 'hex'));
    try {
        for (const [label, call, uri] of [
            ['alimtalkTemplate.image', () => commerce.alimtalkTemplate.image(templateImagePath, 'https://cdn/old.png'), 'alimtalk/templates/image'],
            ['alimtalkTemplate.highlightImage', () => commerce.alimtalkTemplate.highlightImage(templateImagePath), 'alimtalk/templates/highlight_image']
        ]) {
            const config = await expect(label, call, 'post', uri);
            const contentType = String(header(config, 'Content-Type'));
            assert.ok(contentType.startsWith('multipart/form-data'), `${label}: multipart Content-Type 유지`);
            assert.ok(contentType.includes('boundary='), `${label}: boundary 가 유실되면 서버가 본문을 null 로 읽는다`);
            assertAlimtalkHeaders(label, config);
        }
    } finally {
        fs.unlinkSync(templateImagePath);
    }

    // 알림톡 웹훅 — 주문 웹훅(webhook.sendTest, POST /v1/webhook/test)과 완전히 별개 경로다
    assertAlimtalkHeaders(
        'alimtalkWebhook.detail',
        await expect('alimtalkWebhook.detail', () => commerce.alimtalkWebhook.detail(), 'get', 'alimtalk/webhook')
    );

    const alimtalkWebhookUpdate = await expect(
        'alimtalkWebhook.update',
        () => commerce.alimtalkWebhook.update({ url: 'https://example.com/hook', events: [301, 302], enabled: true }),
        'put',
        'alimtalk/webhook'
    );
    assert.deepStrictEqual(JSON.parse(alimtalkWebhookUpdate.data), { url: 'https://example.com/hook', events: [301, 302], enabled: true });

    await expect('alimtalkWebhook.test', () => commerce.alimtalkWebhook.test(), 'post', 'alimtalk/webhook/test');
    await expect('alimtalkWebhook.rotateSecret', () => commerce.alimtalkWebhook.rotateSecret(), 'post', 'alimtalk/webhook/secret');

    const deliveries = await expect(
        'alimtalkWebhook.deliveries',
        () => commerce.alimtalkWebhook.deliveries({ page: 2, limit: 100 }),
        'get',
        'alimtalk/webhook/deliveries'
    );
    ['page=2', 'limit=100'].forEach((q) => assert.ok(relative(deliveries).includes(q), `alimtalkWebhook.deliveries: ${q}`));

    commerce.clearRole();

    console.log(`commerce route contract: ${requests.length} requests verified (uri · method · role · payload)`);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
