const { Bootpay } = require('../../dist/bootpay.js');
const { getPgKeys, getPgLegacyKeys } = require('../config.js');

(async () => {
    // 1) client_key/secret_key 경로 — Option A no-op 검증 (HTTP 호출 없이 합성 응답)
    const ck = getPgKeys();
    Bootpay.setConfiguration({
        client_key: ck.client_key,
        secret_key: ck.secret_key,
        mode: ck.mode
    });
    try {
        const response = await Bootpay.getAccessToken();
        console.log('[ck/sk]', response);
        if (response.access_token !== '' || response.expire_in !== 0) {
            console.error('[ck/sk] expected synthetic empty response');
        }
    } catch (e) {
        console.log('[ck/sk] ERR', e);
    }

    // 2) legacy application_id/private_key 경로 — 실제 request/token 호출 + Bearer 토큰 발급 검증
    const legacy = getPgLegacyKeys();
    Bootpay.setConfiguration({
        application_id: legacy.application_id,
        private_key: legacy.private_key,
        mode: legacy.mode
    });
    try {
        const response = await Bootpay.getAccessToken();
        console.log('[legacy]', response);
        if (!response.access_token || response.expire_in <= 0) {
            console.error('[legacy] expected real access_token + positive expire_in');
        }
    } catch (e) {
        console.log('[legacy] ERR', e);
    }
})();
