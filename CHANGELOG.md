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