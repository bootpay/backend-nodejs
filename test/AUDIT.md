# NodeJS SDK 테스트 감사 보고서

기준: `server/nodejs` 2.5.0, `BOOTPAY_ENV=production`, `BOOTPAY_AUTH_MODE=new`.
실행: `test/pg/*.js` (26), `test/commerce/*.js` (61). 최종 갱신: 2026-05-11.

---

## 2026-05-11 진행 상황 (이후 섹션 읽기 전 필독)

- **A 항목 #1~#5 (SDK URL 버그)**: 모두 해결됨.
  - #1, #2 user-group URL 정정 → nodejs 커밋 `ac08d68`, 6 SDK 일괄 전파 (Go `df76c12` / Java `41d6f41` / Python `c225210` / PHP `e45386f` / .NET `1d0cf50` / Ruby `bba7237`).
  - #3, #4, #5 죽은 endpoint (`coupon.preview`, `point.previewUsage`, `point.calculateLimit`) → 메서드 + 타입 + 테스트 파일 완전 삭제 (nodejs `ac08d68`).
  - root 도 submodule pointer + 문서 갱신 (`69dba4d`).
- **B 항목 5 modules 일괄 추가**: category / coupon / point / cart / order-subscription-request → 6 server SDK 에 nodejs 기준으로 propagation 완료 (위 6 SDK 커밋과 동일).
- **새 발견**: dev 환경에서 5 modules endpoint 자체는 존재 확인. 그러나 production 미배포 (404). dev 에서도 `category.list` 만 200, 나머지는 `API_ROLE_NOT_SUPPORT` — user-token 인증 필요한 user-scoped endpoint 로 추정. **백엔드팀 확인 필요.**
- **새 anomaly**: `user.token('USER_ID_HERE')` 응답 메시지가 `INVOICE_TARGET_NOT_FOUND` — placeholder 가 invoice 도메인 에러로 매핑됨. 서버 측 매핑 버그 의심.

---

## 요약

| 영역 | 정상 | 진짜 SDK/백엔드 버그 | 죽은 테스트 | 스테일 데이터 / placeholder |
|---|---:|---:|---:|---:|
| PG (26) | 4 | 2 | 3 | 17 |
| Commerce (61) | 7 | 9 list 타입 mismatch + 14 endpoint 404 (5 modules prod 미배포) + 4 SERVER_ERROR / 매핑 의심 | 0 | 9 role mismatch + 13종 fixture 누락 |

---

## PG 결과 (26)

### ✅ 정상

| 파일 | 비고 |
|---|---|
| `getAccessToken.js` | ck/sk + legacy 둘 다 동작 |
| `legacyCompatibility.js` | 두 모드 호환성 검증 통과 |
| `lookupBilling.js` | 정상 응답 (billing_key, billing_data 등) |
| `receiptPayment.js` | 정상 응답 (receipt 조회) |

### 🐛 진짜 버그 — 백엔드 또는 SDK 수정 필요

| 파일 | ck/sk 결과 | legacy 결과 | 분석 |
|---|---|---|---|
| `requestUserToken.js` | `TOKEN_KEY_INVALID` | ✅ `user_token` 반환 | endpoint `POST request/user/token` 가 Basic Auth (ck/sk) 거부, Bearer 만 허용 |
| `getUserWallets.js` | `TOKEN_KEY_INVALID` | ✅ `[]` 반환 | 동일 — Bearer 만 허용 |

→ **해결안 (택1)**: ① 백엔드가 ck/sk Basic Auth 받도록 수정 ② SDK 가 이 두 endpoint 만 자동으로 Bearer fallback ③ 이 두 endpoint 는 ck/sk 지원 불가로 문서화 후 legacy 강제.

### 🧹 죽은/깨진 테스트 파일 — 삭제 또는 수정

| 파일 | 증상 |
|---|---|
| `form_payment_progress.js` | `ReferenceError: params is not defined` (line 19) |
| `request_payment.js` | 빈 출력 — entry point 없음 |
| `axios_test.js` | 하드코딩된 application_id (`-2410 not found`), config.js 우회 |

### 🗓 스테일 데이터 (SDK 동작 정상, 픽스처 갱신 필요)

| 파일 | 에러 코드 |
|---|---|
| `cancelPayment.js` | `RC_ALREADY_CANCELLED` |
| `confirmPayment.js` | `RC_NOT_CONFIRM_READY` |
| `cancelSubscribeReserve.js` | `SUBSCRIBE_BK_EXPIRED` |
| `destroySubscribeBillingKey.js` | `SUBSCRIBE_BK_EXPIRED` |
| `lookupSubscribeBilling.js` | `RC_NOT_SUBSCRIBE` |
| `subscribeCardPayment.js` | `SUBSCRIBE_BK_EXPIRED` |
| `subscribePayment.js` | `SUBSCRIBE_BK_EXPIRED` |
| `subscribePaymentReserve.js` | `SUBSCRIBE_BK_EXPIRED` |
| `cashReceiptPublishOnReceipt.js` | `RC_NOT_FOUND` |
| `shippingStart.js` | `RC_NOT_ESCROW` |
| `certificate.js` | `AUTH_EXPIRED` |
| `getBillingKey.js` | `RC_INVALID_EXP_MONTH` (테스트 카드 만료월 잘못됨) |
| `requestCashReceipt.js` | `RC_CASH_RECEIPT_FAILED` (PG MID 누락) |
| `publishAutomaticTransferBillingKey.js` | `SUBSCRIBE_PUBLISH_NOT_READY` |
| `requestSubscribeAutomaticTransferBillingKey.js` | `SUBSCRIBE_AT_LOOKUP_USER_FAILED` |
| `authenticateRequestRest.js` | `AUTH_CONFIRM_READY_FAILED` (통신사 정보 불일치) |
| `authenticateRealarmRest.js` | `AUTH_NOT_READY` |

---

## Commerce 결과 (64)

### ✅ 정상 200 OK (7)

| 파일 | 비고 |
|---|---|
| `getAccessToken.js` | ck/sk 정상 발급 |
| `userList.js` | `{ list: [], count: 0 }` ← **타입 불일치** (SDK 선언은 `{ items, total }`) |
| `userGroupList.js` | 동일 |
| `productList.js` | 동일 (2건 데이터 있음) |
| `invoiceList.js` | `{ list, count, user }` ← **타입 불일치 + 추가 필드** |
| `orderList.js` | 동일 mismatch |
| `orderSubscriptionBillList.js` | 동일 mismatch |

### 🐛 SDK 타입 계약 위반 — 모든 list endpoint

| 모듈 | SDK 선언 (`modules/*.ts`) | 실제 서버 응답 |
|---|---|---|
| `user.list` | `Promise<{ items: CommerceUser[]; total: number }>` | `{ list, count }` |
| `userGroup.list` | `Promise<{ items: CommerceUserGroup[]; total: number }>` | `{ list, count }` |
| `product.list` | `Promise<{ items: CommerceProduct[]; total: number }>` | `{ list, count }` |
| `invoice.list` | `Promise<{ items: CommerceInvoice[]; total: number }>` | `{ list, count, user }` |
| `order.list` | `Promise<{ items: CommerceOrder[]; total: number }>` | `{ list, count }` |
| `orderCancel.list` | `Promise<{ items: ...; total }>` | (확인 필요) |
| `orderSubscription.list` | `Promise<{ items: ...; total }>` | `{ count, ing_pause, ing_purchase, ing_resume, ing_termination, ing_transfer, sum_active, sum_auto_end, sum_cancel_request, sum_first_payment_error, sum_hold_on, sum_pause, sum_pending, sum_terminated, sum_trial, total }` ← 통계 포함 풍부한 응답 |
| `orderSubscriptionBill.list` | `Promise<{ items: ...; total }>` | `{ list, count }` |
| `orderSubscriptionRequest.list` | `Promise<{ items: ...; total }>` | 404 |

→ TypeScript 사용자가 `response.data.items` 로 접근 시 `undefined`. 기준 SDK 결정 후 6 SDK 전파 필요.

### 🚫 404 Not Found — production 환경 (2026-05-11 재실행)

| 모듈 | URL | dev 환경 결과 | 비고 |
|---|---|---|---|
| `category.list` | `GET categories` | ✅ 200 (`[]`) | 코드/URL OK. prod 미배포만 |
| `category.create/detail/update/delete` | `POST/GET/PUT/DELETE categories[/:id]` | (미테스트) | 동상 |
| `coupon.list` | `GET coupon` | ❌ `API_ROLE_NOT_SUPPORT` | dev 도 user-token 필요 추정 |
| `coupon.available` | `GET coupon/available` | ❌ 동상 | 동상 |
| `coupon.download` | `POST coupon/download` | (미테스트) | 동상 |
| `point.balance` | `GET point/balance` | ❌ `API_ROLE_NOT_SUPPORT` | user/manager/admin/partner/vendor/supervisor 전부 거부 |
| `point.transactions` | `GET point/transactions` | ❌ 동상 | 동상 |
| `cart.orderPreview` | `POST cart/order-preview` | ❌ 동상 | 동상 |
| `orderSubscriptionRequest.list` | `GET order-subscription-requests` | ❌ 동상 | 동상 |
| ~~`userGroup.userCreate`~~ | ~~`user-groups/{id}/add_user`~~ | — | ✅ 해결: `user-groups/{id}/user` |
| ~~`userGroup.userDelete`~~ | ~~`user-groups/{id}/remove_user`~~ | — | ✅ 해결: `user-groups/{id}/user/{userId}` |
| ~~`coupon.preview`~~ | ~~`POST coupon/preview`~~ | — | ✅ 해결: 메서드+타입+테스트 삭제 |
| ~~`point.previewUsage`~~ | ~~`POST point/preview_usage`~~ | — | ✅ 해결: 동상 |
| ~~`point.calculateLimit`~~ | ~~`POST point/calculate_limit`~~ | — | ✅ 해결: 동상 |

→ **5 modules (category / coupon / point / cart / order-subscription-request)** routes.rb 에는 존재 (2026-04-28~04-29 추가). prod 는 아직 배포 안 됨 → 404. dev 는 endpoint 존재하나 ck/sk + BOOTPAY-ROLE 만으로는 인가 불가 — **user_token 컨텍스트 필요한 user-scoped endpoint 로 추정** (백엔드팀 확인 필요).

### 🔐 API_ROLE_NOT_SUPPORT — manager+ role 필요

| 파일 | 모듈 | 필요 role 추정 |
|---|---|---|
| `orderCancelApprove.js` | `orderCancel.approve` | manager / supervisor |
| `orderCancelReject.js` | `orderCancel.reject` | manager / supervisor |
| `orderCancelRequest.js` | `orderCancel.request` | manager |
| `orderSubscriptionAdjustmentCreate.js` | `orderSubscriptionAdjustment.create` | manager |
| `orderSubscriptionAdjustmentUpdate.js` | `orderSubscriptionAdjustment.update` | manager |
| `orderSubscriptionAdjustmentDelete.js` | `orderSubscriptionAdjustment.delete` | manager |
| `orderSubscriptionUpdate.js` | `orderSubscription.update` | manager |
| `userGroupUserCreate.js` | `userGroup.userCreate` | manager (URL 정정 후 새로 노출됨) |
| `userGroupUserDelete.js` | `userGroup.userDelete` | manager (동상) |

→ 테스트가 `commerce.asManager()` 또는 `.withRole('manager')` 호출해야 함. `config.js` 의 `BOOTPAY_TEST_COMMERCE_ROLE=manager` 환경변수로 일괄 토글 가능 (인프라 이미 있음).

### 🧨 SERVER_ERROR 500 / 매핑 의심 / 검증 에러

| 파일 | error_code | 추정 원인 |
|---|---|---|
| `invoiceNotify.js` | `SERVER_ERROR` | `INVOICE_ID_HERE` placeholder 그대로 전송 |
| `productCreate.js` | `SERVER_ERROR` | multipart/form-data 처리 이슈 가능 |
| `orderSubscriptionList.js` | `SERVER_ERROR` | filter 에 placeholder 문자열 (`user_id: 'USER_ID_HERE'` 등) |
| `orderMonth.js` | `MONTHLY_BILLING_USER_GROUP_ID_INVALID` | `USER_GROUP_ID_HERE` placeholder |
| `userToken.js` | `INVOICE_TARGET_NOT_FOUND` | **🚨 서버 매핑 의심**: token endpoint 인데 invoice 도메인 에러 메시지. `user_id=USER_ID_HERE` placeholder 입력 시 응답. |
| `userJoin.js` | `USER_ID_INVALID` | 가입 가능한 user_id payload 필요 (현재 테스트 페이로드의 ID 형식 미스) |
| `userLogin.js` | `USER_LOGIN_FAILED` | 실제 login_id / login_pw 필요 |
| `userCheckExist.js` | `API_PARAM_INVALID` | param 형식 (`key=login_id&pk=value`) 백엔드 spec 재확인 |
| `userAuthenticationData.js` | `USER_STAND_BY_NOT_FOUND` | `STAND_ID_HERE` placeholder |
| `userGroupCreate.js` | `USER_BUSINESS_NUMBER_BLANK` | corporate_type=1 일 때 business_number 필수 — 테스트 payload 보완 |

### 📦 픽스처 누락 (placeholder 13종)

| Placeholder | 사용 파일 수 |
|---|---|
| `USER_ID_HERE` | 4+ |
| `USER_GROUP_ID_HERE` | 4+ |
| `PRODUCT_ID_HERE` | 5+ |
| `CATEGORY_ID_HERE` | 4 |
| `COUPON_TEMPLATE_ID_HERE` | 1 |
| `INVOICE_ID_HERE` | 2 |
| `ORDER_ID_HERE` | 3 |
| `ORDER_NUMBER_HERE` | 2 |
| `ORDER_SUBSCRIPTION_ID_HERE` | 7+ |
| `ORDER_SUBSCRIPTION_BILL_ID_HERE` | 2 |
| `ORDER_SUBSCRIPTION_ADJUSTMENT_ID_HERE` | 2 |
| `ORDER_CANCEL_REQUEST_HISTORY_ID_HERE` | 3 |
| `STAND_ID_HERE` | 1 |

→ `test/config.js` 의 `COMMERCE_TEST_DATA` 에 env-driven 으로 추가됨 (이번 turn). `.env` 의 `BOOTPAY_TEST_COMMERCE_*` 값을 실제 데이터로 채우고 각 테스트 파일을 `COMMERCE_TEST_DATA.user_id` 식으로 치환해야 실제 통신.

---

## 우선순위 권장 (2026-05-11 최신)

| # | 작업 | 상태 | 영향 범위 | 비고 |
|---:|---|---|---|---|
| ~~1a~~ | A 항목 SDK URL 버그 5건 | ✅ 완료 | nodejs + 6 SDK | 커밋 해시 본문 참조 |
| ~~1b~~ | 5 modules 6 server SDK 일괄 추가 | ✅ 완료 | 6 SDK | nodejs reference parity |
| 2 | list 응답 타입 mismatch 정리 | 미해결 | 9 modules × 7 SDK | 기준 결정 후 6 server SDK 전파. (A) SDK 가 normalize ↔ (B) 타입을 `{ list, count }` 로 수정. |
| 3 | `requestUserToken` / `getUserWallets` ck/sk 거부 | 미해결 | 백엔드 또는 SDK | 백엔드 컨펌 필요 — 두 endpoint 의 Basic Auth 지원 여부. |
| 4 | 5 modules prod 배포 + 인증 모델 확인 | **백엔드 확인 대기** | 백엔드 | (a) prod 배포 일정 (b) user-scoped endpoint 인증 — ck/sk 만으로 가능한지 user_token 필요한지. |
| 5 | `user.token` 응답 매핑 (`INVOICE_TARGET_NOT_FOUND`) | 미해결 | 백엔드 | placeholder user_id 입력 시 invoice 도메인 에러로 매핑됨 — 서버 측 매핑 버그 의심. |
| 6 | role 자동 적용 (orderCancel·orderSubscriptionAdjustment·userGroup.user{Create,Delete}) | 미해결 | 테스트 패턴 | `.asManager()` 호출 또는 `BOOTPAY_TEST_COMMERCE_ROLE=manager` 자동 적용 (인프라 이미 있음). |
| 7 | Commerce 픽스처 ID 실데이터로 채우기 | 미해결 | `.env` only | `COMMERCE_TEST_DATA` 인프라 준비됨. 실 prod 데이터 ID 주입 별도. |
| 8 | 죽은 PG 테스트 파일 3개 정리 | 미해결 | nodejs only | 삭제 또는 수정. |
| 9 | PG 스테일 픽스처 갱신 | 미해결 | nodejs only | 17개 테스트 — billing_key/reserve_id/receipt_id 새 데이터로 교체. |

---

## SDK ↔ commerce-api `config/routes.rb` 대조 (2026-05-11)

대조 대상: `multi-manager/projects/commerce-api/config/routes.rb` 의 `namespace :v1` (base `/v1/`).
SDK 측: `server/nodejs/src/lib/commerce/modules/*.ts` 의 모든 호출 URL.

### A. 실제 SDK URL 버그 (5건) — ✅ **2026-05-11 전체 해결됨**

| # | SDK 모듈 / 메서드 | 이전 URL | 적용된 변경 | 전파 |
|---:|---|---|---|---|
| 1 | `userGroup.userCreate` | `POST user-groups/:id/add_user` | → `POST user-groups/:id/user` | nodejs `ac08d68` + 6 SDK |
| 2 | `userGroup.userDelete` | `DELETE user-groups/:id/remove_user?user_id=X` | → `DELETE user-groups/:id/user/:userId` | 동상 |
| 3 | `coupon.preview` | `POST coupon/preview` | 메서드 + 타입 + 테스트 완전 삭제 | nodejs only (다른 SDK 미구현) |
| 4 | `point.previewUsage` | `POST point/preview_usage` | 동상 | 동상 |
| 5 | `point.calculateLimit` | `POST point/calculate_limit` | 동상 | 동상 |

전파 커밋: Go `df76c12` · Java `41d6f41` · Python `c225210` · PHP `e45386f` · .NET `1d0cf50` · Ruby `bba7237`. root `69dba4d`.

### B. 프로덕션 배포 갭 (SDK 정상, 백엔드 prod 미배포)

routes.rb 에는 존재 (2026-04-28 ~ 04-29 추가). prod 에서 404. **2026-05-11 dev 검증**: endpoint 존재 확인됨 (`category.list` 200 OK, 나머지 `API_ROLE_NOT_SUPPORT` — user-token 인증 필요 추정).

5 modules 모두 **6 server SDK 에 일괄 추가됨 (2026-05-11)** — Go/Java/Python/PHP/.NET/Ruby. nodejs 기준 module 구조 그대로.

| 모듈 | SDK URL | routes.rb 라인 | dev 검증 (2026-05-11) | 추가/변경 시점 |
|---|---|---:|---|---|
| `category.list` | `GET categories` | 320 | ✅ 200 (`[]`) | 2026-04-29 |
| `category.create/detail/update/delete` | `categories[/:id]` | 320 | 미테스트 | 동상 |
| `coupon.list` | `GET coupon` | 296 | ❌ `API_ROLE_NOT_SUPPORT` | V1 Phase A (2026-04-28~) |
| `coupon.available` | `GET coupon/available` | 298 | ❌ 동상 | 동상 |
| `coupon.download` | `POST coupon/download` | 299 | 미테스트 | 동상 |
| `point.balance` | `GET point/balance` | 290 | ❌ 동상 (user/manager/admin/partner/vendor/supervisor 전부 거부) | 동상 |
| `point.transactions` | `GET point/transactions` | 291 | ❌ 동상 | 동상 |
| `cart.orderPreview` | `POST cart/order-preview` | 276 | ❌ 동상 | 동상 |
| `orderSubscriptionRequest.list/detail/update` | `order-subscription-requests[/:id]` | 317 | ❌ 동상 | 동상 |

→ **백엔드팀 확인 필요**:
1. prod 배포 일정 (코드는 6 SDK 전파 완료 — 배포만 되면 즉시 동작).
2. user-scoped endpoint 인증 모델 — `coupon/point/cart/order-subscription-requests` 가 ck/sk + BOOTPAY-ROLE 만으로 인가되는지, 아니면 `user_token` 컨텍스트가 추가로 필요한지.

### C. 매칭 OK (참고)

다음은 routes.rb 와 일치하여 SDK 변경 불필요:

- `users/login`, `users/login/token`, `users/authenticate/:id`, `users` CRUD, `users/:id/token`
- `user-groups` CRUD, `user-groups/:id/limit`, `user-groups/:id/aggregate-transaction`
- `invoices` CRUD, `invoices/:id/notify`
- `products` CRUD, `products/:id/status`
- `orders` list/detail, `orders/month`
- `order/cancel` list/create + `:id/withdraw|approve|reject`
- `order_subscriptions` CRUD + `:id/approve|reject|terminate|pause|resume`
- `order_subscriptions/:id/adjustments` (POST/PUT/DELETE)
- `order_subscriptions/requests/ing/{pause,resume,termination,calculate_termination_fee}`
- `order_subscription_bills` list/detail/update
- `store`, `store/detail`

### D. 의존 검증 필요

| 항목 | 현재 SDK 동작 | 확인 사항 |
|---|---|---|
| `user.checkExist` → `GET users/join/:key?pk=:value` | 정상 200 (테스트 시) | routes 의 `resources :join` 가 show route 만 제공 — `:key` 가 path param 으로 정상 해석되는지 컨트롤러 측 검증 권장. |
| `PG: requestUserToken` ck/sk 거부 | TOKEN_KEY_INVALID | PG 측 (`api.bootpay.co.kr/v2`) routes 는 별도. Commerce routes.rb 와 무관. PG 백엔드팀 별도 확인. |

### 권장 조치 순서

1. **A 항목 (#1~5)** — SDK 코드 수정. 다른 6 server SDK 에도 동일 URL 수정 전파.
2. **B 항목** — 백엔드팀 prod 배포 확정 후 테스트 재실행. SDK 변경 불필요.
3. **D 항목** — 컨트롤러/PG routes 별도 확인.

---

## 실행 환경

```
node 25.6.1
@bootpay/backend-js 2.5.0
BOOTPAY_ENV=production (재실행 시 BOOTPAY_ENV=development 로 dev 검증 일부 포함)
BOOTPAY_AUTH_MODE=new (ck/sk Basic Auth)
실행일: 2026-05-11 (최종 갱신)
```

## 2026-05-11 commerce/*.js 재실행 결과 요약

총 61 파일. 모두 syntax/load OK. 실제 서버 응답 기준:

- ✅ 200 success (7): `getAccessToken`, `invoiceList`, `orderList`, `orderSubscriptionBillList`, `productList`, `userGroupList`, `userList`
- 🚫 404 (prod 미배포, 14): `cartOrderPreview` · category 5건 · coupon 3건 · point 2건 · `orderSubscriptionRequestList`
- 🔐 `API_ROLE_NOT_SUPPORT` (9): orderCancel 3건 + orderSubscriptionAdjustment 3건 + `orderSubscriptionUpdate` + userGroup.user 2건
- 📦 placeholder fixture (21): USER_NOT_FOUND / ORDER_NOT_FOUND / PRODUCT_NOT_FOUND / USER_GROUP_NOT_FOUND / ORDER_SUBSCRIPTION_*_NOT_FOUND / INVOICE_*_NOT_FOUND
- 🧨 기타 (10): SERVER_ERROR 3건 + 매핑 의심·검증 에러 7건 — 본문 D 표 참조
