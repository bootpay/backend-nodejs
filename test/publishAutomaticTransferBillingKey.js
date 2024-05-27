(async () => {
    const Bootpay = require('../dist/bootpay.js').Bootpay
    Bootpay.setConfiguration({
        application_id: '5b8f6a4d396fa665fdc2b5ea',
        private_key: 'rm6EYECr6aroQVG2ntW0A6LpWnkTgP4uQ3H18sDDUYw='
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.publishAutomaticTransferBillingKey('6655069ca691573f1bb9c28a')
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()

/*
{
  receipt_id: '6655069ca691573f1bb9c28a',
  subscription_id: '1716848284697',
  gateway_url: 'https://gw.bootpay.co.kr',
  metadata: {},
  pg: '나이스페이먼츠',
  method: '계좌자동이체',
  method_symbol: 'automatic_transfer_rest',
  method_origin: '계좌자동이체',
  method_origin_symbol: 'automatic_transfer_rest',
  published_at: '2024-05-28T07:35:43+09:00',
  requested_at: '2024-05-28T07:18:04+09:00',
  status_locale: '빌링키발급완료',
  status: 11,
  receipt_data: {
    receipt_id: '66550abf3324a61b141f9205',
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
    method: '계좌이체',
    method_symbol: 'bank',
    method_origin: '계좌자동이체',
    method_origin_symbol: 'automatic_transfer_rest',
    purchased_at: '2024-05-28T07:35:43+09:00',
    requested_at: '2024-05-28T07:18:04+09:00',
    status_locale: '결제완료',
    currency: 'KRW',
    receipt_url: 'https://door.bootpay.co.kr/receipt/WjdGUkxNWE5KTngyWlJVdFFodzM1VEdiUGtsNzBzUlJWalU9LS02dDFRVjRl%0ARFdFS0I2T1cwLS1TTjNsUHFMenlTcTFwOUVCdVZGcTBnPT0%3D%0A',
    status: 1,
    bank_data: {
      tid: '6073543098',
      bank_code: '004',
      bank_name: '국민',
      bank_account: '0000000000000000',
      bank_username: '윤태*'
    }
  },
  billing_key: '66550abf3324a61b141f9206',
  billing_data: {
    bank_name: '국민',
    bank_code: '004',
    bank_account: '0000000000000000',
    username: '윤태*'
  },
  billing_expire_at: '2099-12-31T23:59:59+09:00'
}

 */
