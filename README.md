# Bootpay Server Side Package for Node.js [![alt text](https://cdn.bootpay.co.kr/icon/npm.svg)](https://www.npmjs.com/package/@bootpay/backend-js)

## Bootpay Node.js Server Side Library

부트페이 공식 Node.js 라이브러리 입니다 (서버사이드 용)

node환경에서 작성된 어플리케이션, 프레임워크 등에서 사용가능합니다.

* PG 결제창 연동은 클라이언트 라이브러리에서 수행됩니다. (Javascript, Android, iOS, React Native, Flutter 등)
* 결제 검증 및 취소, 빌링키 발급, 본인인증 등의 수행은 서버사이드에서 진행됩니다. (Java, PHP, Python, Ruby, Node.js, Go, ASP.NET 등)

## 목차
- [PG API 사용하기](#사용하기)
   - [1. 토큰 발급](#1-토큰-발급)
   - [2. 결제 단건 조회](#2-결제-단건-조회)
   - [3. 결제 취소 (전액 취소 / 부분 취소)](#3-결제-취소-전액-취소--부분-취소)
   - [4. 자동/빌링/정기 결제](#4-자동빌링정기-결제)
      - [4-1. 카드 빌링키 발급](#4-1-카드-빌링키-발급)
      - [4-2. 계좌 빌링키 발급](#4-2-계좌-빌링키-발급)
      - [4-3. 결제 요청하기](#4-3-결제-요청하기)
      - [4-4. 결제 예약하기](#4-4-결제-예약하기)
      - [4-5. 예약 조회하기](#4-5-예약-조회하기)
      - [4-6. 예약 취소하기](#4-6-예약-취소하기)
      - [4-7. 빌링키 삭제하기](#4-7-빌링키-삭제하기)
      - [4-8. 빌링키 조회하기](#4-8-빌링키-조회하기)
      - [4-9. 우선순위 결제 빌링키 조회하기](#4-9-우선순위-결제-빌링키-조회하기)
   - [5. 회원 토큰 발급요청](#5-회원-토큰-발급요청)
   - [6. 서버 승인 요청](#6-서버-승인-요청)
   - [7. 본인 인증 결과 조회](#7-본인-인증-결과-조회)
   - [8. 에스크로 이용시 PG사로 배송정보 보내기](#8-에스크로-이용시-pg사로-배송정보-보내기)
   - [9-1. 현금영수증 발행하기](#9-1-현금영수증-발행하기)
   - [9-2. 현금영수증 발행 취소](#9-2-현금영수증-발행-취소)
   - [9-3. 별건 현금영수증 발행](#9-3-별건-현금영수증-발행)
   - [9-4. 별건 현금영수증 발행 취소](#9-4-별건-현금영수증-발행-취소)
- [Commerce API 사용하기](#10-commerce-api)
   - [10-1. Commerce API 초기화](#10-1-commerce-api-초기화)
   - [10-2. 사용자 관리](#10-2-사용자-관리)
   - [10-3. 상품 관리](#10-3-상품-관리)
   - [10-4. 주문 관리](#10-4-주문-관리)
   - [10-5. 정기구독 관리](#10-5-정기구독-관리)
   - [10-6. 청구서 관리](#10-6-청구서-관리)
   - [10-7. 몰 설정 관리](#10-7-몰-설정-관리)
   - [10-8. 쇼핑몰 회원 세션 관리](#10-8-쇼핑몰-회원-세션-관리)
   - [10-9. 가맹점 정보 조회](#10-9-가맹점-정보-조회)
- [Example 프로젝트](#example-프로젝트)
- [Documentation](#documentation)
- [기술문의](#기술문의)
- [License](#license)


## npm으로 설치하기


```
npm install --save @bootpay/backend-js
```


## 환경변수 설정

예제와 테스트는 각 SDK 루트의 `.env` 파일을 우선 읽습니다. 먼저 `.env.example`을 복사한 뒤 필요한 키만 변경하세요. `.env`는 gitignore 처리되어 커밋되지 않습니다.

```bash
cp .env.example .env
# BOOTPAY_ENV=production 또는 development
```

주요 변수:

```env
BOOTPAY_ENV=production
BOOTPAY_PG_CLIENT_KEY_PROD=...
BOOTPAY_PG_SECRET_KEY_PROD=...
BOOTPAY_PG_CLIENT_KEY_DEV=...
BOOTPAY_PG_SECRET_KEY_DEV=...
BOOTPAY_COMMERCE_CLIENT_KEY_PROD=...
BOOTPAY_COMMERCE_SECRET_KEY_PROD=...
BOOTPAY_COMMERCE_CLIENT_KEY_PROD=...
BOOTPAY_COMMERCE_SECRET_KEY_PROD=...
```

변수가 없으면 SDK 테스트용 기본값(NodeJS 기준 ck/sk)으로 fallback 합니다.

# 사용하기

> 권장 인증 방식은 `client_key/secret_key`입니다. 기존 `application_id/private_key` 설정도 하위 호환을 위해 계속 동작합니다. 둘 다 설정된 경우 `client_key/secret_key`가 우선됩니다.

```javascript
// Legacy fallback:
// Bootpay.setConfiguration({
//     application_id: process.env.BOOTPAY_APPLICATION_ID,
//     private_key: process.env.BOOTPAY_PRIVATE_KEY
// })
```

```javascript
import { Bootpay } from "@bootpay/backend-js";

(async () => { 
    Bootpay.setConfiguration({
        client_key: process.env.BOOTPAY_PG_CLIENT_KEY_PROD,
        secret_key: process.env.BOOTPAY_PG_SECRET_KEY_PROD
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.cancelPayment({
            receipt_id: '628b2206d01c7e00209b6087',
            cancel_price: 1000,
            cancel_username: '테스트 사용자',
            cancel_message: '테스트 취소입니다.'
        })
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()
```


## 1. 토큰 발급

부트페이와 서버간 통신을 하기 위해서는 부트페이 서버로부터 토큰을 발급받아야 합니다.  
발급된 토큰은 30분간 유효하며, 최초 발급일로부터 30분이 지날 경우 토큰 발급 함수를 재호출 해주셔야 합니다.

```javascript
(async () => { 
    Bootpay.setConfiguration({
        client_key: process.env.BOOTPAY_PG_CLIENT_KEY_PROD,
        secret_key: process.env.BOOTPAY_PG_SECRET_KEY_PROD
    })
    try {
        let response = await Bootpay.getAccessToken()
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()

```


## 2. 결제 단건 조회
결제창 및 정기결제에서 승인/취소된 결제건에 대하여 올바른 결제건인지 서버간 통신으로 결제검증을 합니다.
```javascript
(async () => {
    const Bootpay = require('@bootpay/backend-js').Bootpay
    Bootpay.setConfiguration({
        client_key: process.env.BOOTPAY_PG_CLIENT_KEY_PROD,
        secret_key: process.env.BOOTPAY_PG_SECRET_KEY_PROD
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.receiptPayment('62b12f4b6262500007629fec')
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()
```

## 3. 결제 취소 (전액 취소 / 부분 취소)
price를 지정하지 않으면 전액취소 됩니다. 
* 휴대폰 결제의 경우 이월될 경우 이통사 정책상 취소되지 않습니다
* 정산받으실 금액보다 취소금액이 클 경우 PG사 정책상 취소되지 않을 수 있습니다. 이때 PG사에 문의하시면 되겠습니다.
* 가상계좌의 경우 CMS 특약이 되어있지 않으면 취소되지 않습니다. 그러므로 결제 테스트시에는 가상계좌로 테스트 하지 않길 추천합니다. 

부분취는 카드로 결제된 건만 가능하며, 일부 PG사만 지원합니다. 요청시 price에 금액을 지정하시면 되겠습니다. 
* (지원가능 PG사: 이니시스, kcp, 다날, 페이레터, 나이스페이, 카카오페이, 페이코)

간혹 개발사에서 실수로 여러번 부분취소를 보내서 여러번 취소되는 경우가 있기때문에, 부트페이에서는 부분취소 중복 요청을 막기 위해 cancel_id 라는 필드를 추가했습니다. cancel_id를 지정하시면, 해당 건에 대해 중복 요청방지가 가능합니다.  
```javascript 
(async () => { 
    Bootpay.setConfiguration({
        client_key: process.env.BOOTPAY_PG_CLIENT_KEY_PROD,
        secret_key: process.env.BOOTPAY_PG_SECRET_KEY_PROD
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.cancelPayment({
            receipt_id: '628b2206d01c7e00209b6087',
            cancel_price: 1000,
            cancel_username: '테스트 사용자',
            cancel_message: '테스트 취소입니다.'
        })
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()
```

## 4. 자동/빌링/정기 결제
## 4-1. 카드 빌링키 발급
REST API 방식으로 고객으로부터 카드 정보를 전달하여, PG사에게 빌링키를 발급받을 수 있습니다. 
발급받은 빌링키를 저장하고 있다가, 원하는 시점, 원하는 금액에 결제 승인 요청하여 좀 더 자유로운 결제시나리오에 적용이 가능합니다.
* 비인증 정기결제(REST API) 방식을 지원하는 PG사만 사용 가능합니다. 
```javascript
(async () => { 
    Bootpay.setConfiguration({
        client_key: process.env.BOOTPAY_PG_CLIENT_KEY_PROD,
        secret_key: process.env.BOOTPAY_PG_SECRET_KEY_PROD
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.requestSubscribeBillingKey({
            pg: '나이스페이',
            order_name: '테스트결제',
            subscription_id: (new Date()).getTime(), 
            card_no: '5570********1074', //카드번호 
            card_pw: '**', //카드 비밀번호 2자리 
            card_identity_no: '******', //카드 소유주 생년월일 6자리 
            card_expire_year: '**', //카드 유효기간 년 2자리 
            card_expire_month: '**', //카드 유효기간 월 2자리 
            user: {
                username: '홍길동',
                phone: '01012345678'
            }
        })
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()
```

## 4-2. 계좌 빌링키 발급
REST API 방식으로 고객의 계좌 정보를 전달하여, PG사에게 빌링키 발급을 요청합니다. 요청 후 빌링키가 바로 발급되진 않고, 출금동의 확인 절차까지 진행해야 빌링키가 발급됩니다.
먼저 빌링키를 요청합니다.
```javascript
(async () => {
   Bootpay.setConfiguration({
      client_key: process.env.BOOTPAY_PG_CLIENT_KEY_PROD,
      secret_key: process.env.BOOTPAY_PG_SECRET_KEY_PROD
   })
   try {
      await Bootpay.getAccessToken()
      const response = await Bootpay.requestSubscribeAutomaticTransferBillingKey({
         pg: '나이스페이',
         order_name: '테스트결제',
         subscription_id: (new Date()).getTime(),
         price: 1000,
         username: '홍길동',
         bank_name: '국민',
         bank_account: '67561234123492472',
         identity_no: '901014',
         cash_receipt_identity_no: '01012341234',
         phone: '01012341234',
         user: {
            username: '홍길동',
            phone: '01012345678'
         }
      })
      console.log(response)
   } catch (e) {
      console.log(e)
   }
})()

```

이후 빌링키 발급 요청시 응답받은 receipt_id로, 출금 동의 확인을 요청합니다.
```javascript
try {
    await Bootpay.getAccessToken()
    const response = await Bootpay.publishAutomaticTransferBillingKey('6655069ca691573f1bb9c28a')
    console.log(response)
} catch (e) {
    console.log(e)
}
```



## 4-3. 결제 요청하기
발급된 빌링키로 원하는 시점에 원하는 금액으로 결제 승인 요청을 할 수 있습니다. 잔액이 부족하거나 도난 카드 등의 특별한 건이 아니면 PG사에서 결제를 바로 승인합니다.

```javascript 
(async () => { 
    Bootpay.setConfiguration({
        client_key: process.env.BOOTPAY_PG_CLIENT_KEY_PROD,
        secret_key: process.env.BOOTPAY_PG_SECRET_KEY_PROD
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.requestSubscribeCardPayment({
            billing_key: '62b3d166cf9f6d001bd20d59',
            order_name: '테스트 결제',
            order_id: (new Date()).getTime(),
            price: 100,
            tax_free: 0
        })
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()
```
## 4-4. 결제 예약하기
발급된 빌링키로 결제를 예약합니다. (빌링키당 최대 10건)
```javascript
(async () => { 
    Bootpay.setConfiguration({
        client_key: process.env.BOOTPAY_PG_CLIENT_KEY_PROD,
        secret_key: process.env.BOOTPAY_PG_SECRET_KEY_PROD
    })
    try {
        // console.log(new Date((new Date()).getTime() + 5000))
        await Bootpay.getAccessToken()
        const response = await Bootpay.subscribePaymentReserve({
            billing_key: '62b3d166cf9f6d001bd20d59',
            order_name: '테스트 결제',
            order_id: (new Date()).getTime(),
            price: 1000,
            reserve_execute_at: new Date((new Date()).getTime() + 5000)
        })
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()
```

## 4-5. 예약 조회하기
예약시 응답받은 reserveId로 예약된 건을 조회합니다.
```javascript
const reserve_id = "5b8f6a4d396fa665fdc2b5ea"
await Bootpay.subscribePaymentReserveLookup(reserve_id)
```


## 4-6. 예약 취소하기
예약시 응답받은 reserveId로 예약된 건을 취소합니다.
```javascript
(async () => { 
    Bootpay.setConfiguration({
        client_key: process.env.BOOTPAY_PG_CLIENT_KEY_PROD,
        secret_key: process.env.BOOTPAY_PG_SECRET_KEY_PROD
    })
    try {
        // console.log(new Date((new Date()).getTime() + 5000))
        await Bootpay.getAccessToken()
        const response = await Bootpay.subscribePaymentReserve({
            billing_key: '62b3d166cf9f6d001bd20d59',
            order_name: '테스트 결제',
            order_id: (new Date()).getTime(),
            price: 1000,
            reserve_execute_at: new Date((new Date()).getTime() + 5000)
        })
        if (response.reserve_id !== undefined) {
            const cancel = await Bootpay.cancelSubscribeReserve(response.reserve_id)
            console.log(cancel)
        }
    } catch (e) {
        console.log(e)
    }
})()
```

## 4-7. 빌링키 삭제하기
발급된 빌링키를 삭제합니다. 삭제하더라도 예약된 결제건은 취소되지 않습니다. 예약된 결제건 취소를 원하시면 예약 취소하기를 요청하셔야 합니다.
```javascript 
(async () => { 
    Bootpay.setConfiguration({
        client_key: process.env.BOOTPAY_PG_CLIENT_KEY_PROD,
        secret_key: process.env.BOOTPAY_PG_SECRET_KEY_PROD
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.destroyBillingKey('62b3d166cf9f6d001bd20d59')
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()
```

## 4-8. 빌링키 조회하기
클라이언트에서 빌링키 발급시, 보안상 클라이언트 이벤트에 빌링키를 전달해주지 않습니다. 그러므로 이 API를 통해 조회해야 합니다.
다음은 빌링키 발급 요청했던 receiptId 로 빌링키를 조회합니다.
```javascript
(async () => { 
    Bootpay.setConfiguration({
        client_key: process.env.BOOTPAY_PG_CLIENT_KEY_PROD,
        secret_key: process.env.BOOTPAY_PG_SECRET_KEY_PROD
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.lookupSubscribeBillingKey('62b3cbbecf9f6d001bd20ce8')
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()
```

아래는 billingKey로 조회합니다.
```javascript
const response = await Bootpay.lookupBillingKey('66542dfb4d18d5fc7b43e1b6')
console.log(response)
```

## 4-9. 우선순위 결제 빌링키 조회하기
우선순위(순차) 결제에 사용되는 빌링키를 위젯키·회원 ID 와 함께 조회합니다.
```javascript
(async () => {
    Bootpay.setConfiguration({
        client_key: process.env.BOOTPAY_PG_CLIENT_KEY_PROD,
        secret_key: process.env.BOOTPAY_PG_SECRET_KEY_PROD
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.lookupSequentialBillingKey('WIDGET_KEY', '66542dfb4d18d5fc7b43e1b6', 'USER_ID')
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()
```


## 5. 회원 토큰 발급요청
ㅇㅇ페이 사용을 위해 가맹점 회원의 토큰을 발급합니다. 가맹점은 회원의 고유번호를 관리해야합니다.
이 토큰값을 기반으로 클라이언트에서 결제요청(payload.user_token) 하시면 되겠습니다.
```javascript
(async () => { 
    Bootpay.setConfiguration({
        client_key: process.env.BOOTPAY_PG_CLIENT_KEY_PROD,
        secret_key: process.env.BOOTPAY_PG_SECRET_KEY_PROD
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.requestUserToken({
            user_id: 'gosomi1',
            phone:'01012345678'
        })
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()
``` 

## 6. 서버 승인 요청 
결제승인 방식은 클라이언트 승인 방식과, 서버 승인 방식으로 총 2가지가 있습니다.

클라이언트 승인 방식은 웹, 앱에서 진행하는 일반적인 방법입니다만, 경우에 따라 서버 승인 방식이 필요할 수 있습니다.

필요한 이유 
1. 100% 안정적인 결제 후 고객 안내를 위해 - 클라이언트에서 PG결제 진행 후 승인 완료될 때 onDone이 수행되지 않아 (인터넷 환경 등), 결제 이후 고객에게 안내하지 못할 수 있습니다  
2. 단일 트랜잭션의 개념이 필요할 경우 - 재고파악이 중요한 커머스를 운영할 경우 트랜잭션 개념이 필요할 수 있겠으며, 이를 위해서는 서버 승인을 사용해야 합니다. 

```javascript
(async () => { 
    Bootpay.setConfiguration({
        client_key: process.env.BOOTPAY_PG_CLIENT_KEY_PROD,
        secret_key: process.env.BOOTPAY_PG_SECRET_KEY_PROD
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.confirmPayment('62876963d01c7e00209b6028')
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()
```

## 7. 본인 인증 결과 조회 
다날 본인인증 후 결과값을 조회합니다. 
다날 본인인증에서 통신사, 외국인여부, 전화번호 이 3가지 정보는 다날에 추가로 요청하셔야 받으실 수 있습니다.
```javascript
(async () => { 
    Bootpay.setConfiguration({
        client_key: process.env.BOOTPAY_PG_CLIENT_KEY_PROD,
        secret_key: process.env.BOOTPAY_PG_SECRET_KEY_PROD
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.certificate('625783a6cf9f6d001d0aed19')
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()
```


8. (에스크로 이용시) PG사로 배송정보 보내기
현금 거래에 한해 구매자의 안전거래를 보장하는 방법으로, 판매자와 구매자의 온라인 전자상거래가 원활하게 이루어질 수 있도록 중계해주는 매매보호서비스입니다. 국내법에 따라 전자상거래에서 반드시 적용이 되어 있어야합니다. PG에서도 에스크로 결제를 지원하며, 에스크로 결제 사용을 원하시면 PG사 가맹시에 에스크로결제를 미리 얘기하고나서 진행을 하시는 것이 수월합니다.

PG사로 배송정보( 이니시스, KCP만 지원 )를 보내서 에스크로 상태를 변경하는 API 입니다.
```javascript
(async () => { 
    Bootpay.setConfiguration({
        client_key: process.env.BOOTPAY_PG_CLIENT_KEY_PROD,
        secret_key: process.env.BOOTPAY_PG_SECRET_KEY_PROD
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.shippingStart({
            receipt_id: "62a9379ad01c7e001f7dc1f3",
            tracking_number: '123456',
            delivery_corp: 'CJ대한통운',
            user: {
                username: '테스트',
                phone: '01000000000',
                address: '서울특별시 종로구',
                zipcode: '08490'
            }
        })
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()
```

## 10. Commerce API

부트페이 Commerce API를 사용하여 사용자, 상품, 주문, 정기구독 등을 관리할 수 있습니다.

### 10-1. Commerce API 초기화

```javascript
const { BootpayCommerce } = require('@bootpay/backend-js')

const commerce = new BootpayCommerce({
    client_key: process.env.BOOTPAY_COMMERCE_CLIENT_KEY_PROD,
    secret_key: process.env.BOOTPAY_COMMERCE_SECRET_KEY_PROD,
    mode: 'production' // 'production' | 'development' | 'stage'
})

// 토큰 발급
await commerce.getAccessToken()
```

### 10-2. 사용자 관리

```javascript
// 사용자 목록 조회 — 회원등급 필터는 membership_type 입니다 (구 이름 member_type 도 계속 지원)
const users = await commerce.user.list({ page: 1, limit: 10, membership_type: 2 })

// 사용자 상세 조회
const user = await commerce.user.detail('USER_ID')

// 회원가입
const newUser = await commerce.user.join({
    login_id: 'test@example.com',
    login_pw: 'password123',
    name: '홍길동',
    email: 'test@example.com',
    phone: '010-1234-5678'
})

// 사용자 정보 수정
const updatedUser = await commerce.user.update({
    user_id: 'USER_ID',
    name: '수정된 이름'
})
```

### 10-3. 상품 관리

```javascript
// 상품 목록 조회
const products = await commerce.product.list({ page: 1, limit: 10 })

// 상품 생성
const product = await commerce.product.create({
    name: '테스트 상품',
    price: 10000,
    description: '상품 설명'
})

// 상품 상세 조회 — 회원 JWT 를 넘기면 회원 컨텍스트로 조회합니다
const productDetail = await commerce.product.detail('PRODUCT_ID')

// 상품 수정
const updatedProduct = await commerce.product.update({
    product_id: 'PRODUCT_ID',
    name: '수정된 상품명',
    price: 15000
})
```

### 10-4. 주문 관리

```javascript
// 주문 목록 조회
const orders = await commerce.order.list({ page: 1, limit: 10 })

// 주문 상세 조회
const order = await commerce.order.detail('ORDER_ID')

// 월별 주문 조회
const monthOrders = await commerce.order.month('USER_GROUP_ID', '2024-12')
```

### 10-5. 정기구독 관리

```javascript
// 정기구독 목록 조회
const subscriptions = await commerce.orderSubscription.list()

// 주문번호로 구독 계약 역조회
const byOrderNumber = await commerce.orderSubscription.list({ order_number: 'ORDER_NUMBER' })

// 정기구독 상세 조회
const subscription = await commerce.orderSubscription.detail('ORDER_SUBSCRIPTION_ID')

// 정기구독 일시정지
await commerce.orderSubscription.pause({
    order_subscription_id: 'ORDER_SUBSCRIPTION_ID',
    pause_days: 30,
    reason: '일시정지 사유'
})

// 정기구독 재개
await commerce.orderSubscription.resume({
    order_subscription_id: 'ORDER_SUBSCRIPTION_ID'
})

// 정기구독 해지
await commerce.orderSubscription.termination({
    order_subscription_id: 'ORDER_SUBSCRIPTION_ID',
    reason: '해지 사유'
})

// 수시결제(온디맨드) charge_key 즉시 결제 — supervisor 전용
// charge_key 는 body 로만 전송됩니다 (URL/query 금지 — 액세스 로그 노출 방지)
await commerce.asSupervisor().orderSubscription.supervisorCharge({
    charge_key: 'CHARGE_KEY',
    price: 1000,
    tax_free_price: 0,
    user: { id: 'USER_ID' },
    metadata: { memo: '수시결제' }
})

// 수시결제(온디맨드) charge_key 해지 — 해지 이후 해당 키로의 재결제는 불가능합니다
await commerce.asSupervisor().orderSubscription.supervisorChargeRevoke({
    charge_key: 'CHARGE_KEY'
})
```

### 10-6. 청구서 관리

```javascript
// 청구서 목록 조회 — 응답은 { list, count } 구조이며 limit 기본값은 24 입니다.
const invoices = await commerce.invoice.list()
const filtered = await commerce.invoice.list({
    page: 1,
    limit: 24,
    keyword: '청구서',
    cs_type: 'CS_TYPE',
    user_id: 'USER_ID',
    product_type: 1,
    css_at: '2024-01-01',
    cse_at: '2024-12-31'
})

// 청구서 상세 조회
const invoiceDetail = await commerce.invoice.detail('INVOICE_ID')

// 청구서 생성
const invoice = await commerce.invoice.create({
    user_id: 'USER_ID',
    amount: 50000,
    title: '청구서 제목'
})

// 청구서 알림 재발송 — send_types 를 생략하면 서버가 빈 배열로 처리합니다.
// ⚠️ 실제 고객에게 알림이 발송되므로 테스트 호출에 주의하세요.
await commerce.invoice.notify('INVOICE_ID', [1, 2]) // 1: SMS, 2: Email
```

### 10-6-1. 테스트 웹훅 발송

등록된 웹훅 URL 로 테스트 페이로드를 보내 연동을 확인합니다.

```javascript
await commerce.webhook.sendTest()
await commerce.webhook.sendTest({ header_content_type: 1 })
```

### 10-7. 몰 설정 관리

supervisor scope 토큰(또는 키)으로만 호출할 수 있습니다.

```javascript
// 몰 설정 조회
const mallSetting = await commerce.mallSetting.getMallSetting()

// 몰 설정 수정 — 전달한 값(non-null)만 서버로 전송됩니다
await commerce.mallSetting.updateMallSetting({
    name: '부트페이몰',
    description: '몰 소개',
    use_cart: true,
    cart_max_limit: 100,
    use_point: true,
    point_rate: 1
})
```

### 10-8. 쇼핑몰 회원 세션 관리

쇼핑몰(Mall) 회원 API 입니다. 단수형 `user/...` 경로를 사용하며, 외부 회원 연동용 `users/...` API(`user.login`, `user.join`, `user.checkExist`)와는 별개의 endpoint 입니다.

```javascript
// 회원가입 — 전달한 값(non-null)만 서버로 전송되며, corporate_type 미지정시 0(개인)
await commerce.user.userJoin({
    login_id: 'test_user@example.com',
    password: 'password123',
    name: '테스트 사용자',
    email: 'test_user@example.com',
    phone: '010-1234-5678'
})

// 회원가입 중복 확인 — email-exist, id-exist, phone-exist, group-business-number-exist
await commerce.user.userJoinCheck('email-exist', 'test_user@example.com')

// 로그인
const login = await commerce.user.userLogin({
    login_id: 'test_user@example.com',
    password: 'password123'
})

// 세션 조회 / 로그아웃 — 로그인시 발급받은 회원 JWT 를 Bootpay-User-JWT 헤더로 전달합니다
await commerce.user.userSession(userJwt)
await commerce.user.userLogout(userJwt)

// 회원 JWT 를 넘기면 상품 조회에도 회원 컨텍스트가 적용됩니다
await commerce.product.products({ page: 1, limit: 20, category_id: 'CATEGORY_ID', user_jwt: userJwt })
await commerce.product.productDetail('PRODUCT_ID', userJwt)
await commerce.product.detail('PRODUCT_ID', userJwt) // productDetail 과 동작이 같습니다

// 외부 UID 로 상품 찾기
await commerce.product.products({ ex_uid: 'EX_UID' })
```

### 10-9. 가맹점 정보 조회

```javascript
// 가맹점 기본 정보
const store = await commerce.store.getStore()

// 가맹점 상세 정보
const storeDetail = await commerce.store.getStoreDetail()
```

더 자세한 Commerce API 사용 예제는 [test/commerce](./test/commerce) 디렉토리를 참고해주세요.

## Example 프로젝트

[적용한 샘플 프로젝트](https://github.com/bootpay/backend-python-example)을 참조해주세요

## Documentation

[부트페이 개발매뉴얼](https://developer.bootpay.co.kr/)을 참조해주세요

## 기술문의

[부트페이 홈페이지](https://www.bootpay.co.kr) 우측 하단 채팅을 통해 기술문의 주세요!

## License

[MIT License](https://opensource.org/licenses/MIT).

