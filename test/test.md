# NodeJS SDK 테스트 실행 가이드

## 환경 설정

`test/config.js` 파일에서 환경을 설정합니다:

```javascript
// 'production' 또는 'development'로 설정
const CURRENT_ENV = 'production';
```

## 테스트 실행

### 빌드 먼저 실행
```bash
cd /Users/taesupyoon/bootpay/server/sdk/nodejs
npm run build
```

### 개별 테스트 실행 (pg/ 폴더)
```bash
# 토큰 발급
node test/pg/getAccessToken.js

# 결제 조회
node test/pg/receiptPayment.js

# 결제 승인
node test/pg/confirmPayment.js

# 결제 취소
node test/pg/cancelPayment.js

# 본인인증 조회
node test/pg/certificate.js

# 빌링키 조회 (receipt_id)
node test/pg/lookupSubscribeBilling.js

# 빌링키 조회 (billing_key)
node test/pg/lookupBilling.js

# 우선순위(순차) 결제 빌링키 조회 (widget_key + billing_key)
node test/pg/lookupSequentialBillingKey.js

# 우선순위 빌링키 조회 URL 규약 검증 (네트워크 호출 없음, 키 불필요)
node test/pg/lookupSequentialBillingKeyRequest.js

# 빌링키 삭제
node test/pg/destroySubscribeBillingKey.js

# 카드 정기결제 실행
node test/pg/subscribeCardPayment.js

# 예약 결제
node test/pg/subscribePaymentReserve.js

# 예약 결제 취소
node test/pg/cancelSubscribeReserve.js

# 사용자 토큰 발급
node test/pg/requestUserToken.js

# 에스크로 배송시작
node test/pg/shippingStart.js

# 결제건 현금영수증 발행
node test/pg/cashReceiptPublishOnReceipt.js
```

### Commerce API 테스트
```bash
# Commerce 테스트 실행
node test/commerce/[테스트파일].js

# Authorization 헤더 선택 규칙 검증 (네트워크 호출 없음, 키 불필요)
node test/commerce/authorizationHeader.js

# 수시결제(온디맨드) charge_key 즉시 결제 / 해지 (supervisor 전용)
node test/commerce/orderSubscriptionCharge.js
node test/commerce/orderSubscriptionChargeRevoke.js

# 몰 설정 조회 / 수정 (supervisor 전용)
node test/commerce/mallSettingDetail.js
node test/commerce/mallSettingUpdate.js

# charge_key / 몰 설정 요청 규약 검증 (네트워크 호출 없음, 키 불필요)
node test/commerce/orderSubscriptionChargeRequest.js
node test/commerce/mallSettingRequest.js

# V1 회원 세션 / 상품 / 가맹점 요청 규약 검증 (네트워크 호출 없음, 키 불필요)
node test/commerce/userMallSessionRequest.js
node test/commerce/productMallRequest.js
node test/commerce/storeRequest.js

# Commerce 라우트/동사/헤더 규약 일괄 검증 (네트워크 호출 없음, 키 불필요)
node test/commerce/commerceRouteContract.js

# 외부 uid 중복검사 / 테스트 웹훅 발송
node test/commerce/userUidExist.js
node test/commerce/webhookSendTest.js

# 구독 중도인수 / 이전·승계 요청
node test/commerce/orderSubscriptionPurchase.js
node test/commerce/orderSubscriptionTransfer.js
```

### 알림톡 테스트 실행 (commerce/ 폴더)

⚠️ **알림톡에는 샌드박스가 없다.** 발송·채널등록·템플릿등록·검수요청·웹훅발송은 실제로 나가고 과금된다.
부작용이 있는 테스트는 `BOOTPAY_TEST_ALIMTALK_LIVE=true` 일 때만 실행되고, 아니면 skip 로그만 남긴다.
fixture 는 `.env` 의 `BOOTPAY_TEST_ALIMTALK_*` 키로 주입한다.

```bash
# 발송내역 · 집계 · 단건 결과 (조회 전용)
node test/commerce/alimtalkMessageList.js
node test/commerce/alimtalkMessageStats.js
node test/commerce/alimtalkMessageDetail.js

# 부트페이 공식 템플릿 카탈로그 (조회 전용)
node test/commerce/alimtalkOfficialList.js
node test/commerce/alimtalkOfficialRecommend.js
node test/commerce/alimtalkOfficialDetail.js

# 수신거부 — create/release 는 LIVE 가드
node test/commerce/alimtalkOptoutList.js
node test/commerce/alimtalkOptoutCheck.js
node test/commerce/alimtalkOptoutCreate.js
node test/commerce/alimtalkOptoutRelease.js

# 발송 — ⚠️ 전부 LIVE 가드 (실제 발송·과금)
node test/commerce/alimtalkSend.js
node test/commerce/alimtalkSendBulk.js
node test/commerce/alimtalkSendCancel.js

# 발신프로필(카카오채널) — otp/create/release 는 LIVE 가드
node test/commerce/alimtalkSenderCategories.js
node test/commerce/alimtalkSenderList.js
node test/commerce/alimtalkSenderDetail.js
node test/commerce/alimtalkSenderVariableExamples.js
node test/commerce/alimtalkSenderOtp.js
node test/commerce/alimtalkSenderCreate.js
node test/commerce/alimtalkSenderRelease.js

# 자체 템플릿 — create/update/delete/register/inspect/image 는 LIVE 가드
node test/commerce/alimtalkTemplateList.js
node test/commerce/alimtalkTemplateDetail.js
node test/commerce/alimtalkTemplateExport.js
node test/commerce/alimtalkTemplateCreate.js
node test/commerce/alimtalkTemplateUpdate.js
node test/commerce/alimtalkTemplateDelete.js
node test/commerce/alimtalkTemplateRegister.js
node test/commerce/alimtalkTemplateInspect.js
node test/commerce/alimtalkTemplateImage.js
node test/commerce/alimtalkTemplateHighlightImage.js

# 알림톡 웹훅 — update/test/rotateSecret 은 LIVE 가드
node test/commerce/alimtalkWebhookDetail.js
node test/commerce/alimtalkWebhookDeliveries.js
node test/commerce/alimtalkWebhookUpdate.js
node test/commerce/alimtalkWebhookTest.js
node test/commerce/alimtalkWebhookRotateSecret.js
```

### V1 회원 endpoint 주의

`user.userLogin / userSession / userLogout / userJoin / userJoinCheck` 는 모두 복수형 `users/...` 경로를 사용한다.
단수형 `user/...` 는 commerce-api v1 에 존재하지 않는 죽은 경로다 — 예전 SDK 가 그리로 보내고 있었다.

- 로그인은 `POST /v1/users/login` 이다. `POST /v1/users/session` 은 라우트만 있고 `create` 액션이 없으므로 쓰면 안 된다.
- `userJoin` 과 `join`, `userJoinCheck` 와 `checkExist` 는 같은 endpoint 를 부르지만 서버가 파라미터 조합으로 분기하므로 둘 다 유지한다.

### 라우트 표기 주의

- 언더스코어: `order_subscriptions`, `order_subscription_bills`
- 하이픈: `order-subscription-requests`, `user-groups`
- `requests/ing` 계열은 `resume` 만 `PUT` 이고 나머지(`pause`/`purchase`/`termination`/`transfer`)는 `POST` 다.

### 알림톡 endpoint 주의

- **`BOOTPAY-ROLE` 은 항상 `user`** 다. 알림톡 스코프 키가 전부 `user:alimtalk_*` 라서,
  인스턴스 role 이 `asManager()` 등으로 바뀌어 있어도 알림톡 요청은 `user` 로 고정해 보낸다.
- **`Idempotency-Key` 를 보내지 않는다.** 서버가 이 헤더를 읽지 않으므로, 붙이면 주지 않는 멱등을
  주는 것처럼 보인다. 알림톡의 멱등은 발송의 `ref_id` 로만 성립한다.
- `alimtalkSend.send({ fallback: false })` 의 `false` 는 **미지정과 다르다.** 미지정이면 프로젝트
  기본값을 따르고, `false` 는 문자(LMS) 대체발송을 명시적으로 끈다 — `compact` 가 `false` 를 걷어내면 안 된다.
- `alimtalkOfficial.list({ keyword })` 는 서버 정본 키인 **`q`** 로 나간다.
- `alimtalkTemplate.export({ format: 'csv' })` 는 JSON 파싱 없이 `{ body, content_type }` 을 돌려준다.
  SDK 기본 `format` 은 `json` 이다(서버 기본은 `csv`).
- 알림톡 웹훅(`alimtalkWebhook.*`, `/v1/alimtalk/webhook`)은 주문·구독 통합 웹훅(`webhook.sendTest`,
  `/v1/webhook/test`)과 **완전히 별개 경로**다.
세션이 필요한 호출에는 로그인시 받은 JWT 를 `Bootpay-User-JWT` 헤더로 전달한다.

## 테스트 데이터

`test/config.js`에서 `TEST_DATA` 객체를 통해 테스트 데이터를 관리합니다:

```javascript
const TEST_DATA = {
    receipt_id: '628b2206d01c7e00209b6087',
    receipt_id_confirm: '62876963d01c7e00209b6028',
    receipt_id_cash: '62e0f11f1fc192036b1b3c92',
    receipt_id_escrow: '628ae7ffd01c7e001e9b6066',
    receipt_id_billing: '62c7ccebcf9f6d001b3adcd4',
    receipt_id_transfer: '66541bc4ca4517e69343e24c',
    billing_key: '628b2644d01c7e00209b6092',
    billing_key_2: '66542dfb4d18d5fc7b43e1b6',
    reserve_id: '6490149ca575b40024f0b70d',
    reserve_id_2: '628b316cd01c7e00219b6081',
    user_id: '1234',
    certificate_receipt_id: '61b009aaec81b4057e7f6ecd'
};
```

## 폴더 구조

```
test/
├── config.js           # 환경 설정 및 테스트 데이터
├── test.md             # 테스트 가이드
├── pg/                 # PG API 테스트 (config 사용)
│   ├── getAccessToken.js
│   ├── receiptPayment.js
│   ├── confirmPayment.js
│   └── ...
├── commerce/           # Commerce API 테스트
│   └── ...
└── [기존파일].js       # 기존 테스트 파일 (레거시)
```

## PG 인증 방식 토글 (BOOTPAY_AUTH_MODE)

PG 테스트는 기본적으로 신규 `client_key/secret_key` 방식으로 동작한다. 매 실행 시 환경변수로 레거시 `application_id/private_key` 방식으로 전환할 수 있다.

### 토글 contract

| `BOOTPAY_AUTH_MODE` | 동작 |
|---|---|
| `new` (기본, 미설정 시 동일) | `client_key` + `secret_key` Basic Auth 로 PG 인스턴스 생성. 토큰 발급 호출 불필요. |
| `legacy` | `application_id` + `private_key` 로 PG 인스턴스 생성. 토큰 발급 호출 후 `Bearer` 헤더 사용. |

키 값은 모두 `.env` (또는 환경변수) 로 주입한다 — `.env.example` 참고. 토글만 바꾸고 키는 그대로 둬도 된다.

### 사용법

```bash
# (1) 기본 — env var 생략 (= new)
node test/pg/receiptPayment.js

# (2) 한 번만 legacy 로 전환
BOOTPAY_AUTH_MODE=legacy node test/pg/receiptPayment.js

# (3) 셸 세션 동안 legacy 고정
export BOOTPAY_AUTH_MODE=legacy
node test/pg/receiptPayment.js
node test/pg/cancelPayment.js
unset BOOTPAY_AUTH_MODE   # 끝나면 해제

# (4) 영구 전환 — .env 의 BOOTPAY_AUTH_MODE 값을 legacy 로 바꾸면 셸 export 없이도 동작
```

### 진입 헬퍼 — 어디서 토글이 흡수되는가

`test/config.js` 의 `getActivePgConfig()` 가 `BOOTPAY_AUTH_MODE` 값에 따라 `Bootpay.setConfiguration(...)` 인자 dict 를 반환한다. PG 테스트 파일은 모두 한 줄로 두 모드를 모두 지원한다:

```js
const { getActivePgConfig } = require('../config.js');
Bootpay.setConfiguration(getActivePgConfig());
```

두 모드 모두 `Bootpay.getAccessToken()` 호출은 안전하다 (ck/sk 모드에서는 SDK 내부에서 no-op).

### 실행 시 인증 모드 표시

`getActivePgConfig()` 가 호출될 때마다 stdout 에 한 줄로 어떤 모드가 활성화됐는지 표시된다 — 어떤 키 set 으로 실행됐는지 로그에서 즉시 확인 가능:

```
[BOOTPAY_AUTH_MODE=new] PG: client_key/secret_key (Basic Auth) | env=production
[BOOTPAY_AUTH_MODE=legacy] PG: application_id/private_key (Bearer) | env=production
```

### 토글의 영향을 받지 않는 파일

다음은 한 스크립트 안에서 두 모드를 모두 검증하므로 환경변수에 무관하게 동일한 동작을 한다:

- `test/pg/getAccessToken.js`
- `test/legacyCompatibility.js`
- `test/commerce/authorizationHeader.js` (Commerce — 실제 통신 없이 mock adapter 로 헤더만 검증)
- `test/commerce/commerceRouteContract.js` (Commerce — 실제 통신 없이 mock adapter 로 라우트/동사/role 검증)
