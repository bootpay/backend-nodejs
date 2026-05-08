// (legacy) 이 파일은 레거시 application_id/private_key + Promise then() 체인 예제다.
// ck/sk 모드에서는 getAccessToken() 호출이 불필요하며, 매 요청 Basic Auth 헤더로
// 직접 인증된다. 신규 코드는 await 패턴으로 토큰 호출 없이 바로 결제/조회 API를 호출하면 된다.
const { Bootpay } = require('../../dist/bootpay.js');

Bootpay.setConfiguration({
    client_key: '[[ Client Key ]]',
    secret_key: '[[ Server Key ]]'
});
// Legacy fallback:
// Bootpay.setConfiguration({
//     application_id: '[[ REST용 Application ID ]]',
//     private_key: '[[ Private Key ]]'
// });

// POST로 Params를 받아서 처리
// params가 POST로 전달된 Object라고 가정하면

switch (params.act) {
    case 'cancel':
        // 결제창 닫을 때 이벤트
        break;
    case 'error':
        // 결제 진행중 에러가 났을 때
        // params.message로 데이터 전달
        break;
    case 'confirm':
        Bootpay.getAccessToken().then(function (tokenData) {
            // 부트페이 서버에서 토큰값을 제대로 가져온 경우
            if (tokenData.status === 200) {
                Bootpay.verify(params.receipt_id).then(
                    function (verify) {
                        // 원래 요청했던 금액과 일치하거나
                        // 결제 승인 전 상태라면 결제 승인 요청을 한다. ( 승인전 상태는 status 값이 2 입니다. )
                        if (verify.status === 200 && verify.price == originPrice && verify.data.status === 2) {
                            // 결제 승인한다.
                            Bootpay.submit(params.receipt_id).then(
                                function (response) {
                                    // 서버에서 REST API로 승인 후 200 OK를 받았다면
                                    // 결제가 완료 처리를 한다.
                                    if (response.status === 200) {
                                        console.log(response.data);
                                    }
                                }
                            )
                        }
                    }
                );
            }
        });

        break;
}
