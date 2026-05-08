### 2.5.0
* 인증: client_key/secret_key Basic Auth 지원 (PG + Commerce 공통)
  - 기존 application_id/private_key Bearer 방식 하위 호환 유지
  - ck/sk 모드에서는 request/token 호출 불필요 (getAccessToken 합성 응답)
  - ck 또는 sk 한쪽만 지정 + legacy 키도 없으면 NEED_CLIENT_KEY(-101) reject
* Commerce: V1 신설 모듈 추가 — category, coupon, point, orderSubscriptionRequest, cart
  - cart.orderPreview: 권위적 배송비/할인 계산 응답 (guest/member 모드)
* Wallet API (`requestWalletPayment`, `WalletRequestParameters`, `WalletPaymentResponseParameters`) `@deprecated` 표시 — 다음 메이저 버전에서 제거 예정
* `http_status` 응답 필드 `@deprecated` 표시 — 다음 메이저 버전에서 제거 예정 (성공 여부는 `status` 필드 사용)
* 테스트 인프라: `.env` / `BOOTPAY_AUTH_MODE=new|legacy` 토글로 ck/sk · legacy 양쪽 검증, PG 테스트 디렉터리 분리(`test/pg/`)

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