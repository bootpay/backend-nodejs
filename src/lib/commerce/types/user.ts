import { ListParams, CommerceAddress } from './common'

export interface CommerceUserGroupRef {
    user_group_id?: string
    name?: string
}

export interface CommerceUser {
    user_id?: string
    created_at?: string
    updated_at?: string

    // 고객 유형
    membership_type?: number

    // 고객 정보
    name?: string
    phone?: string
    email?: string
    tel?: string
    nickname?: string
    bank_username?: string
    bank_account?: string
    bank_code?: string
    comment?: string

    // 최종상태
    count?: number
    status?: number

    // 개인 고객
    gender?: number
    birth?: string
    individual_extension?: Record<string, any>

    // 쇼핑몰 회원
    login_id?: string
    login_pw?: string
    login_type?: number

    group_tags?: string[]
    metadata?: Record<string, any>

    // 인증정보
    auth_sms?: boolean
    auth_phone?: boolean
    auth_email?: boolean
    ci?: string
    cd?: string

    join_at?: string
    join_confirm_type?: number
    lasted_at?: string

    // 약관 동의
    marketing_accept_type?: number
    marketing_accept_create_at?: string
    marketing_accept_update_at?: string
    term_ids?: string[]

    group?: CommerceUserGroupRef

    external_uid?: string
    is_external?: string
    user_group_id?: string
}

export interface UserListParams extends ListParams {
    /** 회원등급. 서버(v1/users_controller#index)가 읽는 정식 키다 */
    membership_type?: number
    /** @deprecated membership_type 의 구 이름. 지정하면 membership_type 으로 매핑해 전송한다 */
    member_type?: number
    type?: string
}

export interface UserTokenResponse {
    access_token?: string
    expired_at?: string
    user?: CommerceUser
}

export interface UserLoginResponse {
    access_token?: string
    expired_at?: string
    user?: CommerceUser
}

/**
 * 회원 로그인 파라미터 (V1 API)
 * POST /v1/users/login
 */
export interface MallUserLoginParams {
    login_id: string
    password: string
    // 0: 개인, 1: 사업자
    corporate_type?: number
    idempotency_key?: string
}

/**
 * 회원가입 파라미터 (V1 API)
 * POST /v1/users/join
 */
export interface MallUserJoinParams {
    login_id: string
    password: string
    name: string
    email?: string
    phone?: string
    nickname?: string
    gender?: number
    birth?: string
    // 0: 개인, 1: 사업자
    corporate_type?: number
    group?: Record<string, any>
    idempotency_key?: string
}

/**
 * 회원가입 중복 확인 타입 (V1 API)
 * GET /v1/users/join/{type}
 */
export type MallUserJoinCheckType =
    | 'email-exist'
    | 'id-exist'
    | 'phone-exist'
    | 'uid-exist'
    | 'group-business-number-exist'

/**
 * 회원 세션 조회 응답 (V1 API)
 */
export interface MallUserSessionResponse {
    user?: CommerceUser
    access_token?: string
    expired_at?: string
}
