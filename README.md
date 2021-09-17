# Bootpay Server Rest Client [![alt text](https://cdn.bootpay.co.kr/icon/npm.svg)](https://www.npmjs.com/package/@bootpay/server-rest-client)




## 샘플 코드 
### NPM으로 다운 받은 경우
```nodejs 
const RestClient = require('@bootpay/server-rest-client').RestClient

// or

import { RestClient } from '@bootpay/server-rest-client'

RestClient.setConfig(
    '59bfc738e13f337dbd6ca48a',
    'pDc0NwlkEX3aSaHTp/PPL/i8vn5E/CqRChgyEp/gHD0=',
    'development'
)
RestClient.getAccessToken().then(
    function(response) {
        console.log(response)
    }, function(e) {
        console.log(e)
    }
)
});
```
### github으로 바로 다운 받은 경우

먼저 패키지를 모두 설치합니다
```bash
yarn install 
```

이후 빌드를 해서 dist로 js로 컴파일 합니다.
```bash
npm run build
```

그리고 dist로 output 된 패키지를 상대 경로로 가져와서 사용합니다.
```nodejs 
const RestClient = require('./dist/bootpay').RestClient

// or

import { RestClient } from './dist/bootpay'

RestClient.setConfig(
    '59bfc738e13f337dbd6ca48a',
    'pDc0NwlkEX3aSaHTp/PPL/i8vn5E/CqRChgyEp/gHD0=',
    'development'
)
RestClient.getAccessToken().then(
    function(response) {
        console.log(response)
    }, function(e) {
        console.log(e)
    }
)
});