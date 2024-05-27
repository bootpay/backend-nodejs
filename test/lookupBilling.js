(async () => {
    const Bootpay = require('../dist/bootpay.js').Bootpay
    Bootpay.setConfiguration({
        application_id: '5b8f6a4d396fa665fdc2b5ea',
        private_key: 'rm6EYECr6aroQVG2ntW0A6LpWnkTgP4uQ3H18sDDUYw='
    })
    try {
        await Bootpay.getAccessToken()
        const response = await Bootpay.lookupBillingKey('66542dfb4d18d5fc7b43e1b6')
        console.log(response)
    } catch (e) {
        console.log(e)
    }
})()

/*
{
  billing_key: '66542dfb4d18d5fc7b43e1b6',
  pg: '나이스페이먼츠',
  method: '계좌자동이체',
  method_symbol: 'automatic_transfer_rest',
  billing_data: {
    bank_name: '국민',
    bank_code: '004',
    bank_account: '0000000000000000',
    username: '윤태*'
  },
  version: 2,
  sandbox: 1,
  expire_at: '2099-12-31T23:59:59+09:00',
  published_at: '2024-05-27T15:53:47+09:00',
  status: 1
}
 */