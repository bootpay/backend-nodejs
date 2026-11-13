// @deprecated
// (async () => {
//     const Bootpay = require('../../dist/bootpay').Bootpay
//     Bootpay.setConfig(
//         process.env.BOOTPAY_APPLICATION_ID,
//         process.env.BOOTPAY_PRIVATE_KEY
//     )
//     const token = await Bootpay.getAccessToken()
//     if (token.status === 200) {
//         let result
//         try {
//             result = await Bootpay.requestPayment({
//                 pg: 'kcp',
//                 method: 'card',
//                 orderId: (new Date).getTime(),
//                 price: 1000,
//                 itemName: '테스트 부트페이 상품',
//                 returnUrl: 'https://dev-api.bootpay.co.kr/callback',
//                 extra: {
//                     expire: 30
//                 }
//             })
//         } catch (e) {
//             return console.log(e)
//         }
//         console.log(result)
//     }
// })()