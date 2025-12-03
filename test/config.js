/**
 * SDK 테스트용 설정 파일
 */

// 현재 환경: 'production' 또는 'development'
const CURRENT_ENV = 'production';

// PG API 키
const PG_CREDENTIALS = {
    production: {
        application_id: '5b8f6a4d396fa665fdc2b5ea',
        private_key: 'rm6EYECr6aroQVG2ntW0A6LpWnkTgP4uQ3H18sDDUYw='
    },
    development: {
        application_id: '59bfc738e13f337dbd6ca48a',
        private_key: 'pDc0NwlkEX3aSaHTp/PPL/i8vn5E/CqRChgyEp/gHD0='
    }
};

// Commerce API 키
const COMMERCE_CREDENTIALS = {
    production: {
        client_key: 'sEN72kYZBiyMNytA8nUGxQ',
        secret_key: 'rnZLJamENRgfwTccwmI_Uu9cxsPpAV9X2W-Htg73yfU='
    },
    development: {
        client_key: 'hxS-Up--5RvT6oU6QJE0JA',
        secret_key: 'r5zxvDcQJiAP2PBQ0aJjSHQtblNmYFt6uFoEMhti_mg='
    }
};

// 테스트 데이터
const TEST_DATA = {
    receipt_id: '628b2206d01c7e00209b6087',
    receipt_id_confirm: '62876963d01c7e00209b6028',
    receipt_id_cash: '62e0f11f1fc192036b1b3c92',
    receipt_id_escrow: '628ae7ffd01c7e001e9b6066',
    receipt_id_billing: '62c7ccebcf9f6d001b3adcd4',
    receipt_id_transfer: '66541bc4ca4517e69343e24c',
    billing_key: '628b2644d01c7e00209b6092',
    billing_key_2: '66542dfb4d18d5fc7b43e1b6',
    reserve_id: '6490149ca575b40024f0b70d',
    reserve_id_2: '628b316cd01c7e00219b6081',
    user_id: '1234',
    certificate_receipt_id: '61b009aaec81b4057e7f6ecd'
};

// PG API 키 가져오기
function getPgKeys() {
    return PG_CREDENTIALS[CURRENT_ENV];
}

// Commerce API 키 가져오기
function getCommerceKeys() {
    return COMMERCE_CREDENTIALS[CURRENT_ENV];
}

module.exports = {
    CURRENT_ENV,
    PG_CREDENTIALS,
    COMMERCE_CREDENTIALS,
    TEST_DATA,
    getPgKeys,
    getCommerceKeys
};
