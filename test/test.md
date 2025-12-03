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
```

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
