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