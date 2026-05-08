/**
 * SDK 테스트용 설정 파일
 */
const fs = require('fs');
const path = require('path');

function loadDotEnv() {
    const candidates = [
        path.resolve(__dirname, '..', '.env'),
        path.resolve(__dirname, '.env')
    ];
    for (const file of candidates) {
        if (!fs.existsSync(file)) continue;
        const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const idx = trimmed.indexOf('=');
            if (idx < 0) continue;
            const key = trimmed.slice(0, idx).trim();
            let value = trimmed.slice(idx + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            if (process.env[key] === undefined) process.env[key] = value;
        }
    }
}

loadDotEnv();

const env = (key, fallback) => process.env[key] || fallback;

// 현재 환경: 'production' 또는 'development'
const CURRENT_ENV = env('BOOTPAY_ENV', 'production');

// PG 인증 방식: 'new' (client_key/secret_key) 또는 'legacy' (application_id/private_key)
// 매 실행 시 BOOTPAY_AUTH_MODE 환경변수로 토글한다.
const AUTH_MODE = (env('BOOTPAY_AUTH_MODE', 'new') || 'new').toLowerCase();

// PG API 키 (반드시 .env 또는 환경변수로 주입; .env.example 참고)
const PG_CREDENTIALS = {
    production: {
        mode: 'production',
        client_key: env('BOOTPAY_PG_CLIENT_KEY_PROD', ''),
        secret_key: env('BOOTPAY_PG_SECRET_KEY_PROD', '')
    },
    development: {
        mode: 'development',
        client_key: env('BOOTPAY_PG_CLIENT_KEY_DEV', ''),
        secret_key: env('BOOTPAY_PG_SECRET_KEY_DEV', '')
    }
};

// PG API legacy application_id/private_key 인증 (호환성 검증용)
const PG_LEGACY_CREDENTIALS = {
    production: {
        mode: 'production',
        application_id: env('BOOTPAY_PG_APPLICATION_ID_PROD', ''),
        private_key: env('BOOTPAY_PG_PRIVATE_KEY_PROD', '')
    },
    development: {
        mode: 'development',
        application_id: env('BOOTPAY_PG_APPLICATION_ID_DEV', ''),
        private_key: env('BOOTPAY_PG_PRIVATE_KEY_DEV', '')
    }
};

// Commerce API 키 (반드시 .env 또는 환경변수로 주입; .env.example 참고)
const COMMERCE_CREDENTIALS = {
    production: {
        mode: 'production',
        client_key: env('BOOTPAY_COMMERCE_CLIENT_KEY_PROD', ''),
        secret_key: env('BOOTPAY_COMMERCE_SECRET_KEY_PROD', '')
    },
    development: {
        mode: 'development',
        client_key: env('BOOTPAY_COMMERCE_CLIENT_KEY_DEV', ''),
        secret_key: env('BOOTPAY_COMMERCE_SECRET_KEY_DEV', '')
    }
};

// 테스트 데이터
const TEST_DATA = {
    receipt_id: '628b2206d01c7e00209b6087',
    receipt_id_confirm: '62876963d01c7e00209b6028',
    // receipt_id_confirm: '69fd7187564d1f550535538c',
    receipt_id_cash: '62e0f11f1fc192036b1b3c92',
    receipt_id_escrow: '628ae7ffd01c7e001e9b6066',
    receipt_id_billing: '62c7ccebcf9f6d001b3adcd4',
    receipt_id_transfer: '66541bc4ca4517e69343e24c',
    billing_key: '628b2644d01c7e00209b6092',
    billing_key_2: '66542dfb4d18d5fc7b43e1b6',
    reserve_id: '6490149ca575b40024f0b70d',
    reserve_id_2: '628b316cd01c7e00219b6081',
    user_id: '1234',
    certificate_receipt_id: '69fd7187564d1f550535538c'
};

function normalizeEnv(targetEnv) {
    return targetEnv || CURRENT_ENV;
}

function getPgKeys(targetEnv) {
    return PG_CREDENTIALS[normalizeEnv(targetEnv)] || PG_CREDENTIALS.production;
}

function getPgLegacyKeys(targetEnv) {
    return PG_LEGACY_CREDENTIALS[normalizeEnv(targetEnv)] || PG_LEGACY_CREDENTIALS.production;
}

function getCommerceKeys(targetEnv) {
    return COMMERCE_CREDENTIALS[normalizeEnv(targetEnv)] || COMMERCE_CREDENTIALS.production;
}

// AUTH_MODE 에 따라 setConfiguration 에 그대로 넘길 수 있는 PG config 를 반환한다.
//   BOOTPAY_AUTH_MODE=new    → { client_key, secret_key, mode }
//   BOOTPAY_AUTH_MODE=legacy → { application_id, private_key, mode }
function getActivePgConfig(targetEnv) {
    const env = normalizeEnv(targetEnv);
    if (AUTH_MODE === 'legacy') {
        console.log(`[BOOTPAY_AUTH_MODE=legacy] PG: application_id/private_key (Bearer) | env=${env}`);
        const k = getPgLegacyKeys(env);
        return { application_id: k.application_id, private_key: k.private_key, mode: k.mode };
    }
    console.log(`[BOOTPAY_AUTH_MODE=new] PG: client_key/secret_key (Basic Auth) | env=${env}`);
    const k = getPgKeys(env);
    return { client_key: k.client_key, secret_key: k.secret_key, mode: k.mode };
}

module.exports = {
    CURRENT_ENV,
    AUTH_MODE,
    PG_CREDENTIALS,
    PG_LEGACY_CREDENTIALS,
    COMMERCE_CREDENTIALS,
    TEST_DATA,
    getPgKeys,
    getPgLegacyKeys,
    getActivePgConfig,
    getCommerceKeys
};
