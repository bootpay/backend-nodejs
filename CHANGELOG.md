### 2.13.1

#### 별건 현금영수증 발행의 `pg` 를 선택값으로

`Bootpay.requestCashReceipt()` 의 `pg` 가 필수였다. 서버는 `pg` 가 없으면 가맹점에 설정된 기본 PG사로
발행하는데, SDK 타입이 이를 막고 있어 기본 PG를 쓰려는 가맹점도 PG명을 문자열로 적어 넣어야 했다.
PG를 바꾸면 SDK 호출부까지 같이 고쳐야 하는, 서버에 없는 제약이었다.

- `RequestCashReceiptParameters.pg` 를 `pg?: string` 으로 변경 — 생략하면 기본 PG사로 발행된다.
- 기존처럼 `pg` 를 지정하는 호출은 그대로 동작한다 (전송값 변화 없음).
- 테스트: `test/pg/requestCashReceiptRequest.js` 추가 — `pg` 미지정시 SDK 가 임의의 기본값을 채워 넣지
  않고 `pg` 키 없이 보내는지, `pg` 를 주면 그대로 전달되는지 고정한다.

### 2.13.0

#### 알림톡 v1 API 35종 추가

카카오 알림톡 API(`/v1/alimtalk/…`)를 SDK 에 추가했다. 발송·발송내역·공식 카탈로그·자체 템플릿·
발신프로필·수신거부·알림톡 웹훅 7개 모듈이며, `commerce.alimtalk*` 로 접근한다.

- `alimtalkSend` — `send` / `bulk` / `cancel`
  - ⚠️ `fallback` 은 **미지정과 `false` 가 다르다**. 미지정이면 프로젝트 기본값을 따르고 `false` 는
    문자(LMS) 대체발송을 명시적으로 끈다. `compact` 가 `null`/`undefined` 만 걷어내므로 `false` 는 그대로 전달된다.
  - 멱등은 `ref_id` 로만 성립한다 — 같은 (프로젝트, `ref_id`) 로 재요청하면 기존 receipt 를 돌려준다.
- `alimtalkMessage` — `list` / `stats` / `detail`
- `alimtalkOfficial` — `list` / `recommend` / `detail`. `keyword` 는 서버 정본 키인 **`q`** 로 전송한다
  (서버는 `q` 를 먼저 보고 없으면 `keyword` 를 본다).
- `alimtalkTemplate` — `list` / `create` / `detail` / `update` / `delete` / `register` / `inspect` /
  `export` / `image` / `highlightImage`
  - `export` 의 **기본 `format` 을 `json` 으로 둔다.** 서버 기본은 `csv` 지만 csv 본문은 JSON 이 아니라
    일반 조회 경로로는 파싱이 깨져 "통신 실패" 라는 틀린 메시지가 된다. `format: 'csv'` 를 주면 파싱 없이
    `{ body, content_type }` 으로 원문을 돌려준다.
  - 본문 이미지(2:1, 가로 500px↑)와 하이라이트 썸네일(1:1, 가로 108px↑)은 **규격이 다른 별개 endpoint** 다.
- `alimtalkSender` — `categories` / `otp` / `create` / `list` / `detail` / `release` / `variableExamples`
- `alimtalkOptout` — `list` / `create` / `check` / `release`. 전역 차단은 해제되지 않고 `global_blocked: true` 로 알려 준다.
- `alimtalkWebhook` — `detail` / `update` / `test` / `rotateSecret` / `deliveries`
  - ⚠️ 주문·구독 통합 웹훅(`webhook.sendTest`, `POST /v1/webhook/test`)과 **완전히 별개 경로**다.

공통 규약:

- **`BOOTPAY-ROLE` 은 항상 `user`** 다. 알림톡 스코프 키가 전부 `user:alimtalk_*` 라서, 인스턴스 role 이
  `asManager()` 등으로 바뀌어 있어도 알림톡 요청은 `user` 로 고정해 보낸다.
- **`Idempotency-Key` 를 보내지 않는다.** 서버가 이 헤더를 읽지 않으므로, 다른 커머스 endpoint 처럼
  무조건 붙이면 서버가 주지 않는 멱등을 주는 것처럼 보인다.
- ⚠️ 알림톡에는 **샌드박스가 없다.** 발송·채널등록·템플릿등록·검수요청·웹훅발송은 실제로 나가고 과금된다.

부수 변경:

- `BootpayCommerceResource.getRaw()` 와 `BootpayCommerceRawResponse` 추가 — JSON 이 아닌 본문을
  파싱하지 않고 `{ body, content_type }` 으로 받는다. 현재는 템플릿 내보내기 csv 만 사용한다.
  일반 요청의 `Accept` 는 기존대로 `application/json` 으로 고정되고, 원문 요청일 때만 호출부 값(`*/*`)이 살아난다.
- 테스트: `test/commerce/commerceRouteContract.js` 에 알림톡 35종 회귀 테스트(경로·동사·role·`Idempotency-Key`
  미전송·`fallback: false` 보존·csv 원문 수신·multipart boundary)를 추가하고,
  `test/commerce/alimtalk*.js` 35개 스크립트를 추가했다. 부작용이 있는 스크립트는
  `BOOTPAY_TEST_ALIMTALK_LIVE=true` 일 때만 실제로 호출한다.

### 2.12.0

#### `product.list` 의 조회 필터를 서버 실제 계약에 맞춤

서버(`v1/products_controller#index`)가 읽는 것은 **page · limit · keyword · category_id · ex_uid · sort** 뿐인데,
``product.list()`` 은 정작 그중 `category_id` · `ex_uid` · `sort` 를 **보내지 않고**, 서버가 읽지 않는
`type` · `period_type` · `s_at` · `e_at` · `category_code` 만 보내고 있었다.
필터가 걸린 줄 알았는데 전체 목록이 돌아오는, `member_type` → `membership_type` 과 같은 조용한 실패였다.

- ``ProductListParams`` 에 **`category_id` / `ex_uid` / `sort`** 추가 — 서버가 읽는 값이라 이제 실제로 필터가 걸린다.
- 서버가 읽지 않는 `type` / `period_type` / `s_at` / `e_at` / `category_code` 는 **전송은 그대로 유지**하되(기존 호출 보호) 무시된다는 경고를 문서에 달았다.
  `type` 은 서버의 상품 타입 필터가 문자열(`subscription`/`discount`/`normal`)이라 이 숫자 필드와 값 체계 자체가 다르다.
- ⚠️ `keyword` 는 **26-08-26 서버 변경부터** 실제로 적용된다 (그 이전 배포본에서는 무시된다).
  같은 라운드에서 `GET /v1/products` 의 `sort` 가 항상 무시되던 서버 버그도 함께 고쳤다 — SDK 쪽 변경은 없다.


#### 누락된 파라미터 추가

서버가 이미 읽고 있는데 SDK 에 인자가 없어 쓸 수 없던 파라미터들을 채웠다. 요청 경로·동사·scope 는 변경 없다.

- `user.list` 의 회원등급 필터 키 정정 — 서버(`v1/users_controller#index`)가 읽는 이름은 `membership_type` 인데 `member_type` 을 보내고 있어 등급 필터가 **조용히 무시됐다** (에러 없이 전체 목록이 돌아온다). 기존 호출 호환을 위해 `member_type` 인자는 남기고 `membership_type` 으로 매핑해 전송한다.
- `orderSubscription.list` 에 `order_number` 추가 — 주문번호로 구독 계약을 역조회한다.
- `orderSubscription.update` 에 `memo` 추가 — 변경이력(`SUBSCRIPTION_ACTION_UPDATE`)에 남길 사유다.
- `product.products` 에 `ex_uid` 추가 — 외부 UID 로 상품을 찾는다.
- `product.detail` 에 `userJwt` / `idempotencyKey` 추가 — 매뉴얼이 `GET /v1/products/:id` 에 `user_jwt` 를 안내하는데 이 메서드만 헤더를 안 보내 회원 컨텍스트 조회가 안 됐다. 이제 `productDetail` 과 동작이 같다 (부수 효과로 `Idempotency-Key` 가 자동 부착된다).
- `order.list` 의 `order_subscription_ids` / `subscription_billing_type` (구독 계약별·결제유형별 필터)에 회귀 테스트를 추가했다. 빈 배열이면 `status=` / `payment_status=` 를 실어 보내지 않는다.
- `test/commerce/commerceRouteContract.js` · `test/commerce/productMallRequest.js` 에 회귀 테스트를 추가했다.

### 2.11.0

#### 구독 가격 변경 · 범위로 회차조정

- `orderSubscription.update` 에 `price` 추가 — 회차별 결제 금액의 **기준금액**이다. 바꾸면 결제예정(READY) 회차의 청구액이 즉시 다시 계산되고, 이후 회차도 이 금액으로 만들어진다. 이미 결제된 회차는 그대로다. 0 이하는 받지 않는다. 특정 회차만 가감하려면 `orderSubscriptionAdjustment.create` 를 쓴다.
- `orderSubscriptionAdjustment.create` 에 `duration_from` / `duration_to` / `is_unlimited` 추가 — 회차를 범위로 지정한다.
  - `duration: 5` → 5회차 한 건만
  - `duration_from: 3, duration_to: 7` → 3~7회차 각각 한 건씩 (총 5건)
  - `duration_from: 3, is_unlimited: true` → 3회차부터 계약 끝까지 (레코드는 1건, `duration_to` 는 무시)
  - 상한은 계약 총회차이며, 총회차가 무제한인 계약은 60회차까지다. 이미 결제가 끝난 회차는 거절되고, 범위 중 한 회차라도 최종 금액이 음수면 전부 거절된다(부분 반영 없음).
- 요청 경로·동사·scope 는 변경 없다. `test/commerce/commerceRouteContract.js` 에 회귀 테스트를 추가했다.

### 2.10.0

#### Commerce scope(BOOTPAY-ROLE) 정합성 (동작 변경)

서버(commerce-api)가 `scope_invalid!` 로 supervisor / manager scope 를 요구하는 10개 엔드포인트가 `BOOTPAY-ROLE: user` 로 나가고 있었다. 요청 단위로 올바른 scope 를 붙인다. Java SDK 3.3.0 · Ruby SDK 와 같은 규약이다.

- `orderSubscription` — `supervisorApprove` / `supervisorReject` / `supervisorTerminate` / `supervisorPause` / `supervisorResume` → **supervisor**
- `category` — `create` / `update` / `destroy` → **supervisor**
- `userGroup` — `userCreate` / `userDelete` → **manager**

부수 효과로 이 10개 호출에 `Idempotency-Key` 가 자동 부착된다 (다른 supervisor 메서드·Ruby SDK 와 동일). 요청 경로·바디는 변경 없다.
⚠️ 그동안 이 API 들은 올바른 키로도 scope 오류로 거절됐다. 우회하려고 role 을 직접 조작하던 코드가 있다면 제거해도 된다.

- 각 메서드의 파라미터에 `idempotency_key` (optional) 를 추가했다. 지정하면 그 값이 `Idempotency-Key` 헤더로 나가고 바디에는 실리지 않는다. `category.destroy(categoryId, idempotencyKey?)` / `userGroup.userCreate(userGroupId, userId, idempotencyKey?)` / `userGroup.userDelete(userGroupId, userId, idempotencyKey?)` 는 선택 인자로 받는다.
- `test/commerce/commerceRouteContract.js` 에 10개 엔드포인트의 scope·Idempotency-Key 회귀 테스트를 추가했다.

### 2.9.0
* Commerce: 죽은 경로 정정 — 회원 endpoint 는 단수 `user/...` 가 아니라 복수 `users/...` 다 (commerce-api v1 에 단수 라우트가 없다)
  - `user.userLogin`: `POST users/login` (v1/users/login#create) — `POST users/session` 은 라우트만 있고 create 액션이 없으므로 쓰지 않는다
  - `user.userSession`: `GET users/session` / `user.userLogout`: `DELETE users/session`
  - `user.userJoin`: `POST users/join` / `user.userJoinCheck`: `GET users/join/{type}?pk={pk}`
  - `userJoin`↔`join`, `userJoinCheck`↔`checkExist` 는 같은 endpoint 를 부르지만 서버가 파라미터 조합으로 분기하므로 둘 다 유지
* Commerce: 신규 endpoint 추가
  - `user.uidExist(uid)`: `GET users/join/uid-exist?pk={uid}` — `*_exist` 전용형 5종 완성
  - `webhook.sendTest({ header_content_type })`: `POST webhook/test` — 테스트 웹훅 발송
  - `orderSubscription.requestIng.purchase`: `POST order_subscriptions/requests/ing/purchase` (중도인수 요청)
  - `orderSubscription.requestIng.transfer`: `POST order_subscriptions/requests/ing/transfer` (이전/승계 요청)
* Commerce: multipart 전송 계층 신설 — `postMultipart` 추가 및 요청 인터셉터가 지정된 `Content-Type` 을 덮어쓰지 않도록 수정
  - 덮어쓰면 form-data 의 boundary 가 사라져 서버가 본문을 null 로 읽는 버그가 있었다
  - `product.create` 는 이미지가 없으면 JSON, 있으면 multipart(`images[0]`, `images[1]` … 인덱싱)로 전송
* Commerce: 인자·응답 규약 정정
  - `invoice.list` 응답은 `{ items, total }` 이 아니라 `{ list, count }` — 타입 선언 정정, `limit` 기본값 24, `cs_type`/`user_id`/`product_type`/`css_at`/`cse_at` 파라미터 추가
  - `invoice.notify` 의 `sendTypes` 를 선택 인자로 변경 (미전달시 서버가 빈 배열로 처리)
  - `orderCancel.approve`/`reject`/`withdraw` 인자명을 `order_cancellation_request_id` 로 통일 (구 이름 `order_cancel_request_history_id` 도 계속 지원)
  - `orderSubscriptionAdjustment.delete` 는 대상 ID 를 query 가 아니라 body 로 전송
  - `orderSubscriptionAdjustment.update` 에 `adjustments` 배열 지원 (서버는 `duration` 회차 단위로 교체)
  - `userGroup.limit` 에 `limit_month_purchase`/`limit_week_purchase` 추가 (서버 정식 인자명; `update` 로는 한도가 반영되지 않는다)
  - `order.list` 에 `search_date_from`/`search_date_to` 추가 (`css_at`/`cse_at` 는 서버 별칭으로 계속 지원)
  - `orderSubscription.list` 에 `search_date_from`/`search_date_to`/`status` 추가
  - `orderSubscriptionRequest.list` 에 `order_subscription_id`/`user_id`/`user_group_id` 추가
  - `product.products` 의 `keyword` 는 서버가 읽지 않음을 문서화 (인자는 하위호환 유지)
* Commerce: 서버가 요구하는 scope 를 endpoint 별로 명시 — 상품 쓰기/그룹 한도는 `manager`, 구독 계약변경·조정항목·요청 승인은 `supervisor`, 나머지는 `user`
  - `orderSubscriptionRequest.list`/`detail` 은 `project_id` 가 있으면 `supervisor`, 없으면 `user`
* PG: `lookupSequentialBillingKey(widgetKey, billingKey, userId)` — `user_id` 쿼리 파라미터 추가
* 의존성: `form-data` 를 dependencies 에 명시 (multipart 전송에 직접 사용)

### 2.8.0
* Commerce: 쇼핑몰(V1 Mall API) 회원 endpoint 정정 및 추가 — 단수형 `user/...` 경로 사용 (기존 `users/...` 외부 회원 연동 API 는 그대로 유지)
  - `user.userLogin({ login_id, password, corporate_type })`: `POST user/login` — corporate_type 미지정시 0
  - `user.userSession(userJwt)`: `GET user/session`
  - `user.userLogout(userJwt)`: `DELETE user/session`
  - `user.userJoin({ login_id, password, name, ... })`: `POST user/join` — null/undefined 값은 전송하지 않음
  - `user.userJoinCheck(type, pk)`: `GET user/join/{type}?pk={pk}`
  - 세션이 필요한 호출은 회원 JWT 를 `Bootpay-User-JWT` 헤더로 전달 (값이 있을 때만 부착)
* Commerce: 상품 조회 Mall API parity
  - `product.products`: `GET products` — `page`/`limit` 기본값 1/20, `category_id`/`sort` 파라미터 및 `user_jwt` 지원
  - `product.productDetail(productId, userJwt)`: `GET products/{product_id}` — 회원 JWT 지원
* Commerce: `store.getStore`/`getStoreDetail` 에 `Idempotency-Key` 헤더 부착 (`idempotencyKey` 인자로 직접 지정 가능)

### 2.7.0
* PG: 우선순위(순차) 결제 빌링키 조회 `lookupSequentialBillingKey(widgetKey, billingKey)` 추가 — `GET subscribe/sequential_billing_key/{billing_key}?widget_key={widget_key}`
* Commerce: 수시결제(온디맨드) charge_key 결제/해지 추가 (supervisor 전용)
  - `orderSubscription.supervisorCharge`: `POST order_subscriptions/charge` — charge_key 는 body 로만 전송 (URL/query 금지)
  - `orderSubscription.supervisorChargeRevoke`: `DELETE order_subscriptions/charge` — 해지 후 해당 키로 재결제 불가
  - 두 endpoint 모두 `Idempotency-Key` 헤더 자동 생성 (`idempotency_key` 파라미터로 직접 지정 가능)
* Commerce: 몰 설정 모듈 `mallSetting` 추가 (supervisor 전용)
  - `getMallSetting`/`detail`: `GET mall-setting`
  - `updateMallSetting`/`update`: `PUT mall-setting` — flatten 바디, null/undefined 값은 전송하지 않음
* Commerce: 요청별로 지정된 `BOOTPAY-ROLE` 헤더를 인터셉터가 덮어쓰지 않도록 수정 (supervisor 전용 endpoint 대응, 미지정시 기존 동작 그대로)

### 2.6.0
* 인증: client_key/secret_key Basic Auth 지원 (PG + Commerce 공통)
  - 기존 application_id/private_key Bearer 방식 하위 호환 유지
  - ck/sk 모드에서는 request/token 호출 불필요 (getAccessToken 합성 응답)
  - ck 또는 sk 한쪽만 지정 + legacy 키도 없으면 NEED_CLIENT_KEY(-101) reject
* Commerce: V1 신설 모듈 추가 — category, coupon, point, orderSubscriptionRequest, cart
  - cart.orderPreview: 권위적 배송비/할인 계산 응답 (guest/member 모드)
* Commerce: userGroup URL parity 정정 — `/add_user` → `/user`, `/remove_user` → `/user/{userId}` (서버 routes.rb 와 정렬, 옛 URL 은 서버 미존재)
* Commerce: 서버에 존재하지 않는 endpoint 3종 제거 (`coupon.preview`, `point.previewUsage`, `point.calculateLimit`) — npm 미공개 모듈이라 사용자 영향 없음
* Wallet API (`requestWalletPayment`, `WalletRequestParameters`, `WalletPaymentResponseParameters`) `@deprecated` 표시 — 다음 메이저 버전에서 제거 예정
* `http_status` 응답 필드 `@deprecated` 표시 — 다음 메이저 버전에서 제거 예정 (성공 여부는 `status` 필드 사용)
* 테스트 인프라: `.env` / `BOOTPAY_AUTH_MODE=new|legacy` 토글로 ck/sk · legacy 양쪽 검증, PG 테스트 디렉터리 분리(`test/pg/`)
* docs: CHANGELOG 파일명 오타 정정 (`CHNAGELOG.md` → `CHANGELOG.md`)

### 2.4.1
* Commerce 응답포맷 개선 

### 2.4.0
* Commerce 기능 추가

### 2.3.6

* 본인인증 REST API로 요청시 client_ip 파라메터 필수 추가

### 2.3.5

* walletPayment response type bug fixed

### 2.3.3

* wallet api 추가

### 2.3.2

* 배송등록 api 필드 추가

### 2.3.1

* requestSubscribePayment 함수 추가

### 2.3.0

* 계좌 자동 결제 추가

### 2.1.11

* 필드명 back_username -> bank_username 으로 오타 수정

### 2.1.4

* 날짜 타입을 string -> Date 로 명시적으로 수정

### 2.1.3

* 정기결제요청시 feedback_url, metadata, content_type 파라미터 정의 추가

### 2.1.2

* 버전 재배포

### 2.1.1

* 정기결제 예약시 order_id 파라미터 정의 추가

### 2.1.0

* 결제취소 요청시 refund optional 로 수정

### 2.0.9 ( Stable )

* 네이버페이 포인트, 페이코포인트, 카카오머니, 토스포인트 결제시 리턴되는 포맷 interface 추가 정의

### 2.0.8

* 현금영수증 cash_receipt_data interface 정의

### 2.0.7

* inteface model 정의 parameters 누락 및 optional 체크
* 현금영수증 별건 발행 / 취소 API 추가

### 2.0.6

* SubscriptionBillingResponseParameters interface 누락된 값 추가 ( status, status_locale, gateway_url, method_symbol )

### 2.0.5

* typescript에서 TS7016 root에서 import가 되지 않는 문제 해결

### 2.0.4

* package.json import가 되지 않는 환경 예외처리

### 2.0.3

* 기존 결제 현금영수증 발행
* 별건 현금영수증 발행
* REST API 통신 요청시 Header에 버전 및 SDK 종류 명시 ( 부트페이 서버에서 CS용으로 수집 )

### 2.0.0

새로운 v2 API에 맞도록 수정