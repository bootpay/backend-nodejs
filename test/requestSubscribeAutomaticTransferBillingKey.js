(async () => {
    const Bootpay = require('../dist/bootpay.js').Bootpay
    Bootpay.setConfiguration({
        application_id: '5b8f6a4d396fa665fdc2b5ea',
        private_key: 'rm6EYECr6aroQVG2ntW0A6LpWnkTgP4uQ3H18sDDUYw='
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

/*
{
  receipt_id: '6655069ca691573f1bb9c28a',
  order_id: '1716848284697',
  price: 1000,
  tax_free: 0,
  cancelled_price: 0,
  cancelled_tax_free: 0,
  order_name: '테스트결제',
  company_name: '윤태섭',
  gateway_url: 'https://gw.bootpay.co.kr',
  metadata: {},
  sandbox: true,
  pg: '나이스페이먼츠',
  method: '계좌자동이체',
  method_symbol: 'automatic_transfer_rest',
  method_origin: '계좌자동이체',
  method_origin_symbol: 'automatic_transfer_rest',
  requested_at: '2024-05-28T07:18:04+09:00',
  status_locale: '자동결제빌링키발급이전',
  currency: 'KRW',
  status: 41
}

 */