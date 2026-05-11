# NodeJS SDK 테스트 감사 보고서

기준: `server/nodejs` 2.5.0, `BOOTPAY_ENV=production`, `BOOTPAY_AUTH_MODE=new`.
실행: `test/pg/*.js` (26), `test/commerce/*.js` (64).

---

## 요약

| 영역 | 정상 | 진짜 SDK/백엔드 버그 | 죽은 테스트 | 스테일 데이터 / placeholder |
|---|---:|---:|---:|---:|
| PG (26) | 4 | 2 | 3 | 17 |
| Commerce (64) | 7 | 9 list 타입 mismatch + 7 endpoint 404 + 3 500 | 0 | 7 role mismatch + 13종 fixture 누락 |

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

### 🚫 404 Not Found — 전 role (user/manager/supervisor/vendor/partner) 동일

| 모듈 | URL | 비고 |
|---|---|---|
| `category.*` | `categories` (GET/POST/PUT/DELETE) | 모든 CRUD |
| `coupon.list` | `coupon` | |
| `coupon.available` | `coupon/available` | |
| `coupon.preview` | `coupon/preview` | |
| `coupon.download` | `coupon/download` | |
| `point.balance` | `point/balance` | |
| `point.transactions` | `point/transactions` | |
| `point.previewUsage` | `point/preview_usage` | |
| `point.calculateLimit` | `point/calculate_limit` | |
| `cart.orderPreview` | `cart/order-preview` | |
| `userGroup.userCreate` | `user-groups/{id}/add_user` | |
| `userGroup.userDelete` | `user-groups/{id}/remove_user` | |
| `orderSubscriptionRequest.list` | `order_subscriptions/requests` | |

→ Production 미배포 / URL prefix 오류 / 다른 base 가능성. **백엔드 확인 필요.**

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

→ 테스트가 `commerce.asManager()` 또는 `.withRole('manager')` 호출해야 함.

### 🧨 SERVER_ERROR 500

| 파일 | 추정 원인 |
|---|---|
| `invoiceNotify.js` | `INVOICE_ID_HERE` placeholder 그대로 전송 |
| `productCreate.js` | multipart/form-data 처리 이슈 가능 |
| `orderSubscriptionList.js` | filter 에 placeholder 문자열 (`user_id: 'USER_ID_HERE'` 등) |

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

## 우선순위 권장

| # | 작업 | 영향 범위 | 비고 |
|---:|---|---|---|
| 1 | list 응답 타입 mismatch 정리 | 9 modules × 7 SDK | 기준 결정 후 다른 6 server SDK 전파. (A) SDK 가 normalize ↔ (B) 타입을 `{ list, count }` 로 수정. |
| 2 | `requestUserToken` / `getUserWallets` ck/sk 거부 | 백엔드 또는 SDK | 백엔드 컨펌 필요 — 두 endpoint 의 Basic Auth 지원 여부. |
| 3 | 404 endpoint 7개 그룹 | 백엔드 | category/coupon/point/cart 등 prod 배포 여부 확인. |
| 4 | role 자동 적용 (orderCancel·orderSubscriptionAdjustment) | 테스트 패턴 | `.asManager()` 호출 또는 SDK 가 endpoint 별 자동 role 선택. |
| 5 | Commerce 픽스처 ID 실데이터로 채우기 | `.env` only | 이번 turn `COMMERCE_TEST_DATA` 인프라만 준비됨. 실제 prod 환경 데이터 ID 주입은 별도. |
| 6 | 죽은 PG 테스트 파일 3개 정리 | nodejs only | 삭제 또는 수정. |
| 7 | PG 스테일 픽스처 갱신 | nodejs only | 17개 테스트 — billing_key/reserve_id/receipt_id 새 데이터로 교체. |

---

## SDK ↔ commerce-api `config/routes.rb` 대조 (2026-05-11)

대조 대상: `multi-manager/projects/commerce-api/config/routes.rb` 의 `namespace :v1` (base `/v1/`).
SDK 측: `server/nodejs/src/lib/commerce/modules/*.ts` 의 모든 호출 URL.

### A. 실제 SDK URL 버그 (5건) — SDK 수정 필요

| # | SDK 모듈 / 메서드 | SDK URL | 실제 라우트 (routes.rb) | 비고 |
|---:|---|---|---|---|
| 1 | `userGroup.userCreate` | `POST user-groups/:id/add_user` | `POST user-groups/:user_group_id/user` (line 89-92) | `namespace :user_groups do; scope '/:user_group_id' do; resources :user end end` → 컨트롤러는 `users#create`. body 의 `user_id` 그대로 전달 가능. |
| 2 | `userGroup.userDelete` | `DELETE user-groups/:id/remove_user?user_id=X` | `DELETE user-groups/:user_group_id/user/:id` (line 92) | RESTful — query param 대신 path 의 `:id` 로 전달. |
| 3 | `coupon.preview` | `POST coupon/preview` | (없음) — line 296 comment "@updated: 26-04-30 - preview 폐기" | `resources :coupon` (singular, user) 에서 제거됨. plural `coupons/preview` (line 143) 는 다른 scope. |
| 4 | `point.previewUsage` | `POST point/preview_usage` | (없음) — line 289 comment 로 제거됨 | `namespace :point` 는 balance / transactions 만 남음. |
| 5 | `point.calculateLimit` | `POST point/calculate_limit` | (없음) — 동상 | 동상. |

### B. 프로덕션 배포 갭 (SDK 정상, 백엔드 prod 미배포)

routes.rb 에는 존재 (최근 추가/이관). prod 에서 404 → dev 에서 200/401 확인됨.

| 모듈 | SDK URL | routes.rb 라인 | 추가/변경 시점 |
|---|---|---:|---|
| `category.*` (CRUD) | `categories`, `categories/:id` | 320 | 2026-04-29 |
| `coupon.list` | `coupon` | 296 | V1 Phase A (2026-04-28~) |
| `coupon.available` | `coupon/available` | 298 | 동상 |
| `coupon.download` | `coupon/download` | 299 | 동상 |
| `point.balance` | `point/balance` | 290 | 동상 |
| `point.transactions` | `point/transactions` | 291 | 동상 |
| `cart.orderPreview` | `cart/order-preview` | 276 | 동상 |
| `orderSubscriptionRequest.list/detail/update` | `order-subscription-requests`, `.../:id` | 317 | 동상 |

→ **백엔드팀에 prod 배포 일정 확인 필요.** 배포 후 자동으로 통과.

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
BOOTPAY_ENV=production
BOOTPAY_AUTH_MODE=new (ck/sk Basic Auth)
실행일: 2026-05-11
```
