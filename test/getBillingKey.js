(async () => {
    const Bootpay = require('../dist/bootpay.js').Bootpay
    Bootpay.setConfiguration({
        application_id: '5b8f6a4d396fa665fdc2b5ea',
        private_key: 'rm6EYECr6aroQVG2ntW0A6LpWnkTgP4uQ3H18sDDUYw='
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