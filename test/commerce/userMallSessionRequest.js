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

// Commerce API - 쇼핑몰(V1 Mall API) 회원 요청 규약 테스트 (네트워크 호출 없음)
//   1) 로그인:      POST   user/login       (login_id / password / corporate_type)
//   2) 세션 조회:   GET    user/session     (Bootpay-User-JWT)
//   3) 로그아웃:    DELETE user/session     (Bootpay-User-JWT)
//   4) 회원가입:    POST   user/join        (null/undefined 값은 전송하지 않는다)
//   5) 중복 확인:   GET    user/join/{type}?pk={pk}
//   * 위 endpoint 들은 users/... (레거시/외부 회원 API) 와 별개의 경로다.

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

    // 1) 회원 로그인 — corporate_type 미지정시 0
    await commerce.user.userLogin({
        login_id: 'test_user@example.com',
        password: 'password123'
    });
    assert.strictEqual(requests[0].method.toLowerCase(), 'post');
    assert.strictEqual(requests[0].url, 'https://dev-api.bootapi.com/v1/user/login');
    assert.deepStrictEqual(body(requests[0]), {
        login_id: 'test_user@example.com',
        password: 'password123',
        corporate_type: 0
    });
    assert.ok(header(requests[0], 'Idempotency-Key'), 'Idempotency-Key header is required');

    // 2) corporate_type 을 지정하면 그대로 전송한다
    await commerce.user.userLogin({
        login_id: 'biz@example.com',
        password: 'password123',
        corporate_type: 1,
        idempotency_key: 'login-key'
    });
    assert.deepStrictEqual(body(requests[1]), {
        login_id: 'biz@example.com',
        password: 'password123',
        corporate_type: 1
    });
    assert.strictEqual(header(requests[1], 'Idempotency-Key'), 'login-key');

    // 3) 회원 세션 조회 — Bootpay-User-JWT 헤더
    await commerce.user.userSession('USER_JWT');
    assert.strictEqual(requests[2].method.toLowerCase(), 'get');
    assert.strictEqual(requests[2].url, 'https://dev-api.bootapi.com/v1/user/session');
    assert.strictEqual(header(requests[2], 'Bootpay-User-JWT'), 'USER_JWT');

    // 4) user_jwt 가 없으면 헤더를 붙이지 않는다 (Ruby SDK 의 headers.compact 와 동일 동작)
    await commerce.user.userSession();
    assert.strictEqual(header(requests[3], 'Bootpay-User-JWT'), undefined);
    assert.ok(header(requests[3], 'Idempotency-Key'), 'Idempotency-Key header is required');

    // 5) 회원 로그아웃 — DELETE user/session
    await commerce.user.userLogout('USER_JWT', 'logout-key');
    assert.strictEqual(requests[4].method.toLowerCase(), 'delete');
    assert.strictEqual(requests[4].url, 'https://dev-api.bootapi.com/v1/user/session');
    assert.strictEqual(header(requests[4], 'Bootpay-User-JWT'), 'USER_JWT');
    assert.strictEqual(header(requests[4], 'Idempotency-Key'), 'logout-key');

    // 6) 회원가입 — 전달한 값만 전송, corporate_type 기본값 0
    await commerce.user.userJoin({
        login_id: 'test_user@example.com',
        password: 'password123',
        name: '테스트 사용자',
        email: 'test_user@example.com',
        phone: '010-1234-5678',
        nickname: undefined,
        gender: null
    });
    assert.strictEqual(requests[5].method.toLowerCase(), 'post');
    assert.strictEqual(requests[5].url, 'https://dev-api.bootapi.com/v1/user/join');
    assert.deepStrictEqual(body(requests[5]), {
        login_id: 'test_user@example.com',
        password: 'password123',
        name: '테스트 사용자',
        email: 'test_user@example.com',
        phone: '010-1234-5678',
        corporate_type: 0
    });

    // 7) 회원가입 중복 확인 — pk 는 query 로 전송
    await commerce.user.userJoinCheck('email-exist', 'test_user@example.com');
    assert.strictEqual(requests[6].method.toLowerCase(), 'get');
    assert.strictEqual(
        requests[6].url,
        'https://dev-api.bootapi.com/v1/user/join/email-exist?pk=test_user%40example.com'
    );
    assert.ok(header(requests[6], 'Idempotency-Key'), 'Idempotency-Key header is required');

    await commerce.user.userJoinCheck('group-business-number-exist', '123-45-67890', 'check-key');
    assert.strictEqual(
        requests[7].url,
        'https://dev-api.bootapi.com/v1/user/join/group-business-number-exist?pk=123-45-67890'
    );
    assert.strictEqual(header(requests[7], 'Idempotency-Key'), 'check-key');

    // 8) 레거시 회원 API (users/...) 는 그대로 유지된다
    await commerce.user.login('test_user@example.com', 'password123');
    assert.strictEqual(requests[8].url, 'https://dev-api.bootapi.com/v1/users/login');

    await commerce.user.checkExist('email-exist', 'test_user@example.com');
    assert.strictEqual(
        requests[9].url,
        'https://dev-api.bootapi.com/v1/users/join/email-exist?pk=test_user%40example.com'
    );

    console.log('commerce mall user: user/login, user/session, user/join endpoints + JWT header');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
