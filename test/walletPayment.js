(async () => {
    const Bootpay = require('../dist/bootpay.js').Bootpay
    Bootpay.setConfiguration({
        application_id: '5b8f6a4d396fa665fdc2b5ea',
        private_key: 'rm6EYECr6aroQVG2ntW0A6LpWnkTgP4uQ3H18sDDUYw='
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.requestWalletPayment({
            user_id: 'bootpay',
            order_name: '테스트 결제',
            order_id: (new Date()).getTime(),
            price: 100,
            sandbox: true,
            user: {
                phone: '01012341234',
                username: '홍길동',
                email: 'test@bootpay.co.kr'
            }
        })
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()